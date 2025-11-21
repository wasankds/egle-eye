import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const myStepper = await import(`../${global.myModuleFolder}/myStepper.js`)
const PATH_MAIN = '/camera'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_REQUEST = `${PATH_MAIN}/request`
const PATH_SWITCH_WEB = `${PATH_MAIN}/switch-web`
//=============================================
//
// router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
router.get(PATH_MAIN, async (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`)
  try {

    const relay1State = typeof global.RELAY1_STATE === 'number' ? global.RELAY1_STATE : 1;
    const relay2State = typeof global.RELAY2_STATE === 'number' ? global.RELAY2_STATE : 1;

    const html = await myGeneral.renderView('camera_socket', res, {
      title: global.PAGE_CAMERA ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),

      PREFIX,
      PATH_MAIN,
      PATH_REQUEST,
      PATH_SWITCH_WEB,
      relay1State,
      relay2State,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})


//=============================================
// เมื่อกดสวิตช์บนเว็บ
//
router.post(PATH_REQUEST, mainAuth.isOA, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)
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
      await myStepper.stepMotor(200, 1, 1);
      return  res.send({ status: 'ok', direction: direction });
    }else if(direction == 'right'){
      await myStepper.stepMotor(200, -1, 1);  // steps, direction, delay(ms)
      return  res.send({ status: 'ok', direction: direction });
    // }
    // //=== 
    // else if(direction == 'up'){
    //   await myStepper.rotate1();
    //   return  res.send({ status: 'ok', direction: direction });
    // }else if(direction == 'down'){
    //   await myStepper.rotate2();
    //   return  res.send({ status: 'ok', direction: direction });
    // }

    // //=== กลาง
    // else if(direction == 'home'){
    //   await myStepper.resetRotation();
    //   return  res.send({ status: 'ok', direction: direction });
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


//=============================================
// เมื่อกดสวิตช์บนเว็บ
//
router.post(PATH_SWITCH_WEB, mainAuth.isOA, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)
  // req.body ===>  { switchState: 'off', id: 's01' }
  
  const { id, switchState } = req.body;

  try {
    //=== ตรวจสอบค่าที่ส่งมา
    if(!id || !switchState){
      return res.status(400).send({
        status: 'error',
        message: 'Missing id or switchState in request body',
      });
    }

    //=== ควบคุม GPIO
    if (global.gpio) {     

      if(id === 's01'){
        //== 2.) เปิด/ปิด RELAY1
        await global.relay1.modeSet('output');
        await global.relay1.write(switchState === 'on' ? 0 : 1); // Active Low
        global.RELAY1_STATE = switchState === 'on' ? 0 : 1;      // Active Low
      }else if(id === 's02'){
        //== 2.) เปิด/ปิด RELAY2
        await global.relay2.modeSet('output');
        await global.relay2.write(switchState === 'on' ? 0 : 1); // Active Low
        global.RELAY2_STATE = switchState === 'on' ? 0 : 1;      // Active Low
      }

      global.io.emit('button_pressed', {
        buttonId: id, 
        relayState: id === 's01' ? global.RELAY1_STATE : global.RELAY2_STATE,
      });

      //=== 4.) ส่งผลลัพธ์กลับไป
      res.send({
        status: 'ok',
        switchId: id,
        relayState: id === 's01' ? global.RELAY1_STATE : global.RELAY2_STATE,
      });
    }else{
      //=== ไม่มี GPIO
      res.send({
        status: 'no gpio',
        switchId: id,
        relayState: id === 's01' ? global.RELAY1_STATE : global.RELAY2_STATE,
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