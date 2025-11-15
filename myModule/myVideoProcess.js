import { exec } from 'child_process';
import path from 'node:path';
import fs from 'fs';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
let videoProcess = null;
let recording = true;

//===============================================================
// ฟังก์ชันสำหรับเริ่มบันทึกคลิปถัดไป
function startNextClip() {
  if (!recording) return;

  const filename = `${myDateTime.now_name()}.h264`;
  const filepath = path.join(global.folderVideos, filename);

  // 300000 = 5 นาที
  videoProcess = exec(`rpicam-vid -o ${filepath} --width 1280 --height 720 --timeout 300000`, (err) => {
    if (err) {
      console.error('Error recording video:', err);
    } else {
      console.log('Video saved:', filename);
    }

    //=== นับไฟล์ในโฟลเดอร์ videos
    fs.readdir(global.folderVideos, (err, files) => {
      if (err) {
        console.error('Error reading videos folder:', err);
        return 
      }

      const videoFiles = files.filter(file => file.endsWith('.h264'));
      if (videoFiles.length > 100) {
        // เรียงชื่อไฟล์ (timestamp) จากน้อยไปมาก (เก่าที่สุดอยู่ต้น array)
        videoFiles.sort();
        const oldestFile = videoFiles[0];
        if (oldestFile) {
          fs.unlink(path.join(global.folderVideos, oldestFile), err => {
            if (err) console.error(`Error deleting file ${oldestFile}:`, err);
            else console.log(`Deleted oldest video file: ${oldestFile}`);
          });
        }
      }
    });

    // เรียกตัวเองต่อเมื่อคลิปนี้จบ
    if (recording) startNextClip();
  });
}

// เริ่มบันทึกคลิปแรกหลัง delay 5 วินาที
if(process.platform === 'linux'){
  setTimeout(startNextClip, 5000);
}


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
  process.exit();
}
process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('exit', cleanup);