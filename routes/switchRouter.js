import express, { json } from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/switch'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_SWITCH = `${PATH_MAIN}/switch-request`

/* 
scp "D:\aWK_LeaseSystem\egle-eye\routes\switchRouter.js" wasankds@pi3:~/egle-eye/routes/
scp "D:\aWK_LeaseSystem\egle-eye\views\switch.ejs" wasankds@pi3:~/egle-eye/views/
scp "D:\aWK_LeaseSystem\egle-eye\public\css\switch.css" wasankds@pi3:~/egle-eye/public/css/
scp "D:\aWK_LeaseSystem\egle-eye\public\js\switch.js" wasankds@pi3:~/egle-eye/public/js/
*/

//=============================================
// 
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
      PATH_SWITCH,
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
router.post(PATH_SWITCH, mainAuth.isOA, async (req, res) => {
  console.log(`-----------------${req.originalUrl}----------------------`)
  console.log("req.params ===> " , req.params)
  console.log("req.body ===> " , req.body)
  // req.params ===>  { id: 's01' }
  // req.body ===>  { switchState: 'on' }

  const { id, switchState } = req.body;
  if(!id || !switchState){
    return res.status(400).send({
      status: 'error',
      message: 'Missing id or switchState in request body',
    });
  }

  try {
    res.send({
      status: 'ok',
      switchId: id,
      switchState: switchState,
    });
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
})

export default router

