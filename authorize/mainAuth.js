const { LowDbSessionStore } = await import(`../${global.myModuleFolder}/LowDB.js`) ; 

const auth = {

  //=================================
  // - ถ้า Login แล้วให้ไปต่อ 
  // - ถ้ายังให้ไปที่หน้า Login
  isAuth : async (req, res, next) => {
    try {
      const store = new LowDbSessionStore(global.db);
      const sessionData = await store.getSessionById(req.sessionID);
      // console.log("auth.isAuth ===>", req.session.isAuth)
      if (sessionData && req.session.isAuth) {
        next();
      } else {
        // console.log("---- คุณยังไม่ได้ Login ----");
        req.flash('msg', { class: "red", text: 'คุณยังไม่ได้ Login' });
        res.redirect("/login");
      }
    } catch (err) {
      console.error("Error reading db.json:", err);
      res.status(500).send("Internal Server Error");
    }
  },


  //=== ถ้า Login แล้ว ถ้าจะมาที่หน้า login อีก -> ให้ไปที่หน้าแรกเลย
  isLogged: async (req, res, next) => {
    try {
      const store = new LowDbSessionStore(global.db);
      const sessionData = await store.getSessionById(req.sessionID);
      if (sessionData && req.session.isAuth) {
        req.flash('msg', { class: "blue", text: 'คุณ Login เรียบร้อยแล้ว', });
        res.redirect("/");
      } else {
        next();
      }
    } catch (err) {
      console.error("Error reading db.json:", err);
      res.status(500).send("Internal Server Error");
    }
  },
  
  //=================================
  // Login ในฐานะ Owner หรือไม่
  isO : async (req, res, next) => {
    try {
      const store = new LowDbSessionStore(global.db);
      const sessionData = await store.getSessionById(req.sessionID);
      const authorizeArr = ["O"];
      if (sessionData && sessionData.isAuth && authorizeArr.includes(sessionData.userAuthority)) {
        next();
      } else {
        req.flash('msg', { class: "red", text: 'เฉพาะผู้ใช้งานระดับ O เท่านั้น' });
        res.redirect("/");
      }
    } catch (err) {
      console.error("Error reading db.json:", err);
      res.status(500).send("Internal Server Error");
    }
  },

  //=================================
  // Login ในฐานะ Admin/Owner หรือไม่
  //
  isOA: async (req, res, next) => {
    try {
      const store = new LowDbSessionStore(global.db);
      const sessionData = await store.getSessionById(req.sessionID);
      const authorizeArr = ["O", "A"];
      if (sessionData && sessionData.isAuth && authorizeArr.includes(sessionData.userAuthority)) {
        next();
      } else {
        req.flash('msg', { class: "red", text: 'เฉพาะผู้ใช้งานระดับ O/A เท่านั้น' });
        res.redirect("/");
      }
    } catch (err) {
      console.error("Error reading db.json:", err);
      res.status(500).send("Internal Server Error");
    }
  },

}

export default auth




// const { MongoClient } = require('Ongodb');
// const url = require('url');
// const mm = require("../mymodule/mymodule.js")

// const mauth = {

//   //=================================
//   // - ถ้า Login แล้วให้ไปต่อ 
//   // - ถ้ายังให้ไปที่หน้า Login
//   isAuth : (req, res, next) => {
//     console.log("mauth.isAuth ===>", req.session.isAuth)
//     if(req.session.isAuth){
//       next()
//     }else{
//       req.flash('msg', {
//         class : "red", 
//         text : 'คุณยังไม่ได้ Login'
//       })
//       res.redirect("/")
//     }
//   },

//   //=================================
//   // Login ในฐานะ Owner หรือไม่
//   isAuthOwner : (req, res, next) => {
//     console.log("mauth.isAuthOwner.isAuth ===>", req.session.isAuth)
//     const authorizeArr = ["O"]
//     if(req.session.isAuth && authorizeArr.includes(req.session.userAuthority)){
//       next()
//     }else{
//       req.flash('msg', {
//         class : "red", 
//         text : 'เฉพาะผู้ใช้งานระดับ Owner เท่านั้น'
//       })
//       res.redirect("/")    
//     }
//   },

//   //=================================
//   // Login ในฐานะ Admin/Owner หรือไม่
//   // 
//   isAuthAdmin : (req, res, next) => {
//     // console.log("mauth.isAuthOwner.userAuthority ===>", req.session.userAuthority)
//     console.log("mauth.isAuthAdmin.isAuth ===>", req.session.isAuth)
//     const authorizeArr = ["O","A"]
//     if(req.session.isAuth && authorizeArr.includes(req.session.userAuthority)){
//       next()
//     }else{
//       req.flash('msg', {
//         class : "red", 
//         text : 'เฉพาะผู้ใช้งานระดับ Admin/Owner เท่านั้น'
//       })
//       res.redirect("/")    
//     }
//   },

//   logger : (req, res, next) => {
//     const url_parts = url.parse(req.url, true);
//     const host =  req.get('host');
//     const path = url_parts.pathname;
//     const nowLocal =  mm.nowLocal()
//     console.log(`${host}_${path}_${ nowLocal }`)

//     const client = new MongoClient(dbUrl);
//     const main = async () => {
//       await client.connect()
//       const db = client.db(dbName)
//       const collection = db.collection(dbColl_visits)
//       await collection.insertOne({
//         host: host,
//         path: path,
//         now:new Date() ,
//         nowLocal:nowLocal ,
//       })
//     }
//     main().then( () =>     { next()         })
//           .catch( (err) => { next(err)      })
//           .finally( () =>  { client.close() })
//   },

//   //=== ถ้า Login แล้ว ถ้าจะมาที่หน้า login อีก -> ให้ไปที่หน้าแรกเลย
//   isLogged : (req, res, next) => {
//     if(req.session.isAuth){    
//       req.flash('msg', {
//         class : "blue", 
//         text : 'คุณ Login เรียบร้อยแล้ว' ,
//       })
//       res.redirect("/")
//     }else{
//       next()
//     }
//   }
  
// }

// Odule.exports = mauth


  // //=================================
  // // Login ในฐานะ Owner หรือไม่
  // isOSA : async (req, res, next) => {
  //   const userAuthority = req.session.userAuthority
  //   const authorizeArr = ["O","S","A"]
  //   if (userAuthority && authorizeArr.includes(userAuthority)) {
  //     next()
  //   } else {
  //     req.flash('msg', { class: "red",text: 'เฉพาะผู้ใช้งานระดับ O/S/A เท่านั้น'});
  //     res.redirect("/")
  //   }
  // },