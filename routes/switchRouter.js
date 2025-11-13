import express from 'express'
const router = express.Router()
// import mainAuth from "../middleware/mainAuth.js" 
const myGeneral = await import(`../${myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${myModuleFolder}/myDateTime.js`)
// const myUsers = await import(`../${myModuleFolder}/myUsers.js`)
const PATH_MAIN = '/'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_API_DATA = '/api/data'
const PATH_TERM = '/term-and-conditions'

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });
// app.get('/api/data', (req, res) => { // API ข้อมูล sensor
//   res.json(latestData);
// });

//=============================================
// 
// 
router.get(PATH_MAIN, async (req, res) => {
  console.log(`---- ${req.originalUrl} ----`)
  // res.sendFile(folderPublic + '/index.html');

  try {
    const html = await myGeneral.renderView('index', res, {
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

//========================
// API ข้อมูล sensor
router.get(PATH_API_DATA, (req, res) => {
  res.json(global.latestData);
});



// ดูว่าระบบตั้งค่าอะไรไว้
router.get('/api/config', (req, res) => {
  const response = {
    success: true,
    // data: sensorConfig,
    // timestamp: Date.now()
  };
  res.json(response);
});


export default router

