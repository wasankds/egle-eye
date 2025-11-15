// import * as myDateTime from './myModule/myDateTime.js';
// console.log("-------------------")
// console.log("myDateTime.now_name() ===>" , myDateTime.now_name())

import { exec } from 'child_process';
import path from 'node:path';
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
let videoProcess = null;
let recording = true;

function startNextClip() {
  if (!recording) return;

  const filename = `${myDateTime.now_name()}.h264`;
  const filepath = path.join(global.folderVideos, filename);

  // 300000 = 5 นาที
  // 30000 = 30 วินาที 
  videoProcess = exec(`rpicam-vid -o ${filepath} --width 1280 --height 720 --timeout 30000`, (err) => {
    if (err) {
      console.error('Error recording video:', err);
    } else {
      console.log('Video saved:', filename);
    }
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
  // ...ปิด LED/Relay ตามเดิม...
  process.exit();
}
process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('exit', cleanup);