
// import multer from 'multer'
// import path from 'path'
// import fs from 'fs'
// import { MongoClient, ObjectId } from 'mongodb'
// const myData = await import(`../${global.myModuleFolder}/myData.js`)
import express from 'express'
import bcrypt from 'bcrypt';
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`) ;
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`) ;
const lowDb = await import(`../${global.myModuleFolder}/LowDb.js`)
const router = express.Router()
const PATH_MAIN = '/user'
const PATH_SAVE = `${PATH_MAIN}/save`
const PATH_CHANGE_PASSWORD = `${PATH_MAIN}/change-password`  



//=======================================================
// หน้าแรก user
// 
router.get(PATH_MAIN, mainAuth.isAuth, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.query ===> " , req.query)

  try{

    // ดึง user จาก LowDb - ใช้ข้อมูลจริงจาก db
    await global.db.read();
    const users = global.db.data.users || [];
    const userId = req.session.userId;
    const user = users.find(u => u.userId === userId);    
    user.isAuth = true; // เพิ่มลงไปด้วย เพราะข้อมูลจาก LowDb ไม่มีคีย์นี้

    const html = await myGeneral.renderView('userInfo', res, {
      title: PAGE_USER_INFO ,
      time: myDateTime.getDate(),
      user : user, //  await lowDb.getSessionData(req),
      setting : await myGeneral.getSettings() ,
      msg: req.flash('msg'),
      pwd: req.flash('pwd'),
      PATH_MAIN,
      PATH_SAVE,
      PATH_CHANGE_PASSWORD,
    })
    return res.send(html)
  }catch(err){
    console.log(err.message)
    res.status(404).sendFile(file404)
  } 
})




//=======================================================
// ใช้กับทั้ง Create และ Update
// 
router.post(PATH_SAVE, mainAuth.isAuth, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)

  //=== 1.) ค่าจาก req.body - ไม่เหมือนใน manageUsers เขียนได้เฉพาะบางค่าที่ไม่สำคัญเท่านั้น
  // LowDb version
  const userId = req.body.userId ? Number(req.body.userId) : req.body.userId;
  const username = req.body.username?.trim();
  const userEmail = req.body.userEmail?.trim();
  req.body.userId = userId;
  const redirect_Url = PATH_MAIN;

  // ตรวจสอบรูปแบบ username/email
  if (!global.USERNAME_PATTERN_REGEX.test(username)) {
    req.flash('msg', { class: "red", text: global.USERNAME_DESCRIPTION });
    return res.redirect(redirect_Url);
  }
  if (userEmail) {
    if (!global.EMAIL_PATTERN_REGEX.test(userEmail)) {
      req.flash('msg', { class: "red", text: `รูปแบบอีเมลไม่ถูกต้อง` });
      return res.redirect(redirect_Url);
    }
  }

  try {
    await global.db.read();
    let users = global.db.data.users || [];

    //=== ตรวจสอบซ้ำ (ยกเว้นตัวเอง)
    const userOtherFind = users.find(u => u.userId !== userId && (
      (userEmail && u.userEmail && u.userEmail.toLowerCase() === userEmail.toLowerCase()) ||
      (username && u.username && u.username.toLowerCase() === username.toLowerCase())
    ));
    if (userOtherFind) {
      req.flash('msg', { class: "red", text: `อีเมล/ชื่อผู้ใช้นี้ ถูกใช้โดยผู้ใช้อื่นแล้ว` });
      return res.redirect(redirect_Url);
    }
    // console.log("userOtherFind ===> ", userOtherFind);

    //=== หา user เดิม
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      req.flash('msg', { class: "red", text: `เกิดข้อผิดพลาด ไม่พบข้อมูลของ{{sep}}"${userId}"` });
      return res.redirect(redirect_Url);
    }
    const userMe_before = users[userIndex];
    const isSameArr = [
      userMe_before.username == req.body.username,
      userMe_before.userEmail == req.body.userEmail,
    ];
    // console.log("userMe_before ===> ", userMe_before);

    //=== อัปเดตข้อมูล
    users[userIndex] = { ...userMe_before, ...req.body };
    global.db.data.users = users;
    await global.db.write();

    let msg = `อัปเดท ${userId} เรียบร้อยแล้ว`;

    //=== ถ้า user แก้ไขข้อมูลตัวเองที่สำคัญ - บังคับ logout
    if (isSameArr.includes(false)) {

      //== ลบเซสชั่นของ user คนนี้ออกจากระบบทั้งหมด (LowDb)
      if (Array.isArray(global.db.data.sessions)) {
        // const beforeCount = global.db.data.sessions.length;
        global.db.data.sessions = global.db.data.sessions.filter(s => {
          const uid = s.session?.userId ?? s.userId;
          return uid !== userId;
        });
        await global.db.write();
      }

      //== Logout ตัวเอง
      req.session.destroy((err) => {
        if (err) console.log("Session destroy error: ", err);
        return res.redirect('/');
      });
    } else {
      req.flash('msg', { class: "green", text: msg });
      return res.redirect(redirect_Url);
    }
  } catch (err) {
    console.log("error ===> ", err.message);
    res.status(404).sendFile(file404);
  }

})


//==================================
// สำหรับให้ยูสเซอร์เปลี่ยนพาสเวิร์ดเอง
// - ถูกเรียกใช้จากหน้า mycourses
// - ส่ง flase(pwd) ไปให้หน้า mycourses ฉะนั้น หน้า mycourses ต้องเขียนรับด้วย
// 
router.post(PATH_CHANGE_PASSWORD, mainAuth.isAuth, async (req,res) => {
  // console.log(`--------${req.originalUrl}--------`)
  // console.log("req.body ===> " , req.body)

  // 
  const userId = req.body.userId ? Number(req.body.userId) : req.body.userId;
  const username = req.body.username
  const newPassword = req.body.newPassword
  const confirmPassword = req.body.confirmPassword

  const redirectUrl = PATH_MAIN
  const redirectError = `/login`

  //=== 1.) ตรวจสอบว่า newPassword กับ confirmPassword ตรงกันหรือไม่
  if(newPassword != confirmPassword){
    req.flash('msg', { class:"red", text: `"รหัสผ่านใหม่" และ "ยืนยันรหัสผ่านใหม่" ไม่ตรงกัน` })
    req.flash('pwd', { newPassword:newPassword , confirmPassword:confirmPassword })
    return res.redirect(redirectUrl)
  }

  //=== 2.) ตรวจสอบรูปแบบของพาสเวิร์ด
  if (!global.PASSWORD_PATTERN_REGEX.test(newPassword)) {
    req.flash('msg', {  class: "red", text: PASSWORD_DESCRIPTION })
    req.flash('pwd', { newPassword: newPassword, confirmPassword: confirmPassword })
    return res.redirect(redirectUrl)
  }

  try {

    //=== 3.) หา user เดิม
    await global.db.read();
    let users = global.db.data.users || [];
    const userIndex = users.findIndex(u => u.userId === userId || u.username === username);
    if (userIndex === -1) {
      req.flash('msg', { class: "red", text: `User "${username}" not found ` });
      req.flash('pwd', { newPassword: newPassword, confirmPassword: confirmPassword });
      return res.redirect(redirectUrl);
    }

    //=== 4.) เข้ารหัสพาสเวิร์ดใหม่ - แล้วอัปเดตแทนของเก่า
    const newPasswordEncrypt = await bcrypt.hash(newPassword, 12);
    if (users[userIndex].userPassword === newPasswordEncrypt) {
      req.flash('pwd', { newPassword: newPassword, confirmPassword: confirmPassword });
      req.flash('msg', { class: "yellow", text: `พาสเวิร์ดเก่ากับใหม่เป็นตัวเดียวกัน` });
      return res.redirect(redirectUrl);
    }
    users[userIndex].userPassword = newPasswordEncrypt;
    global.db.data.users = users;
    await global.db.write();

    //=== 5.) - 
    req.flash('pwd', { newPassword: '', confirmPassword: '' });
    req.flash('msg', { class: "green", text: `เปลี่ยนพาสเวิร์ดเรียบร้อยแล้ว` });
    return res.redirect(redirectUrl);
  } catch (err) {
    req.flash('msg', { class: "red", text: err.message });
    return res.redirect(redirectError);
  }
})





export default router





