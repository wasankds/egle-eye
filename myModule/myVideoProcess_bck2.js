
/* 

- ใช้ process เดียว (rpicam-vid --codec mjpeg ...) สำหรับทั้ง stream MJPEG ไป client และบันทึกไฟล์ .mjpeg พร้อมกัน
- ตัดไฟล์ใหม่ทุก 1 นาที, จำกัดจำนวนไฟล์ไม่เกิน 100 ไฟล์ (ลบไฟล์เก่าสุดอัตโนมัติ)
- ประหยัด resource ไม่ต้อง encode ซ้ำ

*/



import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

// MJPEG stream relay + record h264 + auto wrap to mp4
let streamProcess = null;
let streamClients = [];
let lastFrame = null;
let recording = true;
const videoWidth = '640';
const videoHeight = '480';
const videoFrameRate = '5';
const files_maxCount = 100;
const recordingDurationMs = 1 * 60 * 1000; // 1 นาทีต่อไฟล์

// MJPEG stream relay + record mjpeg file (process เดียว ประหยัด resource)
function startMjpegStreamAndRecord() {
  if (streamProcess) return;
  if (process.platform !== 'linux') return;
  let fileStream = null;
  let fileStartTime = Date.now();
  let currentFilename = null;
  streamProcess = spawn('rpicam-vid', [
    '-t', '0',
    '--width', videoWidth,
    '--height', videoHeight,
    '--codec', 'mjpeg',
    '--framerate', videoFrameRate,
    '-o', '-'
  ]);
  let buffer = Buffer.alloc(0);
  function startNewFile() {
    if (fileStream) fileStream.end();
    currentFilename = `${myDateTime.now_name()}.mjpeg`;
    fileStream = fs.createWriteStream(path.join(global.folderVideos, currentFilename));
    fileStartTime = Date.now();
  }
  startNewFile();
  streamProcess.stdout.on('data', (data) => {
    // เขียนลงไฟล์
    if (fileStream) fileStream.write(data);
    // แยก frame ส่งให้ stream
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
    // เช็คเวลาตัดไฟล์ใหม่
    if (Date.now() - fileStartTime > recordingDurationMs) {
      startNewFile();
      // จำกัดจำนวนไฟล์ mjpeg
      fs.readdir(global.folderVideos, (err, files) => {
        if (!err) {
          const videoFiles = files.filter(f => f.endsWith('.mjpeg'));
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
  streamProcess.on('exit', () => {
    streamProcess = null;
    if (fileStream) fileStream.end();
    streamClients.forEach(res => res.end());
    streamClients = [];
  });
}

// เริ่มอัตโนมัติเมื่อเปิดระบบ
if (process.platform === 'linux') {
  setTimeout(() => {
    startMjpegStreamAndRecord();
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