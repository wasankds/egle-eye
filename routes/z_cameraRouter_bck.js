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

/* 
ถ้าติด process อื่นๆอยู่ ให้สั่งหยุดก่อนด้วยคำสั่งนี้
ps aux | grep rpicam-vid
sudo killall rpicam-vid
*/
router.get(PATH_STREAM, (req, res) => {
  console.log(`---- ${req.originalUrl} ----`);

  if(process.platform !== 'linux') return

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  const cam = spawn('rpicam-vid', [
    '-t', '0',
    '--width', '640',
    '--height', '480',
    '--codec', 'mjpeg',
     '--framerate', '10',   // เพิ่มบรรทัดนี้ - ถ้าเอาออก จะทำให้โหลด CPU สูงมาก
    '-o', '-'
  ]);

  let buffer = Buffer.alloc(0);

  cam.stdout.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    // หา JPEG frame (0xFFD8 ... 0xFFD9)
    let start, end;
    while ((start = buffer.indexOf(Buffer.from([0xFF, 0xD8]))) !== -1 &&
           (end = buffer.indexOf(Buffer.from([0xFF, 0xD9]), start)) !== -1) {
      const frame = buffer.slice(start, end + 2);
      res.write(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.length}\r\n\r\n`);
      res.write(frame);
      res.write('\r\n');
      buffer = buffer.slice(end + 2);
    }
  });

  //== Handle stderr output
  cam.stderr.on('data', (data) => {
    // console.log('rpicam-vid stderr ===> ', data.toString());
  });

  //== เมื่อ client ปิดการเชื่อมต่อ
  req.on('close', () => {
    cam.kill('SIGINT');
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
      PATH_STREAM ,
      IS_STREAM  :  process.platform === 'linux'
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})


let LEFT_START = 90
let RIGHT_START = 90
let UP_START = 90
let DOWN_START = 90

//=============================================
// เมื่อกดสวิตช์บนเว็บ
//
// router.post(PATH_REQUEST, mainAuth.isOA, async (req, res) => {
router.post(PATH_REQUEST,  async (req, res) => {
  console.log(`-----------------${req.originalUrl}----------------------`)
  console.log("req.body ===> " , req.body)
  // req.body ===>  { action: 'move', direction: 'right' }

  const { direction } = req.body;

  try {

    if (!global.gpio) {
      return  res.send({
        status: 'no gpio',
        direction: direction,
      });
    }

    //=== ใช้ - servo2
    if(direction == 'left'){ // ใช้ - servo2      
      let sub = 10
      LEFT_START += sub
      if(LEFT_START > 180) LEFT_START = 180
      myServo.setAngle(global.servo2, LEFT_START, 600, 2400)
      return  res.send({ status: 'ok left', direction: direction });
    }else if(direction == 'right'){ // ใช้ - servo2
      let sub = 10
      RIGHT_START -= sub
      if(RIGHT_START < 0) RIGHT_START = 0
      myServo.setAngle(global.servo2, RIGHT_START, 600, 2400)
      return  res.send({ status: 'ok right', direction: direction });
    }
    //=== ใช้ - servo1
    else if(direction == 'up'){ // ใช้ - servo1
      let sub = 10
      UP_START += sub
      if(UP_START > 180) UP_START = 180
      myServo.setAngle(global.servo1, UP_START, 600, 2400)
      return  res.send({ status: 'ok up', direction: direction });  
    }else if(direction == 'down'){ // ใช้ - servo1
      let sub = 10
      DOWN_START -= sub
      if(DOWN_START < 0) DOWN_START = 0
      myServo.setAngle(global.servo1, DOWN_START, 600, 2400)
      return  res.send({ status: 'ok down', direction: direction });
    }
    //=== กลาง
    else if(direction == 'center'){
      myServo.setAngle(global.servo1, 90, 600, 2400)
      myServo.setAngle(global.servo2, 90, 600, 2400)
      return  res.send({ status: 'ok center', direction: direction });
    }else{
      return  res.send({
        status: 'error direction',
        direction: direction,
      });
    }
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
})


export default router





// router.get(PATH_STREAM, (req, res) => {
//   console.log(`---- ${req.originalUrl} ----`);

//   res.writeHead(200, {
//     'Content-Type': 'video/x-motion-jpeg',
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });

//   const cam = spawn('rpicam-vid', [
//     '-t', '0',
//     '--width', '640',
//     '--height', '480',
//     '--codec', 'mjpeg',
//     '-o', '-'
//   ]);

//   cam.stdout.pipe(res);

//   cam.stderr.on('data', (data) => {
//     console.log('rpicam-vid stderr:', data.toString());
//   });


//   req.on('close', () => {
//     cam.kill('SIGINT');
//   });
// });