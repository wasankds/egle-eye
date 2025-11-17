// let recording = true;



import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

let ffmpegProcess = null;
let streamClients = [];
const videoWidth = '1280';
const videoHeight = '720';
const videoFrameRate = '10';
const files_maxCount = 100;
const recordingDurationMs = 1 * 60 * 1000; // 1 นาทีต่อไฟล์
let fileStartTime = 0;
let currentFilename = null;




// ffmpeg multiplexer: stream MJPEG ไป client + save mp4
function startFfmpegMultiplexer() {
  if (ffmpegProcess) return;
  if (process.platform !== 'linux') return;
  if (!fs.existsSync(global.folderVideos)) {
    fs.mkdirSync(global.folderVideos, { recursive: true });
    console.log('Created videos folder:', global.folderVideos);
  }
  startNewFfmpegProcessAndFile();
}

function startNewFfmpegProcessAndFile() {
  if (ffmpegProcess) {
    try { ffmpegProcess.kill('SIGTERM'); } catch {}
    ffmpegProcess = null;
  }
  streamClients.forEach(res => { try { res.end(); } catch {} });
  streamClients = [];

  currentFilename = `${myDateTime.now_name()}.mp4`;
  fileStartTime = Date.now();
  console.log('Start new video file:', currentFilename);

  // rpicam-vid --codec h264 | ffmpeg -i - -c:v copy -f mp4 <file> -f mjpeg pipe:1
  ffmpegProcess = spawn('bash', ['-c',
    `rpicam-vid -t 0 --width ${videoWidth} --height ${videoHeight} --codec h264 --framerate ${videoFrameRate} -o - | ffmpeg -hide_banner -loglevel error -y -i - -c:v copy -f mp4 '${path.join(global.folderVideos, currentFilename)}' -f mjpeg pipe:1`
  ]);

  let buffer = Buffer.alloc(0);
  ffmpegProcess.stdout.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);
      streamClients.forEach(res => {
        res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
        res.write(frame);
        res.write('\r\n');
      });
      buffer = buffer.slice(end + 2);
    }
  });

  // ตัดไฟล์ใหม่เมื่อครบเวลา
  const interval = setInterval(() => {
    if (Date.now() - fileStartTime > recordingDurationMs) {
      clearInterval(interval);
      startNewFfmpegProcessAndFile();
      // จำกัดจำนวนไฟล์ mp4
      fs.readdir(global.folderVideos, (err, files) => {
        if (!err) {
          const videoFiles = files.filter(f => f.endsWith('.mp4'));
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
  }, 1000);

  ffmpegProcess.on('exit', () => {
    ffmpegProcess = null;
    streamClients.forEach(res => { try { res.end(); } catch {} });
    streamClients = [];
  });
}

// เริ่มอัตโนมัติเมื่อเปิดระบบ
if (process.platform === 'linux') {
  setTimeout(() => {
    startFfmpegMultiplexer();
  }, 3000);
}



//==============================================
// cleanup ตอนปิดระบบ
function cleanup() {
  if (ffmpegProcess && !ffmpegProcess.killed) {
    try {
      ffmpegProcess.kill('SIGTERM');
      console.log('ffmpegProcess killed (exit/terminate)');
    } catch (err) {
      console.log('Error killing ffmpegProcess:', err.message);
    }
  }
  process.exit();
}
process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('exit', cleanup);



// สำหรับ stream H264 ไป client (เช่น VLC, ffplay)




// สำหรับ stream MJPEG ไป client (browser, VLC, ffplay)
export function addMjpegClient(res) {
  if (!ffmpegProcess) startFfmpegMultiplexer();
  streamClients.push(res);
  res.on('close', () => {
    streamClients = streamClients.filter(r => r !== res);
    if (streamClients.length === 0 && ffmpegProcess) {
      try { ffmpegProcess.kill('SIGINT'); } catch {}
      ffmpegProcess = null;
    }
  });
}