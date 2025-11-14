import { execSync } from 'child_process';
import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/switch'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_SWITCH_WEB = `${PATH_MAIN}/switch-request`
const PATH_SWITCH_BUTTON = `${PATH_MAIN}/switch-button`
// //== ใช้ได้แต่บน Linux เท่านั้น (Raspberry Pi OS)
// let gpio = null;
// if (process.platform === 'linux') {
//   try {
//     const { pigpio } = await import('pigpio-client');
//     gpio = pigpio({ host: 'localhost' });
//   } catch (err) {
//     console.log('pigpio-client error:', err.message);
//   }
// }
let LED1_STATE = 0;
// const LED1_PIN = global.LED1_PIN;    // พิน 37
// const SW1_PIN = global.SW1_PIN;     // พิน 36


//=============================================
// 
router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
  try {
    const html = await myGeneral.renderView('switch', res, {
      title: global.PAGE_SWITCH ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),
      // settings : await myGeneral.getSettings(),

      PREFIX,
      PATH_MAIN,
      PATH_SWITCH_WEB,
      PATH_SWITCH_BUTTON,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})

//=============================================
// เมื่อมีการกดสวิตช์ 
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

    //=== 
    if (process.platform === 'linux') {
      // LED1_STATE = switchState === 'on' ? 1 : 0;
      // execSync(`pigs w ${global.LED1_PIN} ${LED1_STATE}`);
      exec(`pigs w ${global.LED1_PIN} ${switchState === 'on' ? 1 : 0}`, (err, stdout, stderr) => {
        if (err) console.log('pigs error:', err.message);
      });
    } else {
      console.log('No Linux platform.');
    }

    // //=== ควบคุม GPIO
    // if (global.gpio) {
    //   const led1 = global.led1;
    //   await led1.modeSet('output');
    //   await led1.write(switchState === 'on' ? 1 : 0);
    //   LED1_STATE = switchState === 'on' ? 1 : 0;

    //   res.send({
    //     status: 'ok',
    //     switchId: id,
    //     switchState: switchState,
    //   });
    // }else{
    //   //=== ไม่มี GPIO
    //   res.send({
    //     status: 'no gpio',
    //     switchId: id,
    //     switchState: switchState,
    //   });
    // }
  } catch (error) {
    console.log("Error ===> " , error.message)
    // Error ===>  Argument 'gpio' is not a user GPIO.
    res.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
})




export default router

