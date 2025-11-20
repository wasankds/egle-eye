import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
// const myServo = await import(`../${global.myModuleFolder}/myServo.js`)
const PATH_MAIN = '/switch'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_SWITCH_WEB = `${PATH_MAIN}/switch-web`

//=============================================
// 
router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
  console.log(`---- ${req.originalUrl} ----`)

  //=== อ่านค่าจาก LED1_STATE และ RELAY1_STATE แล้วส่งไปที่หน้า switch
  // const led1State = typeof global.LED1_STATE === 'number' ? global.LED1_STATE : 0;
  const relay1State = typeof global.RELAY1_STATE === 'number' ? global.RELAY1_STATE : 1;
  const relay2State = typeof global.RELAY2_STATE === 'number' ? global.RELAY2_STATE : 1;

  try {
    const html = await myGeneral.renderView('switch', res, {
      title: global.PAGE_SWITCH ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),
      user: await lowDB.getSessionData(req),

      PREFIX,
      PATH_MAIN,
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
router.post(PATH_SWITCH_WEB, mainAuth.isOA, async (req, res) => {
  console.log(`-----------------${req.originalUrl}----------------------`)
  console.log("req.body ===> " , req.body)
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

      // //== 1.) เปิด/ปิด LED1
      // await global.led1.modeSet('output');
      // await global.led1.write(switchState === 'on' ? 1 : 0);
      // global.LED1_STATE = switchState === 'on' ? 1 : 0;

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





// //== 3.) ทดสอบหมุนมอเตอร์เซอร์โว
// await myServo.setAngle(global.servo1, 100, 600, 2400);
// setTimeout(() => myServo.setAngle(global.servo1, 80, 600, 2400), 1000);
// setTimeout(() => myServo.setAngle(global.servo1, 90, 600, 2400), 2000);
// await myServo.setAngle(global.servo2, 100, 600, 2400);
// setTimeout(() => myServo.setAngle(global.servo2, 80, 600, 2400), 4000);
// setTimeout(() => myServo.setAngle(global.servo2, 90, 600, 2400), 5000);
