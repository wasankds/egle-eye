import express from 'express';
const router = express.Router();
import bcrypt from 'bcrypt';
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const mySendmail = await import(`../${global.myModuleFolder}/mySendmail.js`) 
const PATH_MAIN = '/password'
const PATH_RESET = `${PATH_MAIN}/reset`
const PATH_LOGIN = `/login`

//=============================================================
//  หน้าลืม Password
// 
router.get(PATH_MAIN, mainAuth.isLogged, async (req,res) => {
  // console.log(`--------${req.originalUrl}--------`)
  // console.log("req.query ===> " , req.query)

  const redirectUrl = `${PATH_MAIN}`;
  try {
    const resetCode = await myGeneral.generateResetCode();
    const now = +new Date();
    const resetWaitUntil = req.session.resetWaitUntil;
    let isValidToFill = true;
    if (resetWaitUntil != null && resetWaitUntil > 0) {
      isValidToFill = now > Number(resetWaitUntil);
    }

    const html = await myGeneral.renderView('passwordForgot', res, {
      title: PAGE_PASSWORD_FORGOT,
      time: myDateTime.getDate(),
      msg: req.flash('msg'),
      isValidToFill,
      resetCode,
      PATH_MAIN,
      PATH_RESET,
      PATH_LOGIN,
    });
    res.send(html);
  } catch (error) {
    console.log("error ===> ", error);
    req.flash('msg', { class: "red", text: error.message });
    return res.redirect(redirectUrl);
  }
})
//=============================================================
// เมื่อกรอกข้อมูล 'ลืมรหัสผ่าน' จะส่งข้อมูลมาที่นี่
// 
router.post(PATH_MAIN, mainAuth.isLogged, async (req,res) => {
  // console.log(`--------POST : ${req.originalUrl}--------`)
  // console.log("req.body ===> " , req.body)

  try {
    const {inputEmail, resetCodeFill, resetCode} = req.body
    
    //===1.) กำหนดจำนวนครั้งที่อนุญาตให้กรอก (3 ครั้ง) และระยะเวลารอ (5 นาที)
    const MAX_ATTEMPTS = 3;
    const WAIT_MINUTES = 5;
    const now = Date.now();

    //=== 2.) ตรวจสอบ session สำหรับการนับจำนวนครั้งและเวลารอ
    // - resetAttempts: จำนวนครั้งที่กรอกผิด
    // - resetWaitUntil: เวลาที่สามารถกรอกใหม่ได้
    if (!req.session.resetAttempts) {
      req.session.resetAttempts = 0;
      req.session.resetWaitUntil = 0;
    }

    //=== 3.) ถ้ายังอยู่ในช่วงเวลารอ และ จำนวนครั้งที่กรอกยังไม่ถึง MAX_ATTEMPTS
    if (req.session.resetWaitUntil && now < req.session.resetWaitUntil) {
      const waitSeconds = Math.ceil((req.session.resetWaitUntil - now)/1000); 
      req.flash('msg', { 
        class: "red", 
        text: `กรอกผิดเกิน ${MAX_ATTEMPTS} ครั้ง กรุณารอ ${WAIT_MINUTES} นาที (${waitSeconds} วินาที)` 
      });
      return res.redirect(PATH_MAIN);
    }

    //=== 4.) ตรวจสอบการกรอกเลขตรวจสอบ  
    if (resetCodeFill !== resetCode) { //== 4.1) ถ้ากรอกผิด ให้เพิ่มจำนวนครั้ง

      // เพิ่มจำนวนครั้ง
      req.session.resetAttempts += 1;

      //= 4.1.1) ถ้าจำนวนครั้งที่กรอกเกิน MAX_ATTEMPTS ให้ตั้งเวลารอ และรีเซ็ตจำนวนครั้งเป็น 0
      if (req.session.resetAttempts >= MAX_ATTEMPTS) {
        req.session.resetAttempts = 0; // reset attempts after lock
        req.session.resetWaitUntil = now + WAIT_MINUTES * 60 * 1000;
        req.flash('msg', { 
          class: "red", 
          text: `กรอกผิดเกิน ${MAX_ATTEMPTS} ครั้ง{{sep}}กรุณารอ ${WAIT_MINUTES} นาที` 
        });
        return res.redirect(PATH_MAIN);
      }
      //= 4.1.2) ถ้าจำนวนครั้งที่กรอกไม่เกิน MAX_ATTEMPTS - ให้ลองได้อีก
      else {
        req.flash('msg', { 
          class: "red", 
          text: `เลขที่ตรวจสอบไม่ถูกต้อง (${req.session.resetAttempts}/${MAX_ATTEMPTS})` 
        });
        return res.redirect(PATH_MAIN);
      }
    } else { //== 4.2 ถ้ากรอกถูก reset ตัวนับ
      req.session.resetAttempts = 0;
      req.session.resetWaitUntil = 0;
    }

    //=== 5.) ตรวจสอบอีเมล์ที่ส่งมา - ค้นหาว่ามีอยู่ในยูสเซอร์ในระบบหรือไม่ 
    await global.db.read();
    const users = global.db.data.users || [];
    const userFind = users.find(u => u.userEmail === inputEmail);
    if (!userFind) {
      req.flash('msg', { class: "red", text: `ไม่พบผู้ใช้ "${inputEmail}"` });
      return res.redirect(PATH_MAIN);
    }
    // console.log("userFind ===> ", userFind);

    // สร้าง expire สำหรับลิงค์รีเซ็ตพาสเวิร์ด หมดอายุ 15 นาที
    const resetObj = {
      userEmail: userFind.userEmail,
      userFirstname: userFind.userFirstname,
      userLastname: userFind.userLastname,
      expire: myDateTime.getDateTime(15),
      id: `${Date.now()}_${Math.floor(Math.random()*100000)}`,
    };
    // console.log("resetObj ===> ", resetObj);

    // เขียนข้อมูล resetpassword ลง Lowdb
    if (!Array.isArray(global.db.data.usersResetPassword)) {
      global.db.data.usersResetPassword = [];
    }
    global.db.data.usersResetPassword.push(resetObj);
    await global.db.write();

    const resetUrl = `${DOMAIN_ALLOW}${PATH_RESET}?id=${resetObj.id}`;
    const info = await mySendmail.sendResetPassword(userFind, resetUrl)
    req.flash('msg', { 
      class : "green", 
      text : `ส่งลิงค์รีเซ็ตพาสเวิร์ดไปยัง"(${inputEmail}" เรียบร้อยแล้ว{{sep}}(CODE : ${info.response})` ,
    })
    return res.redirect(PATH_LOGIN)
  } catch (error) {
    console.log("error ===> ", error);
    req.flash('msg', { class: "red", text: error.message });
    return res.redirect(PATH_MAIN);
  }
})


/*********************************************************************/
/*********************************************************************/
/*********************************************************************/
/************************** Password Reset ***************************/
/*********************************************************************/
/*********************************************************************/
/*********************************************************************/
/*********************************************************************/



//=============================================================
// หน้า  resetpassword- ใช้กรณียูสเซอร์ลืมพาสเวิร์ด แล้วส่งอิเมล์มาให้รีเซ็ตพาสเวิร์ด 
// http://localhost:80/password/reset?id=1763041390958_93855
// 
router.get(PATH_RESET, mainAuth.isLogged, async (req,res) => {
  // console.log(`--------${req.originalUrl}--------`)
  // console.log("req.query ===> " , req.query)
  // req.query ===>  { id: '68f85283452bf7e5cd3311da' }
  
  // ตรวจสอบว่า change_id มีค่าหรือไม่
  const change_id = req.query.id  
  if(!change_id){
    return res.status(404).sendFile(file404)
  }

  try {
    await global.db.read();
    const resets = global.db.data.usersResetPassword || [];
    const docReset = resets.find(r => r.id === change_id);
    if (!docReset) {
      req.flash('msg', { class: "red", text: `ไม่พบข้อมูลสำหรับรีเซ็ตพาสเวิร์ด` });
      return res.redirect(PATH_LOGIN);
    }
    // ตรวจสอบเวลาหมดอายุ
    const currentDateTime = myDateTime.getDateTime(0);
    let resetRemain = (new Date(docReset.expire) - new Date(currentDateTime)) / 1000 / 60 / 60;
    resetRemain = resetRemain < 0 ? 0 : resetRemain;
    const isCanReset = resetRemain > 0 ? true : false;
    if (!isCanReset) {
      req.flash('msg', { class: "red", text: `ลิงค์รีเซ็ตพาสเวิร์ดหมดอายุ` });
      return res.redirect(PATH_LOGIN);
    }

    // โหลดหน้า resetpassword
    const html = await myGeneral.renderView('passwordReset', res, {
      title: PAGE_PASSWORD_RESET,
      time: myDateTime.getDateTime(0),
      msg: req.flash('msg'),
      passwordFlash: req.flash('passwordFlash'),
      PATH_MAIN,
      PATH_LOGIN,
      PATH_RESET
      ,
      change_id,
      userEmail: docReset.userEmail,
      newPassword: '',
      confirmPassword: '',
    });
    res.send(html);
  } catch (error) {
    req.flash('msg', { class: "red", text: error.message });
    return res.redirect(PATH_RESET);
  }
})
//=================================================
//  สำหรับส่งฟอร์มรีเซ็ตพาสเวิร์ด
// 
router.post(PATH_RESET, mainAuth.isLogged, async (req,res) => {  
  // console.log(`--------${req.originalUrl}--------`)
  // console.log("req.body ===> " , req.body)

  const { 
    change_id, 
    userEmail, 
    newPassword, 
    confirmPassword 
  } = req.body
  // req.body ===>  {
  //   change_id: '1763041390958_93855',
  //   userEmail: 'wasankds@gmail.com',
  //   newPassword: 'qwerty',
  //   confirmPassword: 'qwerty'
  // }

  //=== 
  const redirectUrl = `${PATH_RESET}?id=${change_id}`

  //=== ตรวจสอบความถูกต้องของรหัสผ่าน
  // - ตรวจสอบใน JS อยู่แล้ว ตรวจสอบซ้ำอีกที
  if(newPassword != confirmPassword){
    req.flash('passwordFlash', { newPassword, confirmPassword })
    req.flash('msg', { class : "red",text : `พาสเวิร์ด 2 ช่องไม่ตรงกัน` })
    return res.redirect(redirectUrl)
  }

  //=== ตรวจสอบ Regex
  if(!global.PASSWORD_PATTERN_REGEX.test(newPassword)){
    req.flash('passwordFlash', { newPassword, confirmPassword })
    req.flash('msg', { class : "red",text : `พาสเวิร์ดไม่ตรงตามเงื่อนไขที่กำหนด` })
    return res.redirect(redirectUrl)
  }

  try {
    await global.db.read();
    let users = global.db.data.users || [];
    const userIndex = users.findIndex(u => u.userEmail === userEmail);
    if (userIndex === -1) {
      req.flash('passwordFlash', { newPassword, confirmPassword });
      req.flash('msg', { class: "red", text: `ไม่พบผู้ใช้ "${userEmail}"` });
      return res.redirect(PATH_LOGIN);
    }

    // เข้ารหัสพาสเวิร์ดใหม่ - แล้วอัปเดตแทนของเก่า
    const newPassword_Encrypt = await bcrypt.hash(newPassword, global.BCRYPT_NUMBER);
    if (users[userIndex].userPassword === newPassword_Encrypt) {
      req.flash('passwordFlash', { newPassword, confirmPassword });
      req.flash('msg', { class: "yellow", text: `พาสเวิร์ดเก่ากับใหม่ เป็นตัวเดียวกัน` });
      return res.redirect(redirectUrl);
    }
    users[userIndex].userPassword = newPassword_Encrypt;
    global.db.data.users = users;
    await global.db.write();
    req.flash('passwordFlash', null);
    req.flash('msg', { class: "green", text: `คุณได้เปลี่ยนรหัสผ่านเรียบร้อยแล้ว` });
    return res.redirect(PATH_LOGIN);
  } catch (error) {
    console.log("error ===> ", error)
    req.flash('msg', { class: "red", text: error.message });
    return res.redirect(redirectUrl);
  }
})




export default router




