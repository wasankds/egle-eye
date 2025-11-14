// import * as lowDb from "../mymodule/lowDb.js" 
// import * as myDateTime from "../mymodule/myDateTime.js"
// import * as myGeneral from "../mymodule/myGeneral.js" 
import express from 'express'
const router = express.Router()
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${myModuleFolder}/myDateTime.js`)
const lowDb = await import(`../${myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/manage/sessions'
const PATH_DELETE = `${PATH_MAIN}/delete`
const PATH_CLEAR = `${PATH_MAIN}/clear`

//=======================================================
//
// 
router.get(PATH_MAIN, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.query ===> " , req.query)
  // const user = await lowDb.getSessionData(req);
  // console.log('user ===> ', user);

  //=== คำค้นหา - การแบ่งหน้า
  const rpp = Number(req.query.rpp) || 20;
  const page = Number(req.query.page) || 1;
  const skipDocs = Number((page - 1) * rpp);
  try {
    await global.db.read();
    const allSessions = global.db.data.sessions || [];
    const totalDocs = allSessions.length;
    const pageNum = Math.ceil(totalDocs / rpp);
    const pagePre = Number(page) - 1 < 1 ? "-" : Number(page) - 1;
    const pageAct = Number(page);
    const pageNxt = Number(page) + 1 > pageNum ? "-" : Number(page) + 1;

    // จับข้อมูล และจัดเรียงตาม username
    const sortedSessions = [...allSessions].sort((a, b) => (b.session?.username || '')
                                           .localeCompare(a.session?.username || ''));
    // Paginate
    const oneDayMs = 1000 * 60 * 60 * 24;
    const oneHourMs = 1000 * 60 * 60;
    const dataSessions = sortedSessions.slice(skipDocs, skipDocs + rpp).map(sess => {

      // Format expires
      let expiresFormat = '';
      if (sess.session.cookie.expires) {
        const dt = new Date(sess.session.cookie.expires);
        expiresFormat = dt.toLocaleString('en-GB', {  
          timeZone: 'Asia/Bangkok', hour12: false 
        }).replace(/\//g, '-');
      }

      // Duration days/hours
      let durationDaysHours = '';
      if (sess.session.cookie.expires) {
        const now = Date.now();
        const exp = new Date(sess.session.cookie.expires).getTime();
        const diff = exp - now;
        const days = Math.floor(diff / oneDayMs);
        const hours = Math.round(((diff / oneHourMs) % 24) * 100) / 100;
        durationDaysHours = `${days}D+${hours}H`;
      }
      return {
        expiresFormat,
        sid: sess.sid,
        isAuth: sess.session?.isAuth,
        username: sess.session?.username,
        userId: sess.session?.userId,
        userAuthority: sess.session?.userAuthority,
        userFullname: sess.session?.userFullname,
        durationDaysHours,
      };
    });
    // console.log('dataSessions ===> ', dataSessions);

    const html = await myGeneral.renderView("manageSessions", res, {
      title: PAGE_MANAGE_SESSIONS,
      time: myDateTime.getDate(),
      msg: req.flash('msg'),
      user : await lowDb.getSessionData(req), 
      settings : await myGeneral.getSettings(),

      rpp,
      page,
      pagePre,
      pageAct,
      pageNxt,
      pageLst: pageNum,
      pageRedirect: PATH_MAIN,

      data: dataSessions,
      PATH_MAIN,
      PATH_DELETE,
      PATH_CLEAR,
    });
    return res.send(html);
  } catch (err) {
    console.log(err.message);
    res.status(404).sendFile(file404);
  }
})





//=============================================
// 
router.post(PATH_DELETE, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)
  // req.body ===>  { sid: 'DLqLfWdZVzajzQzXdMZB3B_yHUJmpMnF', rpp: '20', page: '1' }

  const { sid } = req.body;
  const rpp = Number(req.body.rpp) || 20;
  const page = Number(req.body.page) || 1;
  const redirectUrl = `${PATH_MAIN}?rpp=${rpp}&page=${page}`;
  try {
    await global.db.read();
    let sessions = global.db.data.sessions || [];
    const beforeLen = sessions.length;
    sessions = sessions.filter(sess => sess.sid !== sid);
    global.db.data.sessions = sessions;
    await global.db.write();

    if (sessions.length < beforeLen) {
      req.flash('msg', { class: "green", text: `ลบ "${sid}" เรียบร้อยแล้ว` });
      return res.redirect(redirectUrl);
    } else {
      req.flash('msg', { class: "red", text: `ไม่พบ "${sid}"{{sep}}อาจจะถูกลบไปแล้ว` });
      return res.redirect(redirectUrl);
    }
  } catch (err) {
    req.flash('msg', { class: "red", text: err.message });
    return res.redirect(redirectUrl);
  }
})



//=============================================
// ล้างเซสชั่นที่ว่างเปล่า
//
router.get( PATH_CLEAR, mainAuth.isO, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.query ===> " , req.query)
  const rpp = Number(req.query.rpp) || 20;
  const page = Number(req.query.page) || 1;
  const redirectUrl = `${PATH_MAIN}?rpp=${rpp}&page=${page}`;
  try {
    await global.db.read();
    let sessions = global.db.data.sessions || [];
    const beforeLen = sessions.length;
    // ลบเซสชั่นที่ไม่มีคีย์ isAuth
    sessions = sessions.filter(sess => sess.session && sess.session.isAuth === true);
    const deletedCount = beforeLen - sessions.length;
    global.db.data.sessions = sessions;
    await global.db.write();
    req.flash('msg', {
      class: "green",
      text: `ล้างเซสชั่นว่างจำนวน ${deletedCount} เซสชั่น{{sep}}เรียบร้อยแล้ว`
    });
    res.redirect(redirectUrl);
  } catch (err) {
    req.flash('msg', { class: "red", text: err.message });
    res.redirect(redirectUrl);
  }

})


export default router


