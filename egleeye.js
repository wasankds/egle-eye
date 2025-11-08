/**
 * Simple Web Server
 * แสดงข้อมูลจาก sensor ในหน้าเว็บ
 */
// import session from 'express-session'
// import flash from 'connect-flash'
import 'dotenv/config'
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io'
import { spawn } from 'child_process';
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
await import(`./${myModuleFolder}/myGlobal.js`)
//===
const app = express();
const server = createServer(app)
const io = new Server(server)
global.io = io;
const filePy = process.env.IS_PRODUCTION == 1 ? 'dht11_reader_production.py' : 'dht11_random.py';
// ตัวแปรเก็บข้อมูลล่าสุด
let latestData = {
  temperature: 0,
  humidity: 0,
  timestamp: 0
};
global.latestData = latestData;

// ให้บริการไฟล์ static
app.set('view engine', 'ejs')
// app.use(flash())
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({extended:true,limit:'50mb'}))
app.use(express.static(global.folderPublic))
app.use((await import(`./${routesFolder}/homeRouter.js`)).default) 


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
  setTimeout(startSensor, 2000);
});


//=====================================
// -  เริ่มต้น Python sensor process
function startSensor() {
  // console.log('🚀 Starting Python sensor...');

  // เริ่มต้น process ของ Python sensor
  // - python เหมือนพิมพ์ใน command line
  // - [filePy] คือ arguments ส่งให้ python
  // *** รวมกันได้ "python sensor.py" ใน command line
  // - ซึ่ง python จะอ่านข้อมูลทุก 3 วินาทีอยู่แล้ว 
  // 
  const sensorProcess = spawn('python', [filePy]);

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
          // console.log(`📊 Data: ${sensorData.temperature}°C, ${sensorData.humidity}%`);
        } catch (error) {
          // console.log('📝 Log:', line);
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
  });
}


//=== Graceful shutdown - จับสัญญาณหยุดโปรแกรม
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
function gracefulShutdown() {
  console.log('🛑 Shutting down gracefully...');
  sensorManager.stop();
  server.close();
}