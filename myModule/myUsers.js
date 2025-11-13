const LowdbSessionStore = await import(`../${global.myModuleFolder}/LowDB.js`).then(mod => mod.LowdbSessionStore);

//================================================
// จับข้อมูล User จากฐาน session
export function getSessionData(req) {
  // // กรณี เอาหมดเลย
  // return sessionStore.getSessionById(req.sessionID); 
  const sessionStore = new LowdbSessionStore(global.db);
  return sessionStore.getSessionById(req.sessionID).then(sessionData => ({
    isAuth: sessionData?.isAuth || false,
    userId: sessionData?.userId || null,
    userAuthority: sessionData?.userAuthority || null,
    username: sessionData?.username || null,
    userEmail: sessionData?.userEmail || null,
    userFullname: sessionData?.userFullname || null,
  }));
}

