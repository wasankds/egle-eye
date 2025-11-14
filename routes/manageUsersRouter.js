import express from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const mySendmail = await import(`../${global.myModuleFolder}/mySendmail.js`) 
const lowDb = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/manage/users'
const PATH_SAVE = `${PATH_MAIN}/save`
const PATH_NEW = `${PATH_MAIN}/new`
const PATH_LOAD = `${PATH_MAIN}/load`
const PATH_DELETE = `${PATH_MAIN}/delete`
const PREFIX = PATH_MAIN.replace(/\//g,"_")
const ADAY_MINUTES = 24*60*60 // 1 วัน ในหน่วยนาที

//=======================================================
// หน้าแรก user
// 
// http://localhost/manage/users?sip=&rpp=20&page=1&load_uid=689eb7d54ea43b1123cb847e
// 
router.get(PATH_MAIN, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.query ===> " , req.query)

  //=== คำค้นหา - การแบ่งหน้า
  const sip = req.query.sip;
  const rpp = Number(req.query.rpp) || 20;
  const page = Number(req.query.page) || 1;
  const load_uid = req.query.load_uid ? Number(req.query.load_uid) : null;
  const skipDocs = Number((page - 1) * rpp);
  // console.log('load_uid ===> ', load_uid);

  try {
    await global.db.read();

    // จับข้อมูลยูสเซอร์ทั้งหมด
    let users = global.db.data.users || [];
    // console.log('users ===> ', users);

    // Filter by search
    let filteredUsers = users;
    if (sip) {
      const regex = new RegExp(sip, 'i');
      filteredUsers = users.filter(u =>
        regex.test(String(u.userId)) ||
        regex.test(u.username || '') ||
        regex.test(u.userFirstname || '')
      );
    }
    const totalDocs = filteredUsers.length;
    const pageNum = Math.ceil(totalDocs / rpp);
    const pagePre = Number(page) - 1 < 1 ? "-" : Number(page) - 1;
    const pageAct = Number(page);
    const pageNxt = Number(page) + 1 > pageNum ? "-" : Number(page) + 1;

    // Sort by userId desc
    filteredUsers = filteredUsers.sort((a, b) => (b.userId || 0) - (a.userId || 0));
    // Pagination
    let dataUser = filteredUsers.slice(skipDocs, skipDocs + rpp).map(u => ({
      ...u,
      userFullname: `${u.userPrefix || ''} ${u.userFirstname || ''} ${u.userLastname || ''}`.trim(),
      changesHistoryCount: Array.isArray(u.changesHistory) ? u.changesHistory.length : 0,
      isCanDelete: (u.dateTimeCanDelete && (new Date(u.dateTimeCanDelete) > new Date())) ? true : false,
    }));

    // Authority filter
    const user_current = lowDb.getSessionData(req);
    const userAuthority_current = user_current.userAuthority;
    if (['A'].includes(userAuthority_current)) {
      const userId_current = user_current.userId;
      dataUser = dataUser.filter(item => {
        const is_MeS_NotOtherS = item.userAuthority !== 'A' || item.userId == userId_current;
        return item.userAuthority !== 'O' && is_MeS_NotOtherS;
      });
    }

    // Load user for form
    let userToLoad = {};
    if (load_uid) {
      userToLoad = users.find(u => u.userId === load_uid) || {};
      if (userToLoad && userToLoad.userPassword) delete userToLoad.userPassword;
    }
    if (userToLoad && Object.keys(userToLoad).length === 0) {
      const userFlash = req.flash('userFlash');
      if (userFlash && userFlash.length > 0) {
        userToLoad = { ...userFlash[0] } || null;
      }
    }
    // console.log('userToLoad ===> ', userToLoad);

    const html = await myGeneral.renderView("manageUsers", res, {
      title: PAGE_MANAGE_USERS,
      time: myDateTime.getDate(),
      msg: req.flash('msg'),
      user: await lowDb.getSessionData(req),
      settings: await myGeneral.getSettings(),

      load_uid,
      sip,
      rpp,
      page,
      pagePre,
      pageAct,
      pageNxt,
      pageLst: pageNum,
      pageRedirect: PATH_MAIN,
      data: dataUser,
      PATH_MAIN,
      // PATH_PRINT,
      PATH_SAVE,
      PATH_NEW,
      PATH_LOAD,
      PATH_DELETE,
      PREFIX,

      USER_AUTHORITIES_JSON: JSON.stringify(global.USER_AUTHORITIES),
      item: userToLoad,
    });
    return res.send(html);
  } catch (err) {
    console.log(err.message);
    res.status(404).sendFile(file404);
  }
})



//=============================================
//
router.post(PATH_LOAD, mainAuth.isO, async (req, res) => {  
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)
  const userId = req.body.userId ? Number(req.body.userId) : null;
  const sip = req.body.sip;
  const rpp = Number(req.body.rpp) || 20;
  const page = Number(req.body.page) || 1;
  try {
    let redirectUrl = userId 
      ? `${PATH_MAIN}?sip=${sip}&rpp=${rpp}&page=${page}&load_uid=${userId}`
      : `${PATH_MAIN}?sip=${sip}&rpp=${rpp}&page=${page}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.log(err.message);
    req.flash('msg', { class: "red", text: `${err.message}` });
    return res.redirect(redirectUrl);
  }
})


//=======================================================
// ใช้กับทั้ง Create และ Update
// http://localhost:3000/manage/users?sip=&rpp=20&page=1&load_uid=100
// 
router.post(PATH_SAVE, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)

  //=== 1.) ค่าจาก req.body
  const sip = req.body.sip
  const rpp = Number(req.body.rpp) || 20
  const page = Number(req.body.page) || 1  
  delete req.body.rpp  // ลบออกด้วยไม่เช่นนั้นจะลงฐานข้อมูลด้วย
  delete req.body.sip  // ลบออกด้วยไม่เช่นนั้นจะลงฐานข้อมูลด้วย
  delete req.body.page // ลบออกด้วยไม่เช่นนั้นจะลงฐานข้อมูลด้วย

  // เปลี่ยนชนิดข้อมูลเป็นตัวเลข *** 
  req.body.userId = req.body.userId ? Number(req.body.userId) : req.body.userId
  // req.body.load_uid = req.body.load_uid ? Number(req.body.load_uid) : req.body.load_uid
  const username = req.body.username?.trim()   // ห้ามซ้ำ - อาจไม่มีถ้าเป็น New
  const userEmail = req.body.userEmail?.trim() // ห้ามซ้ำ - อาจไม่มีถ้าเป็น New
  const userId = req.body.userId               // ห้ามซ้ำ - อาจไม่มีถ้าเป็น New
  // const load_uid = req.body.load_uid ? Number(req.body.load_uid) : req.body.load_uid

  //=== 2.) URL สำหรับการ Redirect
  const redirectUrl_error = `${PATH_MAIN}`
  const redirectUrl_update = `${PATH_MAIN}?sip=${sip}&rpp=${rpp}&page=${page}&load_uid=${userId}`
  
  //=== 3.) ตรวจสอบรูปแบบของ username
  if (!global.USERNAME_PATTERN_REGEX.test(username)) {
    req.flash('userFlash', req.body )
    req.flash('msg', {class:"red", text: global.USERNAME_DESCRIPTION})
    return res.redirect(redirectUrl_update)
  }

  //=== 4.) ตรวจสอบรูปแบบของ email
  if (userEmail) {
    if (!global.EMAIL_PATTERN_REGEX.test(userEmail)) {
      req.flash('userFlash', req.body);
      req.flash('msg', { class: "red", text: `รูปแบบอีเมลไม่ถูกต้อง` });
      return res.redirect(redirectUrl_update);
    }
  }


  try {
    await global.db.read();
    let users = global.db.data.users || [];

    //=== 1.) สร้าง user ใหม่ - ตรวจสอบการซ้ำ
    if (!userId) {

      //== 1.1)  เพิ่มยูสเซอร์ได้ไม่กเกิน 100 คน
      if (users.length >= 100) {
        req.flash('userFlash', req.body);
        req.flash('msg', { class: "red", text: `เพิ่มยูสเซอร์ไม่ได้{{sep}}จำนวนครบ 100 คนแล้ว` });
        return res.redirect(redirectUrl_update);
      }

      //== 1.2) ตรวจสอบการซ้ำ - ค้นหา user อื่นๆ userEmail/username (เปลี่ยนได้ แต่ห้ามซ้ำ)
      const userFind = users.find( u =>
        ( userEmail && u.userEmail && u.userEmail.toLowerCase() === userEmail.toLowerCase()) ||
        ( username && u.username && u.username.toLowerCase() === username.toLowerCase())
      );
      if (userFind) {
        req.flash('userFlash', req.body);
        req.flash('msg', { class: "red", text: `อีเมลหรือชื่อผู้ใช้{{sep}}มีอยู่ในระบบแล้ว` });
        return res.redirect(redirectUrl_update);
      }
      // console.log('userFind ===> ', userFind);

      //== 1.3) คำนวณ userId ใหม่
      const maxId = users.length > 0 ? Math.max(...users.map(u => u.userId || 0)) : 99;
      const fstId = 100;
      const newId = maxId >= fstId ? maxId + 1 : fstId;
      req.body.userId = newId;
      // console.log('newId ===> ', newId);

      //== 1.4) Stamp วันเวลาสำหรับแก้ไข เฉพาะ new เท่านั้น (1 วัน)
      req.body.dateTimeCanDelete = myDateTime.getDateTime(1440);
      // console.log('dateTimeCanDelete ===> ', req.body.dateTimeCanDelete);

      //== 1.5) สร้างและเข้ารหัสพาสเวิร์ด
      const userPassword_pure = myGeneral.generatePassword();
      req.body.userPassword = await bcrypt.hash(userPassword_pure, global.BCRYPT_NUMBER);
      // console.log('userPassword (pure) ===> ', userPassword_pure);
      // console.log('req.body ===> ', req.body);

      //== 1.6) บันทึกลงฐานข้อมูล
      users.push({ ...req.body });

      global.db.data.users = users;
      await global.db.write();

      //== 1.7) ส่งเมล์ต่อ - เมื่อสร้าง User สำเร็จ
      const redirectUrl_new = `${PATH_MAIN}?sip=${sip}&rpp=${rpp}&page=${page}&load_uid=${newId}`;
      const flashObj = { ...req.body };
      delete flashObj.userPassword;

      if (userEmail && userEmail.includes('@') && userEmail.includes('.') && userEmail.length > 5) {
        const settingsSystem = await myGeneral.getSettingsSystem();
        if (!settingsSystem || !settingsSystem.EMAIL_WHOSEND || !settingsSystem.EMAIL_APP_PASSWORD) {
          req.flash('msg', { 
            class: "yellow", 
            text: `สร้างยูสเซอร์ ${newId} แล้ว{{sep}}แต่ไม่ได้ส่งอีเมล์ การตั้งค่าการส่งอิเมล์ไม่ถูกต้อง` 
          });
          return res.redirect(redirectUrl_new);
        }

        //=== ส่งเมล์ แจ้งยูสเซอร์ใหม่
        const info = await mySendmail.sendRegisterUserEmail(flashObj, userPassword_pure)
        if(info.response && info.response.includes('250')) {
          req.flash('msg', { 
            class : "green", 
            text: `เพิ่มยูสเซอร์และส่งอิเมล์เรียบร้อยแล้ว (${userEmail}){{sep}}(CODE : ${info.response})`
          })
          return res.redirect(redirectUrl_new)
        }else{
          req.flash('userFlash', req.body);
          req.flash('msg', { class: "red", text: `${info.message || 'ส่งอีเมล์ไม่สำเร็จ'}` });
          return res.redirect(redirectUrl_new);
        }

      } else {
        req.flash('userFlash', req.body);
        req.flash('msg', { class: "green", text: `เพิ่มยูสเซอร์ ${userEmail}` });
        return res.redirect(redirectUrl_new);
      } 
    }

    //=== 2.) กรณี Update
    else {
      //== 2.1) ค้นหาการซ้ำกับผู้ใช้อื่น - แต่ไม่รวมตัวเอง
      const userOtherFind = users.find( u =>
        u.userId !== userId && (
          (userEmail && u.userEmail && u.userEmail.toLowerCase() === userEmail.toLowerCase()) ||
          (username && u.username && u.username.toLowerCase() === username.toLowerCase()) ||
          (userId && u.userId === userId)
        )
      );
      if (userOtherFind) {
        req.flash('userFlash', req.body);
        req.flash('msg', { class: "red", text: `อีเมล/ชื่อผู้ใช้ มีอยู่ในระบบแล้ว` });
        return res.redirect(redirectUrl_update);
      }

      //== 2.2) ตรวจสอบของเดิมก่อนแก้ไข กับ req.body ที่ส่งมา ถ้าไม่เหมือนกันจะเป็น false
      const user_before = users.find(u => u.userId === userId);
      const isSameArr = [
        req.body.userStatus == 'active',
        user_before?.username == req.body.username,
        user_before?.userEmail == req.body.userEmail,
        user_before?.userAuthority == req.body.userAuthority,
      ];

      //== 2.3) อัปเดตข้อมูล user
      let updated = false;
      users = users.map(u => {
        if (u.userId === userId) {
          updated = true;
          return { ...u, ...req.body };
        }
        return u;
      });
      global.db.data.users = users;
      await global.db.write();

      //== 2.4) Return on Update
      if (updated) {
        const user_inSession = lowDb.getSessionData(req);
        let msg = `อัปเดท "${userId}" เรียบร้อยแล้ว`;

        //= 2.5.2) ลบ session ทั้งหมดของ user ที่ถูกแก้ไข - มี false อย่างน้อย 1 ตัว
        // TODO: ลบ session ใน Lowdb ถ้ามีการเปลี่ยนแปลงสำคัญ

        //= 2.5.3) ถ้า user แก้ไขข้อมูลตัวเอง ที่สำคัญ ให้ logout ทันที ****
        if (isSameArr.includes(false) && user_inSession.userId == userId) {
          req.session.destroy((err) => {
            if (err) console.log("Session destroy error: ", err);
            return res.redirect('/');
          });
          return;
        } else {
          req.flash('msg', { class: "green", text: msg });
          return res.redirect(redirectUrl_update);
        }
      } else {
        req.flash('userFlash', req.body);
        req.flash('msg', { class: "red", text: `${new Error("Not Found")}"{{sep}}"${userId}"` });
        return res.redirect(redirectUrl_update);
      }
    }
  } catch (err) {
    console.log("error ===> ", err);
    res.status(404).sendFile(file404);
  }
})


//=======================================================
// สร้าง user ใหม่ทันที - ไม่ต้องส่งอิเมล์
// 
router.post(PATH_NEW, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)

  const redirect_error = `${PATH_MAIN}`;
  try {
    await global.db.read();
    let users = global.db.data.users || [];

    //=== สร้างได้ไม่เกิน 100 คน
    if (users.length >= 100) {
      req.flash('msg', { 
        class: "red", 
        text: `เพิ่มยูสเซอร์ไม่ได้{{sep}}จำนวนครบ 100 คนแล้ว` 
      });
      return res.redirect(redirect_error);
    }

    //=== จับ userId สุดท้ายใน users
    let newId = 0;
    if (users.length > 0) {
      newId = Math.max(...users.map(u => u.userId || 0)) + 1;
    } else {
      newId = 100;
    }

    const START_PASSWORD = process.env.START_PASSWORD || 'qwerty';
    const users_toAdd = {
      userId: newId,
      userEmail: `user_${newId}@gmail.com`,
      username: `user_${newId}`,
      userPrefix: '',
      userFirstname: `user_${newId}`,
      userLastname: ``,
      userAuthority: 'U',
      userStatus: 'active',
      userPassword: await bcrypt.hash(START_PASSWORD, global.BCRYPT_NUMBER),
      dateTimeCanDelete: myDateTime.getDateTime(ADAY_MINUTES),
    };

    users.push(users_toAdd);
    global.db.data.users = users;
    await global.db.write();

    return res.send({
      isCreate: true,
      msg: `สร้างผู้ใช้ใหม่ "${users_toAdd.username}" เรียบร้อยแล้ว{{sep}}`,
      redirectUrl: `${PATH_MAIN}?rpp=20&page=1&load_uid=${newId}`
    });
  } catch (err) {
    console.log("error ===> ", err);
    res.status(404).sendFile(redirect_error);
  }
})



//=============================================
// 
router.post(PATH_DELETE, mainAuth.isO, async (req, res) => {  
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)
  // req.body ===>  { userId: '105', load_uid: '104', rpp: '20', sip: '', page: '1' }

  const rpp = req.body.rpp ? Number(req.body.rpp) : 20;
  const sip = req.body.sip || '';
  const page = req.body.page ? Number(req.body.page) : 1;
  // ข้อมูล
  const userId = req.body.userId ? Number(req.body.userId) : null;
  const load_uid = req.body.load_uid ? Number(req.body.load_uid) : null;

  //=== ตรวจสอบ load_uid ที่ส่งมา
  const load_uid_query = userId && userId != load_uid ? `&load_uid=${load_uid}` : '';
  const redirectUrl = `${PATH_MAIN}?sip=${sip}&rpp=${rpp}&page=${page}${load_uid_query}`;

  try {
    await global.db.read();
    let users = global.db.data.users || [];

    //=== 1.) ตรวจสอบ user ที่จะลบ
    const userIndex = users.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      req.flash('msg', { class: "red", text: `ไม่พบ "${userId}"{{sep}}( อาจจะถูกลบไปแล้ว )` });
      return res.redirect(redirectUrl);
    }

    //=== 2.) TODO: ตรวจสอบการใช้งาน userId ใน collection อื่น ๆ ถ้าต้องการm

    //=== 3.) ลบ User
    users.splice(userIndex, 1);
    global.db.data.users = users;
    await global.db.write();

    //=== 4.) ลบ session ทั้งหมดของ user ที่ถูกลบ ใน Lowdb
    let afterMsg = '';
    if (Array.isArray(global.db.data.sessions)) {
      const beforeCount = global.db.data.sessions.length;
      global.db.data.sessions = global.db.data.sessions.filter( s => {
        const uid = s.session?.userId ?? s.session?.userId ?? s.userId ?? s.userId;
        return uid !== userId;
      });
      await global.db.write();
      afterMsg = `[ลบ session ออกจากระบบ ${beforeCount - global.db.data.sessions.length} รายการ]`;
    }   

    req.flash('msg', { class: "green", text: `ลบยูสเซอร์ "${userId}" เรียบร้อยแล้ว{{sep}}${afterMsg}` });
    return res.redirect(redirectUrl);
  } catch (err) {
    console.log("error ===> ", err);
    req.flash('msg', { class: "red", text: err.message });
    return res.redirect(redirectUrl);
  }
})








// //=============================================
// // 
// router.post(PATH_PRINT, mainAuth.isO, async (req, res) => {  
//   // console.log(`-----------------${req.originalUrl}----------------------`)
//   // console.log("req.body ===> " , req.body)

//   const { _idArr } = req.body
//   const client = new MongoClient(dbUrl)
//   try {
//     await client.connect()
//     const db = client.db(dbName)
//     const collection = db.collection(dbColl_users)

//     const usersFind = await collection.aggregate([
//       { 
//         $match: { 
//           _id: { 
//             $in: _idArr.map(id => new ObjectId(id)) 
//           } 
//         } 
//       },
//       // // Lookup branchName from userBranches
//       // {
//       //   $lookup: {
//       //     from: global.dbColl_userBranches,
//       //     localField: 'branchId',
//       //     foreignField: 'branchId',
//       //     as: 'branchInfo'
//       //   }
//       // },
//       // {
//       //   $addFields: {
//       //     branchName: {
//       //       $ifNull: [ { $arrayElemAt: ['$branchInfo.branchName', 0] }, '' ]
//       //     }
//       //   }
//       // },
//       { $project: { branchInfo: 0 } }
//     ]).toArray();

//     if(usersFind.length == 0){
//       return res.send(JSON.stringify({
//         isPrint : false,
//         class : "red",
//         msg: `ไม่มีข้อมูล` , 
//       }))
//     }

//     //=== สร้างฟอร์มจาก HTML
//     const templatePath = path.join(global.folderForms, 'print_users.ejs');
//     const templateContent = fs.readFileSync(templatePath, 'utf8'); 
//     const htmlPage = ejs.render(templateContent, {
//       time : myDateTime.getDate() ,
//       title : `ยูสเซอร์ (${usersFind.length})`,
//       dateTime :  myDateTime.getDateTime() ,
//       usersFind : usersFind,
//     })

//     res.send(JSON.stringify({      
//       isPrint : true,
//       class : "green",
//       msg: `พิมพ์ข้อมูล ${usersFind.length} ยูสเซอร์เรียบร้อยแล้ว` ,
//       htmlPage : htmlPage ,      
//     }))

//   } catch (err) {
//     console.log("error ===> ", err.message);
//     res.send(JSON.stringify({
//       isPrint : false,
//       class : "red",
//       msg: err.message , 
//     }))
//   } finally {
//     client.close();
//   } 
// })




export default router


// //=============================================
// // 
// router.post(PATH_CHANGES, mainAuth.isO, async (req, res) => {
//   // console.log(`-----------------${req.originalUrl}------------------`)
//   // console.log("req.body ===> ", req.body)

//   //=== 0.1) จับประเภทเอกสาร
//   let { userId } = req.body
//   userId = Number(userId) // ตัวเลขเท่านั้น

//   const client = new MongoClient(global.dbUrl)
//   try {
//     await client.connect()
//     const db = client.db(global.dbName)
//     const collection = db.collection(global.dbColl_users)

//     //=== 1.) ค้นหาเอกสาร (ถ้ามี docId)
//     var userFind = await collection.findOne({ userId : userId })
//     if(!userFind){
//       return res.send(JSON.stringify({
//         isPrint: false ,
//         class:"red", 
//         msg:`ไม่พบ "${userId}"`
//       }))
//     }
//     // console.log("docFind ===> ", docFind)

//     //=== 2.) จับเฉพาะค่า changesHistory จาก docFind
//     const changesHistory = userFind.changesHistory || []

//     //=== 3.) ตรวจสอบประวัติการเปลี่ยนแปลง
//     if(changesHistory.length < 1){
//       return res.send(JSON.stringify({
//         isPrint: false ,
//         class:"yellow", 
//         msg:`ไม่พบประวัติการเปลี่ยนแปลง`
//       }))
//     }

//     //=== 3.) สร้าง HTML จาก template
//     const templatePath = path.join(folderForms, 'changes_tableRows.ejs')
//     const htmlPage =  await myGeneral.renderView(templatePath, res, {
//       title: `ประวัติการแก้ไขยูสเซอร์ : [${userFind.userId}] ${userFind.userPrefix} ${userFind.userFirstname} ${userFind.userLastname}`,
//       time: myDateTime.getDateTime(), 
//       changesHistory : changesHistory,
//     });

//     //=== 4.) ส่ง HTML กลับไป
//     res.send(JSON.stringify({
//       isPrint:true,
//       class:"green",
//       htmlPage:htmlPage
//     }))
//   } catch (err) {
//     console.log("error ===> ", err);
//     res.send(JSON.stringify({ isPrint:false, class:"red", msg:err.message}))
//   } finally {
//     client.close();
//   } 
// })




