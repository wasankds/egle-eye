import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/switch'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_SWITCH_WEB = `${PATH_MAIN}/switch-request`

//=============================================
// 
router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`)

  //=== อ่านค่าจาก LED1_STATE และ RELAY1_STATE แล้วส่งไปที่หน้า switch
  const led1State = typeof global.LED1_STATE === 'number' ? global.LED1_STATE : 0;
  const relay1State = typeof global.RELAY1_STATE === 'number' ? global.RELAY1_STATE : 1;
  // const servo1Pin = typeof global.SERVO1_PIN === 'number' ? global.SERVO1_PIN : 18;
  // const servo2Pin = typeof global.SERVO2_PIN === 'number' ? global.SERVO2_PIN : 13;
  console.log(`LED1_STATE = ${led1State} , RELAY1_STATE = ${relay1State}`)

  try {
    const html = await myGeneral.renderView('switch', res, {
      title: global.PAGE_SWITCH ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),

      PREFIX,
      PATH_MAIN,
      PATH_SWITCH_WEB,
      led1State,
      relay1State,
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
      
      //== 1.) เปิด/ปิด LED1
      await global.led1.modeSet('output');
      await global.led1.write(switchState === 'on' ? 1 : 0);
      global.LED1_STATE = switchState === 'on' ? 1 : 0;

      //== 2.) เปิด/ปิด RELAY1
      await global.relay1.modeSet('output');
      await global.relay1.write(switchState === 'on' ? 0 : 1); // Active Low
      global.RELAY1_STATE = switchState === 'on' ? 0 : 1;      // Active Low


      // //=== 3.) ทดสอบหมุนมอเตอร์เซอร์โว
      // await global.servo1.modeSet('output');
      // await global.servo2.modeSet('output');


      //=== 3.) Boardcast ผ่าน WebSocket ด้วย
      if(global.io){
        global.io.emit('button_pressed', {
          buttonId: 'btn1', 
          ledState: global.LED1_STATE,
          relayState: global.RELAY1_STATE
        });
      }

      //=== 4.) ส่งผลลัพธ์กลับไป
      res.send({
        status: 'ok',
        switchId: id,
        switchState: switchState,
      });
    }else{
      //=== ไม่มี GPIO
      res.send({
        status: 'no gpio',
        switchId: id,
        switchState: switchState,
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



