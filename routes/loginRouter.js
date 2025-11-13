import express from 'express'
const router = express.Router()
import bcrypt from 'bcrypt'
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${myModuleFolder}/myDateTime.js`)
const { UserManager } = await import(`../${global.myModuleFolder}/UserManager.js`)
const PATH_LOGIN = '/login'
const PATH_LOGOUT = '/logout'
const PATH_FORGOT_PASSWORD = `/password`

//======================================================================
// 
// 
router.get(PATH_LOGIN, mainAuth.isLogged, async (req,res) => {
  // console.log(`--------${req.originalUrl}------------`)
  // console.log(dataSettings)

  // const ADAY_MINUTES = 24*60
  // console.log('ADAY_MINUTES = ', ADAY_MINUTES)
  // const x = myDateTime.getDateTime(ADAY_MINUTES)
  // console.log(x)

  // //=== ทดสอบอ่านข้อมูลยูสเซอร์ userId=100 โดยใช้ UserManager
  // const userManager = new UserManager(global.db);
  // const userTest =  await userManager.getById(100);
  // // console.log('userTest ===> ', userTest);

  // //=== ทดสอบอ่านข้อมูลยูสเซอร์ทั้งหมดที่มี
  // const userManager = new UserManager(global.db);
  // const allUsers =  await userManager.getAll();
  // console.log(`---- จำนวนยูสเซอร์ทั้งหมด ${allUsers.length} ----`);
  // console.log('allUsers ===> ', allUsers);
  
  try{
     const html = await myGeneral.renderView('login', res, {
      title: global.PAGE_LOGIN ,
      time: myDateTime.getDate(),
      msg: req.flash('msg'),
      userFlash: req.flash('userFlash'),

      PATH_LOGIN ,
      PATH_FORGOT_PASSWORD  ,
    })
    return res.send(html)
  }catch(err){
    console.log(err.message)
    res.status(404).sendFile(file404)
  }
})


//=================================================
// 
router.post(PATH_LOGIN, mainAuth.isLogged, async (req, res) => {
  // console.log(`--------${req.originalUrl}------------`)
  // console.log(`req.body ===> `, req.body)

  try{
    const { userNameEmail, userPassword } = req.body;
  
    // ใช้ UserManager ในการจัดการข้อมูลยูสเซอร์
    const userManager = new UserManager(global.db);
    
    // 1) ค้นหาจาก username ก่อน
    if(userNameEmail.match(global.EMAIL_PATTERN_REGEX)) {
      var userFind = await userManager.getByEmail(userNameEmail);
    } else {
      var userFind = await userManager.getByUsername(userNameEmail);
    }
    // console.log('userFind ===> ', userFind);
    if (!userFind) {
      req.flash('msg', { class: "red", text: `ไม่พบผู้ใช้ หรือ ผู้ใช้ไม่ได้เปิดใช้งาน` })
      req.flash('user', { userNameEmail, userPassword })
      return res.redirect(PATH_LOGIN)
    }
  
    // 2) เปรียบเทียบพาสเวิร์ดต่อ
    const isMatchPassword = await bcrypt.compare(userPassword, userFind.userPassword);
    // console.log('isMatchPassword ===> ', isMatchPassword);
    if (!isMatchPassword) {
      req.flash('msg', { class: "red", text: `รหัสผ่านไม่ถูกต้อง` })
      req.flash('user', { userNameEmail, userPassword })
      return res.redirect(PATH_LOGIN)
    }
    await global.db.write();
  
    // 3) เซ็ตข้อมูลผู้ใช้ลงใน session
    req.session.isAuth = true;
    req.session.userId = userFind.userId;
    req.session.userAuthority = userFind.userAuthority;
    req.session.username = userFind.username;
    req.session.userEmail = userFind.userEmail;
    req.session.userPhone = userFind.userPhone;
    req.session.userPrefix = userFind.userPrefix;
    req.session.userFirstname = userFind.userFirstname;
    req.session.userLastname = userFind.userLastname;
    req.session.userFullname = `${userFind.userPrefix} ${userFind.userFirstname} ${userFind.userLastname}`.trim();
    req.flash('msg', { class: "green", text: "เข้าสู่ระบบสำเร็จ" })
    return res.redirect("/")  
  }catch(err){
    console.log(err)
    res.status(404).sendFile(file404)
  }

})


//===================================================
// ลบ Session แต่ Cookie ยังอยู่
// - ลบ Session ใน MongoDB ???? 
// router.post(PATH_LOGOUT, mainAuth.isAuth, (req,res) => {
router.get(PATH_LOGOUT, mainAuth.isAuth, (req,res) => {
  req.session.destroy( (err) => {
    if(err) throw err
    res.redirect(PATH_LOGIN)
  })
})





export default router







