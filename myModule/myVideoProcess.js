

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


let ffmpegProcess = null;
let streamClients = [];
let fileStartTime = 0;
let currentFilename = null;
let recording = true;
const videoWidth = '1280';
const videoHeight = '720';
const videoFrameRate = '10';
const files_maxCount = 100;
const recordingDurationMs = 1 * 60 * 1000; // 1 นาทีต่อไฟล์


// H264 stream relay + record h264 file (process เดียว ประหยัด resource)


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

  // rpicam-vid --codec h264 | ffmpeg -i - -c:v copy -f h264 pipe:1 -f mp4 <file>
  ffmpegProcess = spawn('bash', ['-c',
    `rpicam-vid -t 0 --width ${videoWidth} --height ${videoHeight} --codec h264 --framerate ${videoFrameRate} -o - | ffmpeg -hide_banner -loglevel error -y -i - -c:v copy -f h264 pipe:1 -f mp4 '${path.join(global.folderVideos, currentFilename)}'`
  ]);

  ffmpegProcess.stdout.on('data', (data) => {
    streamClients.forEach(res => {
      if (!res.writableEnded) res.write(data);
    });
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