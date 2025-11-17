



import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

// MJPEG stream relay + record h264 + auto wrap to mp4
let streamProcess = null;
let streamClients = [];
let lastFrame = null;
let recording = true;
const videoWidth = '1280';
const videoHeight = '720';
const videoFrameRate = '10';
const videoWidth_stream = '640';
const videoHeight_stream = '480';
const videoFrameRate_stream = '5';
const files_maxCount = 100;
const recordingDurationMs = 1 * 60 * 1000; // 1 นาทีต่อไฟล์
const ffmpegPath = 'ffmpeg'; // ต้องติดตั้ง ffmpeg ใน PATH


// MJPEG stream relay (ใช้ process เดียวสำหรับ stream)
function startMjpegStreamRelay() {
  if (streamProcess) return;
  if (process.platform !== 'linux') return;
  streamProcess = spawn('rpicam-vid', [
    '-t', '0',
    // '--width', videoWidth.toString(),
    // '--height', videoHeight.toString(),        
    '--width', videoWidth_stream,
    '--height', videoHeight_stream,
    // '--rotate', '180',
    '--codec', 'mjpeg',
    '--framerate', videoFrameRate_stream,
    '-o', '-'
  ]);
  let buffer = Buffer.alloc(0);
  streamProcess.stdout.on('data', (data) => {
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
    streamClients.forEach(res => res.end());
    streamClients = [];
  });
}

// บันทึก h264 แล้ว wrap เป็น mp4
function startRecordH264() {
  if (!recording) return;
  if (process.platform !== 'linux') return;
  const filename = `${myDateTime.now_name()}`;
  const h264path = path.join(global.folderVideos, filename + '.h264');
  const mp4path = path.join(global.folderVideos, filename + '.mp4');
  const h264Stream = fs.createWriteStream(h264path);
  const recordProcess = spawn('rpicam-vid', [
    '-t', recordingDurationMs.toString(),
    '--width', videoWidth,
    '--height', videoHeight,
    '--codec', 'h264',
    '--framerate', videoFrameRate,
    '-o', '-'
  ]);
  recordProcess.stdout.on('data', (data) => {
    h264Stream.write(data);
  });
  recordProcess.on('exit', () => {
    h264Stream.end();    
    // wrap h264 to mp4 (ไม่ re-encode)
    const ffmpeg = spawn(ffmpegPath, ['-y', '-framerate', '10', '-i', h264path, '-c', 'copy', mp4path]);
    ffmpeg.on('exit', () => {
      // ลบไฟล์ h264 ต้นฉบับ
      fs.unlink(h264path, () => {});
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
      // เริ่มไฟล์ใหม่ถ้ายังต้องการบันทึก
      if (recording) setTimeout(startRecordH264, 1000);
    });
  });
}

// เริ่มอัตโนมัติเมื่อเปิดระบบ
if (process.platform === 'linux') {
  setTimeout(() => {
    startMjpegStreamRelay();
    startRecordH264();
  }, 3000);
}



//==============================================
// cleanup ตอนปิดระบบ
function cleanup() {
  recording = false;
  if (videoProcess && !videoProcess.killed) {
    try {
      videoProcess.kill('SIGTERM');
      console.log('rpicam-vid process killed (exit/terminate)');
    } catch (err) {
      console.log('Error killing rpicam-vid:', err.message);
    }
  }
  if (fileStream) {
    fileStream.end();
    fileStream = null;
  }
  process.exit();
}
process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('exit', cleanup);



// สำหรับ stream MJPEG ไป client
export function addMjpegClient(res) {
  streamClients.push(res);
  // ส่ง frame ล่าสุดทันที (ลดอาการจอดำ)
  if (lastFrame) {
    res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${lastFrame.length}\r\n\r\n`);
    res.write(lastFrame);
    res.write('\r\n');
  }
  res.on('close', () => {
    streamClients = streamClients.filter(r => r !== res);
    if (streamClients.length === 0 && streamProcess) {
      streamProcess.kill('SIGINT');
      streamProcess = null;
    }
  });
}