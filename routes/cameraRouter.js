import express from 'express'
const router = express.Router()
import { spawn } from 'child_process';
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const myServo = await import(`../${global.myModuleFolder}/myServo.js`)
const PATH_MAIN = '/camera'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_REQUEST = `${PATH_MAIN}/request`
const PATH_STREAM = `${PATH_MAIN}/stream`


router.get(PATH_STREAM, (req, res) => {
  // ตั้ง header สำหรับ MJPEG
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  // เรียก ffmpeg หรือ raspivid เฉพาะตอน client connect
  // ตัวอย่างนี้ใช้ ffmpeg (สำหรับ USB webcam)
  const ffmpeg = spawn('ffmpeg', [
    '-f', 'v4l2',
    '-i', '/dev/video0', // เปลี่ยนเป็นกล้องที่คุณใช้
    '-f', 'mjpeg',
    '-q', '5',
    'pipe:1'
  ]);

  ffmpeg.stdout.on('data', (data) => {
    res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${data.length}\r\n\r\n`);
    res.write(data);
    res.write('\r\n');
  });

  ffmpeg.stderr.on('data', (data) => {
    // log error
  });

  req.on('close', () => {
    ffmpeg.kill('SIGINT');
  });
});


//=============================================
// 
// router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
router.get(PATH_MAIN, async (req, res) => {
  console.log(`---- ${req.originalUrl} ----`)




  try {
    const html = await myGeneral.renderView('camera', res, {
      title: global.PAGE_CAMERA ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),

      PREFIX,
      PATH_MAIN,
      PATH_REQUEST,
      led1State,
      relay1State,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})




// //=============================================
// // เมื่อกดสวิตช์บนเว็บ
// //
// router.post(PATH_REQUEST, mainAuth.isOA, async (req, res) => {
//   // console.log(`-----------------${req.originalUrl}----------------------`)
//   // console.log("req.body ===> " , req.body)
//   // req.body ===>  { switchState: 'off', id: 's01' }
  
//   const { id, switchState } = req.body;

//   try {
//     //=== ตรวจสอบค่าที่ส่งมา
//     if(!id || !switchState){
//       return res.status(400).send({
//         status: 'error',
//         message: 'Missing id or switchState in request body',
//       });
//     }

//     //=== ควบคุม GPIO
//     if (global.gpio) {
      
//       //== 1.) เปิด/ปิด LED1
//       await global.led1.modeSet('output');
//       await global.led1.write(switchState === 'on' ? 1 : 0);
//       global.LED1_STATE = switchState === 'on' ? 1 : 0;

//       //== 2.) เปิด/ปิด RELAY1
//       await global.relay1.modeSet('output');
//       await global.relay1.write(switchState === 'on' ? 0 : 1); // Active Low
//       global.RELAY1_STATE = switchState === 'on' ? 0 : 1;      // Active Low

//       //== 3.) ทดสอบหมุนมอเตอร์เซอร์โว
//       await myServo.setAngle(global.servo1, 100, 600, 2400);
//       setTimeout(() => myServo.setAngle(global.servo1, 80, 600, 2400), 1000);
//       setTimeout(() => myServo.setAngle(global.servo1, 90, 600, 2400), 2000);

//       await myServo.setAngle(global.servo2, 100, 600, 2400);
//       setTimeout(() => myServo.setAngle(global.servo2, 80, 600, 2400), 4000);
//       setTimeout(() => myServo.setAngle(global.servo2, 90, 600, 2400), 5000);

//       //=== 3.) Boardcast ผ่าน WebSocket ด้วย
//       if(global.io){
//         global.io.emit('button_pressed', {
//           buttonId: 'btn1', 
//           ledState: global.LED1_STATE,
//           relayState: global.RELAY1_STATE
//         });
//       }

//       //=== 4.) ส่งผลลัพธ์กลับไป
//       res.send({
//         status: 'ok',
//         switchId: id,
//         switchState: switchState,
//       });
//     }else{
//       //=== ไม่มี GPIO
//       res.send({
//         status: 'no gpio',
//         switchId: id,
//         switchState: switchState,
//       });
//     }
//   } catch (error) {
//     console.log("Error ===> " , error.message)
//     res.status(500).send({
//       status: 'error',
//       message: error.message,
//     });
//   }
// })


export default router



