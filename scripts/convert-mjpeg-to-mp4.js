
import { spawn } from 'child_process';
import path from 'node:path';
import fs from 'fs';
import schedule from 'node-schedule';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videosDir = path.resolve(__dirname, '../videos');
const mp4Dir = path.resolve(__dirname, '../videos-mp4');
console.log('videosDir:', videosDir);
console.log('mp4Dir:', mp4Dir);

// if(!fs.existsSync(videosDir)) {
//   console.error('Videos directory does not exist:', videosDir);
//   return
// }
// if(!fs.existsSync(mp4Dir)) {
//   console.error('MP4 directory does not exist:', mp4Dir);
//   return
// }

const FRAMERATE = 10; // ปรับตามที่บันทึกจริง

if (!fs.existsSync(mp4Dir)) {
  fs.mkdirSync(mp4Dir, { recursive: true });
}

function convertAllMjpegToMp4() {
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Read dir error:', err);
      return;
    }
    const mjpegFiles = files.filter(f => f.endsWith('.mjpeg'));
    if (mjpegFiles.length === 0) {
      console.log('No .mjpeg files to convert.');
    } else {
      function convertNext(index) {
        if (index >= mjpegFiles.length) return;
        const mjpegPath = path.join(videosDir, mjpegFiles[index]);
        const base = path.basename(mjpegFiles[index], '.mjpeg');
        const mp4Path = path.join(mp4Dir, base + '.mp4');
        if (fs.existsSync(mp4Path)) {
          console.log('Skip', mjpegFiles[index], '(already converted)');
          // ลบไฟล์ mjpeg ถ้ามี mp4 แล้ว
          fs.unlink(mjpegPath, () => convertNext(index + 1));
          return;
        }
        console.log('Converting', mjpegFiles[index], '->', mp4Path);
        const ffmpeg = spawn('ffmpeg', [
          '-y',
          '-framerate', String(FRAMERATE),
          '-i', mjpegPath,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          mp4Path
        ]);
        ffmpeg.stdout.on('data', d => process.stdout.write(d));
        ffmpeg.stderr.on('data', d => process.stderr.write(d));
        ffmpeg.on('exit', code => {
          if (code === 0) {
            console.log('Converted', mjpegFiles[index], 'to', mp4Path);
            fs.unlink(mjpegPath, err => {
              if (err) console.error('Error deleting', mjpegPath, err);
              convertNext(index + 1);
            });
          } else {
            console.error('Failed to convert', mjpegFiles[index]);
            convertNext(index + 1);
          }
        });
      }
      convertNext(0);
    }
  });
}

// ตัวอย่าง schedule: ทุกวันตี 2
schedule.scheduleJob('0 2 * * *', () => {
  console.log('Scheduled: Convert all .mjpeg to .mp4');
  convertAllMjpegToMp4();
});


// ถ้าคุณต้องการ “ทดสอบ” หรือ “สั่งแปลงไฟล์ทันที” (ไม่ต้องรอ schedule)
// node scripts/convert-mjpeg-to-mp4.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  convertAllMjpegToMp4();
}