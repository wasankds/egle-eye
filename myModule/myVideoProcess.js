

/* 

- ใช้ process เดียว (rpicam-vid --codec mjpeg ...) สำหรับทั้ง stream MJPEG ไป client และบันทึกไฟล์ .mjpeg พร้อมกัน
- ตัดไฟล์ใหม่ทุก 1 นาที, จำกัดจำนวนไฟล์ไม่เกิน 100 ไฟล์ (ลบไฟล์เก่าสุดอัตโนมัติ)
- ประหยัด resource ไม่ต้อง encode ซ้ำ

สรุปทางเลือก:
stream MJPEG + บันทึก MJPEG (ที่ทำอยู่): ดูสดบนเว็บได้, ดูย้อนหลังต้องแปลงไฟล์
stream h264 + บันทึก h264: ดูย้อนหลังด้วย VLC ได้, แต่ browser ดูสดไม่ได้ (ต้องใช้ player ที่รองรับ h264 stream เช่น ffplay, VLC)
stream h264 แล้วแปลงเป็น MJPEG ใน Node.js: ใช้ resource สูงขึ้น (ต้อง decode h264 → jpeg ทุก frame)
ใช้ ffmpeg/gstreamer เป็น multiplexer: ซับซ้อนขึ้น, แต่สามารถแยก stream และบันทึกจาก source เดียวได้

*/



import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

// MJPEG stream relay + record h264 + auto wrap to mp4

let streamProcess = null;
let streamClients = [];
let fileStream = null;
let fileStartTime = 0;
let currentFilename = null;
let recording = true;
const videoWidth = '1280';
const videoHeight = '720';
const videoFrameRate = '10';
const files_maxCount = 100;
const recordingDurationMs = 1 * 60 * 1000; // 1 นาทีต่อไฟล์


// H264 stream relay + record h264 file (process เดียว ประหยัด resource)

function startH264StreamAndRecord() {
  if (streamProcess) return;
  if (process.platform !== 'linux') return;
  if (!fs.existsSync(global.folderVideos)) {
    fs.mkdirSync(global.folderVideos, { recursive: true });
    console.log('Created videos folder:', global.folderVideos);
  }
  startNewProcessAndFile();
}

function startNewProcessAndFile() {
  // ปิด process/stream/clients เดิมถ้ามี
  if (streamProcess) {
    try { streamProcess.kill('SIGTERM'); } catch {}
    streamProcess = null;
  }
  if (fileStream) {
    try { fileStream.end(); } catch {}
    fileStream = null;
  }
  // ปิด client ทุกคน (ให้ reconnect ใหม่)
  streamClients.forEach(res => { try { res.end(); } catch {} });
  streamClients = [];

  currentFilename = `${myDateTime.now_name()}.h264`;
  fileStream = fs.createWriteStream(path.join(global.folderVideos, currentFilename));
  fileStartTime = Date.now();
  console.log('Start new video file:', currentFilename);

  streamProcess = spawn('rpicam-vid', [
    '-t', '0',
    '--width', videoWidth,
    '--height', videoHeight,
    '--codec', 'h264',
    '--framerate', videoFrameRate,
    '-o', '-'
  ]);

  streamProcess.stdout.on('data', (data) => {
    if (fileStream) fileStream.write(data);
    streamClients.forEach(res => {
      if (!res.writableEnded) res.write(data);
    });
    // เช็คเวลาตัดไฟล์ใหม่
    if (Date.now() - fileStartTime > recordingDurationMs) {
      startNewProcessAndFile();
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
  streamProcess.on('exit', () => {
    streamProcess = null;
    if (fileStream) fileStream.end();
    streamClients.forEach(res => { try { res.end(); } catch {} });
    streamClients = [];
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



// สำหรับ stream H264 ไป client (เช่น VLC, ffplay)

export function addH264Client(res) {
  // ถ้าไม่มี process ให้เริ่มใหม่ (กรณี client แรก)
  if (!streamProcess) startH264StreamAndRecord();
  streamClients.push(res);
  res.on('close', () => {
    streamClients = streamClients.filter(r => r !== res);
    if (streamClients.length === 0 && streamProcess) {
      try { streamProcess.kill('SIGINT'); } catch {}
      streamProcess = null;
      if (fileStream) { try { fileStream.end(); } catch {} }
      fileStream = null;
    }
  });
}