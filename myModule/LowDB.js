

import session from 'express-session';

// Custom lowdb session store
export class LowDbSessionStore extends session.Store {

  // 
  constructor(db) {
    super();
    this.db = db;
    if (!this.db.data) this.db.data = {};
    if (!this.db.data.sessions) this.db.data.sessions = [];
  }

  // ใช้สำหรับดึงข้อมูล session (express-session มาตรฐาน)
  // - ถูกใช้ใน express-session *** ห้ามลบ ***
  async get(sid, callback) {
    await this.db.read();
    const sess = this.db.data.sessions.find(s => s.sid === sid);
    callback(null, sess ? sess.session : null);
  }


  // ใช้สำหรับบันทึกข้อมูล session
  // - ถูกใช้ใน express-session *** ห้ามลบ ***
  async set(sid, sessionData, callback) {
    await this.db.read();
    const idx = this.db.data.sessions.findIndex(s => s.sid === sid);
    if (idx >= 0) {
      this.db.data.sessions[idx].session = sessionData;
    } else {
      this.db.data.sessions.push({ sid, session: sessionData });
    }
    await this.db.write();
    callback(null);
  }

  // ใช้สำหรับลบข้อมูล session
  // - ถูกใช้ใน express-session *** ห้ามลบ ***
  async destroy(sid, callback) {
    await this.db.read();
    this.db.data.sessions = this.db.data.sessions.filter(s => s.sid !== sid);
    await this.db.write();
    callback(null);
  }

  // ใช้สำหรับดึงข้อมูล session แบบ async/await
  async getSessionById(sid) {
    await this.db.read();
    const sess = this.db.data.sessions.find(s => s.sid === sid);
    return sess ? sess.session : null;
  }
 
}


// จับข้อมูล User จากฐาน session
export async function getSessionData(req) {
  // if (!global.db) {
  //   // กรณี db ยังไม่พร้อม
  //   return Promise.resolve({
  //     isAuth: false,
  //     userId: null,
  //     userAuthority: null,
  //     username: null,
  //     userEmail: null,
  //     userFullname: null,
  //   });
  // }
  const sessionStore = new LowDbSessionStore(global.db);
  return sessionStore.getSessionById(req.sessionID).then(sessionData => ({
    isAuth: sessionData?.isAuth || false,
    userId: sessionData?.userId || null,
    userAuthority: sessionData?.userAuthority || null,
    username: sessionData?.username || null,
    userEmail: sessionData?.userEmail || null,
    userFullname: sessionData?.userFullname || null,
  }));
}



// //=== คลาสสำหรับจัดการข้อมูลยูสเซอร์
// // import { UserManager } from './myModule/lowDB.js';
// // const userManager = new UserManager(global.db);
// // await userManager.add({ userId: 1, username: 'test', ... });
// export class UserManager {
//   constructor(db) {
//     this.db = db;
//     if (!this.db.data) this.db.data = {};
//     if (!this.db.data.users) this.db.data.users = [];
//   }

//   async getAll() {
//     await this.db.read();
//     return this.db.data.users;
//   }

//   async getById(userId) {
//     await this.db.read();
//     return this.db.data.users.find(u => u.userId === userId);
//   }

//   async getByEmail(email) {
//     await this.db.read();
//     return this.db.data.users.find(u => u.userEmail === email);
//   }

//   async add(user) {
//     await this.db.read();
//     this.db.data.users.push(user);
//     await this.db.write();
//     return user;
//   }

//   async update(userId, updateObj) {
//     await this.db.read();
//     const user = this.db.data.users.find(u => u.userId === userId);
//     if (user) {
//       Object.assign(user, updateObj);
//       await this.db.write();
//       return user;
//     }
//     return null;
//   }

//   async remove(userId) {
//     await this.db.read();
//     this.db.data.users = this.db.data.users.filter(u => u.userId !== userId);
//     await this.db.write();
//   }
// }