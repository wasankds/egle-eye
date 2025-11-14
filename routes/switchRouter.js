import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const PATH_MAIN = '/switch'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 


//=============================================
// 
// 
router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
  console.log(`---- ${req.originalUrl} ----`)
  console.log("req.query ===> " , req.query)

  try {
    const html = await myGeneral.renderView('switch', res, {
      title:PAGE_HOME ,
      time : myDateTime.getDate(),
      // msg: req.flash('msg'),

      // user: myUsers.getSessionData(req),
      // settings : await myGeneral.getSettings(),

      PREFIX: PREFIX,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})



export default router

