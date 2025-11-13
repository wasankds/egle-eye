// import session from 'express-session'
// import flash from 'connect-flash'
// import path from 'path';
// import { spawn } from 'child_process';
import 'dotenv/config'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import fs from 'fs';
import express from 'express';
import session from 'express-session'
import { createServer } from 'node:http';
import { Server } from 'socket.io'
import flash from 'connect-flash'
global.dbName = process.env.DB_NAME
global.dbUrl = process.env.DB_URL
global.IS_PRODUCTION = process.env.IS_PRODUCTION == 1 ? true : false
global.PROJECT_DIR = process.cwd()
const PORT = process.env.PORT_DEPLOY == 0 ? process.env.PORT_DEV : process.env.PORT_SERVER
global.DOMAIN_ALLOW = process.env.PORT_DEPLOY == 0 ? `${process.env.LOCALHOST_ALLOW}:${PORT}` : `${process.env.DOMAIN_ALLOW}`
global.dbName = process.env.DB_NAME
global.dbUrl = process.env.DB_URL
global.myModuleFolder = global.IS_PRODUCTION ? 'myModule-min' : 'myModule'
const routesFolder = global.IS_PRODUCTION ? 'routes-min' : 'routes'
// import { LowDbSessionStore } from './myModule/LowDB.js';
// import { EncryptedJSONFile } from './myModule/Crypto.js';
const LowDbSessionStore = await import(`./${myModuleFolder}/LowDB.js`).then(mod => mod.LowDbSessionStore);
const EncryptedJSONFile = await import(`./${myModuleFolder}/Crypto.js`).then(mod => mod.EncryptedJSONFile);
await import(`./${myModuleFolder}/myGlobal.js`)
//===
const app = express();
const server = createServer(app)
const io = new Server(server)
global.io = io;
//===
// ตรวจสอบไฟล์ db.json ถ้าไม่มีหรือว่างเปล่า ให้สร้างด้วย default data
// เก็บข้อมูลทุกอย่างในไฟล์ db.json 
if (!fs.existsSync(global.fileDb) || fs.readFileSync(global.fileDb, 'utf8').trim() === '') {
  fs.writeFileSync(global.fileDb, JSON.stringify({ users: [], sessions: [] }, null, 2));
}
let adapter, db;
if(global.DB_ENCRYPTED == 1) {
  // adapter = new EncryptedJSONFile('data/db.json');
  adapter = new EncryptedJSONFile(global.fileDb);
  db = new Low(adapter, { users: [], sessions: [] });
} else {
  adapter = new JSONFile(global.fileDb);
  db = new Low(adapter, { users: [], sessions: [] });
}
global.db = db;
await db.read();
if (!db.data) {
  db.data = { users: [], sessions: [] };
  await db.write();
}
app.use(session({
  secret: 'egle-eye-secret-key',
  cookie: {
    maxAge: 1000*60*60*24*30,
    // secure: process.env.DEPLOY == 'dev' ? false : true, // ใช้กับ HTTPS เท่านั้น
    httpOnly: global.IS_PRODUCTION ? true : false,
  },
  resave: false, // ต้องเป็น false เพื่อป้องกันการบันทึก session ซ้ำๆ
  saveUninitialized: true, // ต้องเป็น true เพื่อให้สามารถใช้ flash ได้
  store: new LowDbSessionStore(db)

}))
app.set('view engine', 'ejs')
app.use(flash())
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({extended:true,limit:'50mb'}))
app.use(express.static(global.folderPublic))
app.use((await import(`./${routesFolder}/startAppRouter.js`)).default) 
app.use((await import(`./${routesFolder}/homeRouter.js`)).default) 
app.use((await import(`./${routesFolder}/loginRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSettingsRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSettingsSystemRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSessionsRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageUsersRouter.js`)).default) 
app.use((await import(`./${routesFolder}/passwordRouter.js`)).default) 
//=== socket.io เชื่อมต่อกับ client
io.on('connection', (socket) => {
  console.log('🔗 New client connected:', socket.id);

  // ส่งข้อมูลล่าสุดให้ client ทันทีที่เชื่อมต่อ
  socket.emit('sensor_data', global.latestData);

  // เมื่อ client ขอข้อมูล
  socket.on('request_data', () => {
    socket.emit('sensor_data', global.latestData);
  });

  // เมื่อ client หลุดการเชื่อมต่อ
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
}); 
server.listen(PORT, () => {
  console.log(`🌐 Web Server: ${global.DOMAIN_ALLOW}`);
  // setTimeout(startSensor, 2000);
});


/* 

//=====================================
// -  เริ่มต้น Python sensor process
// let sensorProcess = null;
function startSensor() {
  // console.log('🚀 Starting Python sensor...');

  // เริ่มต้น process ของ Python sensor
  // - python เหมือนพิมพ์ใน command line
  // - [global.PY_FILE_DHT11] คือ arguments ส่งให้ python
  // *** รวมกันได้ "python sensor.py" ใน command line
  // - ซึ่ง python จะอ่านข้อมูลทุก 3 วินาทีอยู่แล้ว 
  // 
  // assign to outer-scope variable so other functions can access it
  sensorProcess = spawn('python', [global.PY_FILE_DHT11]);

  //=== รับข้อมูลจาก stdout - python print() จะส่งมาทางนี้
  // stdout ย่อมาจาก Standard Output (ช่องทางส่งข้อมูลมาตรฐาน)
  // - เป็นช่องทางที่ Process ใช้ในการ ส่งข้อมูลออก
  sensorProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        try {
          const sensorData = JSON.parse(line);
          global.latestData = sensorData;
          console.log(`📊 Data: ${sensorData.temperature}°C, ${sensorData.humidity}%`);
        } catch (error) {
          console.log('📝 Log:', line);
        }
      }
    }
  });
  // รับข้อความจาก stderr (เช่น ข้อความ error)
  sensorProcess.stderr.on('data', (data) => {
    console.log('⚠️ Sensor:', data.toString());
  });
  // ตรวจสอบว่า process ปิดตัวลงหรือไม่
  sensorProcess.on('close', (code) => {
    console.log(`❌ Sensor process closed: ${code}`);
    // clear reference when process exits
    sensorProcess = null;
  });
} 

*/

