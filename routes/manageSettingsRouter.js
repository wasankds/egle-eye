// import archiver from 'archiver' // สำหรับสร้างไฟล์ zip
import express from 'express' ;
const router = express.Router() ;
import { exec } from 'child_process' // สำหรับรันคำสั่ง Terminal
import path from 'path'
import fs from 'fs'  ;
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDb = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/manage/settings'  ;
const PATH_SAVE = `${PATH_MAIN}/save`  ;
const PATH_BACKUP_DB = `${PATH_MAIN}/backup-db`
const PATH_DOWNLOAD_BACKUP = `${PATH_MAIN}/download-backup`
const PATH_REMOVE_BACKUP = `${PATH_MAIN}/remove-backup`
const PATH_UPDATE_SYSTEM = `${PATH_MAIN}/update-system`
const PATH_RESTART_PM2 = `${PATH_MAIN}/restart-pm2`
const PREFIX = PATH_MAIN.replace(/\//g,"_") 

//================================================================
// โหลด settings หน้าแรก
// 
router.get(PATH_MAIN, mainAuth.isOA , async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)  
  // console.log(req.query)

  //=== query string สำหรับคลิก tab เช่น tab=4
  const { tab:tabNumberClicked } = req.query

  try {
    //=== อ่านชื่อไฟล์ .json ในโฟลเดอร์ backup
    const jsonFiles = await fs.promises.readdir(global.folderBackup);
    const backupFiles = jsonFiles.filter(name => name.endsWith('.json'));

    //=== อ่าน settings จาก Lowdb
    await global.db.read();
    const settings = global.db.data.settings || {};

    const html = await myGeneral.renderView('manageSettings', res, {
      title : PAGE_MANAGE_SETTINGS ,
      time : myDateTime.getDate(),  
      msg : req.flash('msg'),
      user : await lowDb.getSessionData(req),
      settings,
      backupFiles,
      tabNumberClicked,
      PATH_MAIN,
      PATH_SAVE,
      PATH_RESTART_PM2,
      PATH_BACKUP_DB,
      PATH_UPDATE_SYSTEM,
      PATH_DOWNLOAD_BACKUP,      
      PATH_REMOVE_BACKUP,
      PREFIX,
    })
    res.send(html)
  } catch (err) {
    console.log(err)
    res.status(404).sendFile(file404)
  }
})



//================================================================
// Save
// 
router.post(PATH_SAVE, mainAuth.isOA, async (req,res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log(req.body)
  
  try {
    await global.db.read();
    req.body.AUTO_BACKUP_DATABASE = req.body.AUTO_BACKUP_DATABASE === '1' ? 1 : 0;
    req.body.LOGIN_NOTIFY_TELEGRAM = req.body.LOGIN_NOTIFY_TELEGRAM === '1' ? 1 : 0;
    req.body.LOGIN_NOTIFY_EMAIL = req.body.LOGIN_NOTIFY_EMAIL === '1' ? 1 : 0;
    global.db.data.settings = req.body;
    await global.db.write();
    req.flash('msg', { class:"green", text:`บันทึกข้อมูลการตั้งค่าแล้ว` })
    res.redirect(PATH_MAIN)
  } catch (err) {
    req.flash('msg', { class:"red", text:`${err.message}` })
    res.redirect(PATH_MAIN)
  }
})


//=======================================================
//
router.post(PATH_BACKUP_DB,  mainAuth.isOA , async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`) 
  // console.log("req.body ===> " , req.body)

  // สำเนาไฟล์ db.json ไปไว้ที่โฟลเดอร์ backup และเปลี่ยนชื่อไฟล์
  const path_redirect = `${PATH_MAIN}?tab=2`;
  try {
    // สร้างชื่อไฟล์ backup db_YYYY-mm-dd_HH-mm.json
    const dt = myDateTime.getDateTime().replace(/:/g, '-').replace(/ /g, '_');
    const backupFileName = `db_${dt}.json`;
    const backupFilePath = path.join(global.folderBackup, backupFileName);

    // ตรวจสอบว่าโฟลเดอร์ backup มีอยู่หรือยัง ถ้าไม่มีก็สร้าง
    if (!fs.existsSync(global.folderBackup)) {
      fs.mkdirSync(global.folderBackup, { recursive: true });
    }

    // สำเนาไฟล์ db.json ไปยัง backup
    fs.copyFileSync(global.fileDb, backupFilePath);

    req.flash('msg', { class: "green", text: `สำรองข้อมูล db.json ไปยัง ${backupFileName} สำเร็จ` });
    res.redirect(path_redirect);
  } catch (err) {
    console.log(err)
    req.flash('msg', { class:"red", text:err.message})
    res.redirect(path_redirect)
  }
})



//=======================================================
// ดาวน์โหลดไฟล์ backup
//
router.get(`${PATH_DOWNLOAD_BACKUP}/:filename`,  mainAuth.isOA , async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)
  // console.log("req.params ===> " , req.params)

  const path_redirect = `${PATH_MAIN}?tab=2`;
  try {
    const { filename } = req.params;
    const backupPath = path.join(global.folderBackup, filename);
    if (!fs.existsSync(backupPath)) {
      req.flash('msg', {
        class: "red",
        text: `ไม่พบไฟล์ backup ที่ระบุ: ${filename}`
      });
      return res.redirect(path_redirect);
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = fs.createReadStream(backupPath);
    fileStream.on('error', (err) => {
      console.log('File stream error:', err);
      if (!res.headersSent) {
        req.flash('msg', {
          class: "red",
          text: `เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์: ${err.message}`
        });
        return res.redirect(path_redirect);
      }
    });
    fileStream.pipe(res);
  } catch (err) {
    console.log(err)
    req.flash('msg', { class:"red", text:err.message})
    res.redirect(path_redirect)
  }
})

//=======================================================
// ลบไฟล์ backup ที่ระบุ
//
router.get(`${PATH_REMOVE_BACKUP}/:filename`,  mainAuth.isOA , async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)
  // console.log("req.params ===> " , req.params)

  const path_redirect = `${PATH_MAIN}?tab=2`;
  try {
    const { filename } = req.params;
    const backupPath = path.join(global.folderBackup, filename);
    if (!fs.existsSync(backupPath)) {
      req.flash('msg', {
        class: "red",
        text: `ไม่พบไฟล์ backup ที่ระบุ: ${filename}`
      });
      return res.redirect(path_redirect);
    }
    fs.unlink(backupPath, (err) => {
      if (err) {
        console.error('Error deleting backup file:', err);
        req.flash('msg', {
          class: "red",
          text: `เกิดข้อผิดพลาดในการลบไฟล์ backup: ${err.message}`
        });
        return res.redirect(path_redirect);
      }
      req.flash('msg', {
        class: "green",
        text: `ลบไฟล์ backup สำเร็จ: ${filename}`
      });
      res.redirect(path_redirect);
    });
  } catch (err) {
    console.log(err)
    req.flash('msg', { class:"red", text:err.message})
    res.redirect(path_redirect)
  }
})


//=======================================================
//
router.post(PATH_UPDATE_SYSTEM,  mainAuth.isOA , async (req, res) => {

  try {
    //=== รันคำสั่งจาก package.json ที่กำหนดไว้
    const rootDir = process.cwd()
    const path_redirect = `${PATH_MAIN}?tab=2`;

    //=== update ระบบโดยใช้ git pull - <path/to/your/repo>
    // - แต่ต้องตรวจสอบ .env SOURCE_CODE ก่อนว่าเป็น main หรือเปล่า ถ้าเป็น main อัปเดทไม่ได้
    // - main(ไม่ใช่ branch) แต่เป็นตัวที่บอกว่า เป็นจุดที่โค้ดถูกพัฒนาขึ้นมา
    // - ตัว deploy ให้เซ็ต SOURCE_CODE เป็น main ด้วย
    // - ยกเว้นบน VPS ที่นำไปใช้งานจริง หรือ Server ของลูกค้า 
    const sourceCode = process.env.SOURCE_CODE || '';
    if (!sourceCode) {
      req.flash('msg', { 
        class: "red", 
        text: `ไม่พบพารามิเตอร์ SOURCE_CODE ใน .env` 
      });
      return res.redirect(path_redirect);
    }else if (sourceCode === 'main') {
      req.flash('msg', { 
        class: "red", 
        text: `ไม่สามารถอัปเดท Source Code ที่เป็น 'main' ได้` 
      });
      return res.redirect(path_redirect);
    }else if (sourceCode !== 'copy') {
      req.flash('msg', { 
        class: "red", 
        text: `ไม่สามารถอัปเดท Source Code ที่ไม่ใช่ 'copy'` 
      });
      return res.redirect(path_redirect);
    }else if(sourceCode === 'copy'){
      const cmd = `cd ${rootDir} && git pull origin main`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          req.flash('msg', { 
            class: "red", 
            text: `Backup error: ${error.message}` 
          });
          return res.redirect(path_redirect);
        }
        const msg = `อัปเดทระบบสำเร็จ{{sep}}${stdout}{{sep}}${stderr}{{sep}}โปรดเริ่มต้นระบบใหม่`
        req.flash('msg', { class: "green", text: msg });
        res.redirect(path_redirect);
      });
    }  
  } catch (err) {
    console.log(err)
    req.flash('msg', { class:"red", text:err.message})
    res.redirect(path_redirect)
  }

})



//=======================================================
//
router.post(PATH_RESTART_PM2,  mainAuth.isOA , async (req, res) => {
  // console.log(`-----------------${req.originalUrl}------------------`)
  // console.log("req.body ===> " , req.body)

  const rootDir = process.cwd();
  const chgDir = `cd ${rootDir}`;
  const path_redirect = `${PATH_MAIN}?tab=2`;

  //=== ตรวจสอบ process ด้วย pm2 jlist (JSON)
  exec('pm2 jlist', (error, stdout, stderr) => {

    //== ตรวจสอบ error เบื้องต้น
    if (error) {
      req.flash('msg', { 
        class: "red", 
        text: `เกิดข้อผิดพลาดในการตรวจสอบ PM2: ${error.message}` 
      });
      return res.redirect(path_redirect);
    }
    let pm2List = [];

    //== แปลง JSON ที่ได้มาเป็น object
    try {
      pm2List = JSON.parse(stdout);
    } catch (e) {
      req.flash('msg', { 
        class: "red", 
        text: `อ่านข้อมูล PM2 ไม่สำเร็จ: ${e.message}` 
      });
      return res.redirect(path_redirect);
    }

    //== ตรวจสอบชื่อ process ที่ต้องการ (เช่น 'mpos')
    const processName = 'mpos';
    const found = pm2List.some(proc => proc.name === processName);
    if (!found) {
      req.flash('msg', { 
        class: "red", 
        text: `ไม่พบโปรเซสที่รันด้วย PM2 ชื่อ '${processName}' ในระบบ` 
      });
      return res.redirect(path_redirect);
    }

    //== แจ้งผู้ใช้ก่อน แล้วค่อย restart ใน background
    req.flash('msg', { class: "green", text: `กำลังรีสตาร์ทระบบ...{{sep}}หลังรีสตาร์ทให้โหลดหน้าเว็บใหม่` });
    res.redirect(path_redirect);

    //== รีสตาร์ท PM2
    //   - delay เล็กน้อยให้ response กลับไปก่อน
    setTimeout(() => {
      const restartNpm = `npm run restart`;
      exec(`${chgDir} && ${restartNpm}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
        }
      });
    }, 1000); 
    
  });

})



export default router









