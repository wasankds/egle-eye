import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
import sharp from 'sharp';
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
  let prevFilename = null;
  
  function startNewFile() {
    if (fileStream) fileStream.end();
    
    // ทุกครั้งที่เริ่มไฟล์ใหม่ จะสั่งแปลงไฟล์ .mjpeg ก่อนหน้าเป็น .mp4 แบบ background (ไม่รอผลลัพธ์)
    if (prevFilename) {
      const mjpegPath = path.join(global.folderVideos, prevFilename);
      const mp4Path = mjpegPath.replace(/\.mjpeg$/, '.mp4');
      const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-framerate', videoFrameRate, // เพิ่มบรรทัดนี้
        '-i', mjpegPath,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        mp4Path
      ]);
      ffmpeg.on('exit', (code) => {
        if (code === 0) {
          console.log('Converted', prevFilename, 'to', mp4Path);
          // ลบไฟล์ mjpeg หลังแปลงสำเร็จ
          fs.unlink(mjpegPath, (err) => {
            if (err) {
              console.error('Error deleting', mjpegPath, err);
            } else {
              console.log('Deleted original mjpeg file:', mjpegPath);
            }
          });
        } else {
          console.log('Failed to convert', prevFilename, 'to mp4');
        }
      });
    }
    prevFilename = currentFilename;
    currentFilename = `${myDateTime.now_name()}.mjpeg`;
    fileStream = fs.createWriteStream(path.join(global.folderVideos, currentFilename));
    fileStartTime = Date.now();
  }
  startNewFile();
  streamProcess.stdout.on('data', async (data) => {
    // แยก frame ส่งให้ stream (และเขียนไฟล์หลังใส่ timestamp)
    buffer = Buffer.concat([buffer, data]);
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);

      // วาด timestamp ด้วย sharp
      let timestamp = new Date().toLocaleString('sv-SE', { hour12: false });
      let overlay = await sharp({
        create: {
          width: 300,
          height: 28,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 } // โปร่งใส
        }
      }).png().composite([
          {
            input: Buffer.from(
              `<svg width="300" height="28">
                <text x="8" y="20" font-size="18" fill="white" font-family="Arial">${timestamp}</text>
              </svg>`
            ),
            top: 0,
            left: 0
          }
        ]).toBuffer();
      let frameWithTs = await sharp(frame)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .jpeg()
        .toBuffer();
      lastFrame = frameWithTs;
      // ส่งให้ client
      streamClients.forEach(res => {
        res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frameWithTs.length}\r\n\r\n`);
        res.write(frameWithTs);
        res.write('\r\n');
      });
      // เขียนลงไฟล์
      if (fileStream) fileStream.write(frameWithTs);
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
// ไปแก้ที่ cameraRouter.js ด้วย - ใช้ addMjpegClient
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