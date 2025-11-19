
import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

// MJPEG stream relay (from h264) + record h264 + auto wrap to mp4

// MJPEG stream relay + record h264 + auto wrap to mp4

let streamProcess = null; // rpicam-vid (h264)
let ffmpegProcess = null; // ffmpeg (h264->MJPEG)
let streamClients = [];
let lastFrame = null;
let recording = true; // เปิดปิดการบันทึก - ห้ามลบ
const videoWidth = process.env.VIDEO_WIDTH || '640';
const videoHeight = process.env.VIDEO_HEIGHT || '480';
const videoFrameRate = process.env.VIDEO_FRAMERATE || '10';
const files_maxCount = 500;
const recordingDurationMs = 5*60*1000; // 5 นาทีต่อไฟล์


// MJPEG stream relay (from h264) + record h264 file (process เดียว)
function startH264StreamAndRecord() {
  if (streamProcess) return;
  if (process.platform !== 'linux') return;
  let fileStream = null;
  let fileStartTime = Date.now();
  let currentFilename = null;
  let ffmpegReady = false;

  function startNewFile() {
    if (fileStream) fileStream.end();
    currentFilename = `${myDateTime.now_name()}.h264`;
    fileStream = fs.createWriteStream(path.join(global.folderVideos, currentFilename));
    fileStartTime = Date.now();
  }
  startNewFile();

  // rpicam-vid encode h264 - live stream
  streamProcess = spawn('rpicam-vid', [
    '-t', '0',
    '--width', videoWidth,
    '--height', videoHeight,
    '--codec', 'h264',
    '--framerate', videoFrameRate,
    '-o', '-'
  ]);

  // ffmpeg: h264 (stdin) -> MJPEG (stdout)
  ffmpegProcess = spawn('ffmpeg', [
    '-hide_banner',
    '-loglevel', 'error',
    '-f', 'h264',
    '-i', 'pipe:0',
    '-f', 'mjpeg',
    '-q:v', '5', // quality (lower=better)
    '-r', videoFrameRate,
    'pipe:1'
  ]);

  // pipe rpicam-vid stdout to both file and ffmpeg stdin
  streamProcess.stdout.on('data', (data) => {
    if (fileStream) fileStream.write(data);
    if (ffmpegProcess && ffmpegProcess.stdin.writable) {
      ffmpegProcess.stdin.write(data);
    }
    // check for file split
    if (Date.now() - fileStartTime > recordingDurationMs) {
      startNewFile();
      // จำกัดจำนวนไฟล์ h264
      fs.readdir(global.folderVideos, (err, files) => {
        if (!err) {
          const videoFiles = files.filter(f => f.endsWith('.h264'));
          if (videoFiles.length > files_maxCount) {
            videoFiles.sort();
            const oldestFile = videoFiles[0];
            if (oldestFile) {
              fs.unlink(path.join(global.folderVideos, oldestFile), err => {
                if (err) console.error(`Error deleting file ${oldestFile}:`, err);
                else console.log(`Deleted oldest video file: ${oldestFile}`);
              });
            }
          }
        }
      });
    }
  });

  // รับ MJPEG จาก ffmpeg แล้วส่งให้ client
  let buffer = Buffer.alloc(0);
  ffmpegProcess.stdout.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);
      lastFrame = frame;
      streamClients.forEach(res => {
        res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
        res.write(frame);
        res.write('\r\n');
      });
      buffer = buffer.slice(end + 2);
    }
  });

  streamProcess.on('exit', () => {
    streamProcess = null;
    if (fileStream) fileStream.end();
    if (ffmpegProcess && ffmpegProcess.stdin) ffmpegProcess.stdin.end();
    streamClients.forEach(res => res.end());
    streamClients = [];
  });
  ffmpegProcess.on('exit', () => {
    ffmpegProcess = null;
  });
}

// เริ่มอัตโนมัติเมื่อเปิดระบบ
if (process.platform === 'linux') {
  setTimeout(() => {
    startH264StreamAndRecord();
  }, 3000);
}



//==============================================
// cleanup ตอนปิดระบบ
function cleanup() {
  recording = false;
  if (streamProcess && !streamProcess.killed) {
    try {
      streamProcess.kill('SIGTERM');
      console.log('streamProcess killed (exit/terminate)');
    } catch (err) {
      console.log('Error killing streamProcess:', err.message);
    }
  }
  process.exit();
}
process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('exit', cleanup);



// สำหรับ stream MJPEG ไป client
// ไปแก้ที่ cameraRouter.js ด้วย - ใช้ addMjpegClient
export function addMjpegClient(res) {
  // ถ้าไม่มี streamProcess ให้ start ใหม่ (หลัง disconnect หมดแล้วมี client ใหม่)
  if (!streamProcess) {
    startH264StreamAndRecord();
  }
  streamClients.push(res);
  console.log(`o - MJPEG client connected ===> : ${streamClients.length}`);

  // ส่ง frame ล่าสุดทันที (ลดอาการจอดำ)
  if (lastFrame) {
    res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${lastFrame.length}\r\n\r\n`);
    res.write(lastFrame);
    res.write('\r\n');
  }
  res.on('close', () => {
    streamClients = streamClients.filter(r => r !== res);
    console.log(`x - MJPEG client disconnected ===> : ${streamClients.length}`);

    // ถ้าไม่มี client เหลือ ให้หยุด streamProcess (rpicam-vid)
    if (streamClients.length === 0 && streamProcess) {
      try {
        streamProcess.kill('SIGINT');
        streamProcess = null;
        if (ffmpegProcess) {
          ffmpegProcess.kill('SIGINT');
          ffmpegProcess = null;
        }
        console.log('No clients left, stopped rpicam-vid and ffmpeg');
      } catch (err) {
        console.error('Error stopping rpicam-vid/ffmpeg:', err);
      }
    }
  });
}