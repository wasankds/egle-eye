// const mainAuth = await import(`../${myModuleFolder}/mainAuth.js`)
import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const myUsers = await import(`../${global.myModuleFolder}/myUsers.js`)
const PATH_MAIN = '/'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_TERM = '/term-and-conditions'
// const PATH_API_DATA = '/api/data'
// const LowdbSessionStore = await import(`../${global.myModuleFolder}/LowDB.js`).then(mod => mod.LowdbSessionStore);

//=============================================
// 
// 
router.get(PATH_MAIN, mainAuth.isAuth,  async (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`)

  try {
    const html = await myGeneral.renderView('home', res, {
      title: global.PAGE_HOME ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),
      user : await myUsers.getSessionData(req) ,
      PREFIX,
      PATH_TERM ,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})

//=======================================
// ข้อกำหนดและเงื่อนไข
// 
router.get(PATH_TERM, mainAuth.isAuth,  async (req, res) => {
  // console.log(`--------${req.originalUrl}------------`)
  // console.log(req.query)
  try {
    const html = await myGeneral.renderView('termAndConditions', res, {
      title: global.PAGE_TERM ,
      time: myDateTime.getDate(),
      msg: req.flash('msg'),
      user: myUsers.getSessionData(req),
      // settings : await myModule.getSettings(),
    })
    res.send(html)
  } catch (error) {
    res.status(404).sendFile(file404)
  }
})



export default router


// //========================
// // API ข้อมูล sensor
// router.get(PATH_API_DATA, (req, res) => {
//   res.json(global.latestData);
// });



// // ดูว่าระบบตั้งค่าอะไรไว้
// router.get('/api/config', (req, res) => {
//   const response = {
//     success: true,
//     // data: sensorConfig,
//     // timestamp: Date.now()
//   };
//   res.json(response);
// });