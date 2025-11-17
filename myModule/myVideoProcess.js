
/* 
ffmpeg -y -framerate 5 -i 2025-11-17_11-19-19.mjpeg -c:v libx264 -pix_fmt yuv420p 2025-11-17_11-19-19.mp4
*/

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
const videoWidth = process.env.VIDEO_WIDTH || '640';
const videoHeight = process.env.VIDEO_HEIGHT || '480';
const videoFrameRate = process.env.VIDEO_FRAME_RATE || '10'
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

  // cache overlay ตามวินาที
  let overlayCache = { second: null, overlay: null, timestamp: null };
  streamProcess.stdout.on('data', async (data) => {
    buffer = Buffer.concat([buffer, data]);
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);
        
        try {
          // overlay timestamp ด้วย sharp (cache ตามวินาที)
          let now = new Date();
          let sec = now.getSeconds();
          let timestamp = now.toLocaleString('sv-SE', { hour12: false });
          if (overlayCache.second !== sec) {
            overlayCache.second = sec;
            overlayCache.timestamp = timestamp;
            overlayCache.overlay = await sharp({
              create: {
                width: 300,
                height: 28,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
              }
            })
              .png()
              .composite([
                {
                  input: Buffer.from(
                    `<svg width="300" height="28">
                      <text x="8" y="20" font-size="18" fill="white" font-family="Arial">${timestamp}</text>
                    </svg>`
                  ),
                  top: 0,
                  left: 0
                }
              ])
              .toBuffer();
          }
          if (overlayCache.overlay) {
            let frameWithTs = await sharp(frame)
              .composite([{ input: overlayCache.overlay, top: 0, left: 0 }])
              .jpeg()
              .toBuffer();
            lastFrame = frameWithTs;
            streamClients.forEach(res => {
              res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frameWithTs.length}\r\n\r\n`);
              res.write(frameWithTs);
              res.write('\r\n');
            });
            if (fileStream) fileStream.write(frameWithTs);
          } else {
            // ถ้า overlay ยังไม่พร้อม ให้ส่ง frame เดิม (ไม่มี timestamp)
            lastFrame = frame;
            streamClients.forEach(res => {
              res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
              res.write(frame);
              res.write('\r\n');
            });
            if (fileStream) fileStream.write(frame);
          }
        } catch (err) {
          console.error('sharp error:', err);
          // ถ้า sharp error ให้ส่ง frame เดิม (ไม่มี timestamp) ไปแทน
          lastFrame = frame;
          streamClients.forEach(res => {
            res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
            res.write(frame);
            res.write('\r\n');
          });
          if (fileStream) fileStream.write(frame);
        }
      buffer = buffer.slice(end + 2);
    }

    // ตรวจสอบเวลาสิ้นสุดไฟล์ - ถ้าเกินเวลาที่กำหนดให้เริ่มไฟล์ใหม่
    if (Date.now() - fileStartTime > recordingDurationMs) {
      startNewFile();
      fs.readdir(global.folderVideos, (err, files) => {
        if (!err) {

          const videoFiles = files.filter(f => f.endsWith('.mjpeg'));
          if (videoFiles.length > files_maxCount) {
            videoFiles.sort();
            const oldestFile = videoFiles[0];

            // ลบไฟล์เก่า .mjpeg
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