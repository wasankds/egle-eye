



import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`);

// MJPEG relay + record to file
let videoProcess = null;
let fileStream = null;
let recording = true;
let lastFrame = null;
let frameListeners = [];
const videoWidth = 1280;
const videoHeight = 720;
const recordingDurationMs = 5 * 60 * 1000; // 5 นาทีต่อไฟล์ (เปลี่ยนได้)


//==============================================
// ส่ง frame ใหม่ให้ listener ทุกตัว
//  
function notifyFrame(frame) {
  lastFrame = frame;
  frameListeners.forEach(fn => {
    try { fn(frame); } catch(e) {}
  });
}

function onFrame(fn) {
  frameListeners.push(fn);
  return () => {
    frameListeners = frameListeners.filter(f => f !== fn);
  };
}

//==============================================
function startVideoStreamRelay() {
  if (videoProcess) return;
  if (process.platform !== 'linux') return;

  // เตรียมไฟล์ใหม่
  const filename = `${myDateTime.now_name()}.mjpeg`;
  const filepath = path.join(global.folderVideos, filename);
  fileStream = fs.createWriteStream(filepath);

  videoProcess = spawn('rpicam-vid', [
    '-t', '0',
    '--width', videoWidth.toString(),
    '--height', videoHeight.toString(),
    '--codec', 'mjpeg',
    '--framerate', '10',
    '-o', '-'
  ]);

  let buffer = Buffer.alloc(0);
  videoProcess.stdout.on('data', (data) => {
    // เขียนลงไฟล์
    if (fileStream) fileStream.write(data);
    // แยก frame ส่งให้ stream
    buffer = Buffer.concat([buffer, data]);
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);
      notifyFrame(frame);
      buffer = buffer.slice(end + 2);
    }
  });

  videoProcess.on('exit', () => {
    videoProcess = null;
    if (fileStream) {
      fileStream.end();
      fileStream = null;
    }
    // เริ่มไฟล์ใหม่ถ้ายังต้องการบันทึก
    if (recording) setTimeout(startVideoStreamRelay, 1000);
  });

  // ตัดไฟล์ใหม่ทุก N นาที
  setTimeout(() => {
    if (fileStream) {
      fileStream.end();
      fileStream = null;
    }
    if (videoProcess) {
      videoProcess.kill('SIGUSR1'); // ส่งสัญญาณให้ process จบ (หรือ SIGINT)
    }
  }, recordingDurationMs);
}

// เริ่มอัตโนมัติเมื่อเปิดระบบ
if (process.platform === 'linux') {
  setTimeout(startVideoStreamRelay, 3000);
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



// export สำหรับ cameraRouter.js
export { 
  lastFrame, 
  onFrame, 
  startVideoStreamRelay 
};