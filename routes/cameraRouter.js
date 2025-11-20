// const myServo = await import(`../${global.myModuleFolder}/myServo.js`)
import express from 'express'
const router = express.Router()
// ไม่ต้อง spawn process เอง ใช้ relay จาก myVideoProcess.js
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const myStepper = await import(`../${global.myModuleFolder}/myStepper.js`)
// const { addMjpegClient } = await import(`../${global.myModuleFolder}/myVideoProcess.js`);
const PATH_MAIN = '/camera'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_REQUEST = `${PATH_MAIN}/request`
// const PATH_STREAM = `${PATH_MAIN}/stream`

// //=============================================
// // 
// router.get(PATH_STREAM, mainAuth.isOA, (req, res) => {
// // router.get(PATH_STREAM, (req, res) => {
//   if(process.platform !== 'linux') return;
//   res.writeHead(200, {
//     'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });
//   addMjpegClient(res);
// });

//=============================================
//
// router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
router.get(PATH_MAIN, async (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`)

  try {
    // const html = await myGeneral.renderView('camera_socket', res, {
    const html = await myGeneral.renderView('camera_hls_local', res, {
      // const html = await myGeneral.renderView('camera_hls', res, {
      // const html = await myGeneral.renderView('camera_webRTC', res, {
      title: global.PAGE_CAMERA ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),

      PREFIX,
      PATH_MAIN,
      PATH_REQUEST,
      // PATH_STREAM ,
      IS_STREAM  :  process.platform === 'linux'
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})


let VER = 90
let HOR = 90


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

    //=== ใช้ - stepper motor
    if(direction == 'left'){
      await myStepper.stepMotor(200, -1, 1);  // steps, direction, delay(ms)
      return  res.send({ status: 'ok left', direction: direction });
    }else if(direction == 'right'){
      await myStepper.stepMotor(200, 1, 1);
      return  res.send({ status: 'ok right', direction: direction });
    }
    //=== กลาง
    else if(direction == 'center'){
      // myServo.setAngle(global.servo1, 90, 600, 2400)
      // myServo.setAngle(global.servo2, 90, 600, 2400)
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