import 'dotenv/config'
import { exec } from 'child_process';
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import fs from 'fs';
import path from 'path';
import express from 'express';
import session from 'express-session'
import { createServer } from 'node:http';
import { Server } from 'socket.io'
// import { createProxyMiddleware } from 'http-proxy-middleware';
// // redis adapter - start
// import { createAdapter } from '@socket.io/redis-adapter';
// import { createClient } from 'redis';
// // redis adapter - end
import flash from 'connect-flash'
import e from 'connect-flash';
const { pigpio } = await import('pigpio-client');
global.dbName = process.env.DB_NAME
global.dbUrl = process.env.DB_URL
global.IS_PRODUCTION = process.env.IS_PRODUCTION == 1 ? true : false
global.PROJECT_DIR = process.cwd()
const PORT = process.env.PORT_DEPLOY == 0 ? process.env.PORT_DEV : process.env.PORT_SERVER
global.DOMAIN_ALLOW = process.env.PORT_DEPLOY == 0 ? `${process.env.LOCALHOST_ALLOW}:${PORT}` : `${process.env.DOMAIN_ALLOW}`
global.DOMAIN_URL = process.env.DOMAIN_URL
global.dbName = process.env.DB_NAME
global.dbUrl = process.env.DB_URL
global.myModuleFolder = global.IS_PRODUCTION ? 'myModule-min' : 'myModule'
const routesFolder = global.IS_PRODUCTION ? 'routes-min' : 'routes'
const { EncryptedJSONFile } = await import(`./${global.myModuleFolder}/Crypto.js`);
const { LowDbSessionStore } = await import(`./${global.myModuleFolder}/LowDb.js`);
await import(`./${global.myModuleFolder}/myGlobal.js`)
if(process.platform === 'linux') {
  await import(`./${global.myModuleFolder}/myVideoProcess.js`) 
}
const app = express();
const server = createServer(app)
const io = new Server(server)
// // redis adapter - start
// const pubClient = createClient({ url: 'redis://localhost:6379' });
// const subClient = pubClient.duplicate();
// await pubClient.connect();
// await subClient.connect();
// io.adapter(createAdapter(pubClient, subClient));
// redis adapter - end
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
// app.use('/videos', express.static(global.folderVideos));
app.use((await import(`./${routesFolder}/startAppRouter.js`)).default) 
app.use((await import(`./${routesFolder}/homeRouter.js`)).default) 
app.use((await import(`./${routesFolder}/loginRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSettingsRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSettingsSystemRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageSessionsRouter.js`)).default) 
app.use((await import(`./${routesFolder}/manageUsersRouter.js`)).default) 
app.use((await import(`./${routesFolder}/passwordRouter.js`)).default) 
app.use((await import(`./${routesFolder}/userInfoRouter.js`)).default)
app.use((await import(`./${routesFolder}/switchRouter.js`)).default) 
app.use((await import(`./${routesFolder}/cameraRouter.js`)).default) 
app.use((await import(`./${routesFolder}/videosRouter.js`)).default)
//=== socket.io เชื่อมต่อกับ client
io.on('connection', (socket) => {
  // console.log('🔗 New client connected:', socket.id);

  socket.emit('button_pressed', {
    buttonId: 's01' ,
    relayState: global.RELAY1_STATE
  })

  socket.emit('button_pressed', {
    buttonId: 's02' ,
    relayState: global.RELAY2_STATE
  })

  // // เมื่อ client ขอข้อมูล
  // socket.on('request_data', () => {
  //   socket.emit('sensor_data', global.latestData);
  // });

  // เมื่อ client หลุดการเชื่อมต่อ
  socket.on('disconnect', () => {      
    // console.log('❌ Client disconnected:', socket.id);
  });    
}); 
server.listen(PORT, () => {
  console.log(`🌐 Web Server 1 : ${global.DOMAIN_ALLOW}`);
});


// อ่านภาพ jpg ล่าสุดจากโฟลเดอร์ videos-extract แล้วส่งไปยัง client ผ่าน socket.io ทุก 500ms
const MAX_JPG = 50; // กำหนดจำนวนสูงสุด
const intervalMs = 1000 / global.VIDEO_EMIT_FRAMERATE;
setInterval(() => {
  fs.readdir(global.folderVideosExtract, (err, files) => {
    if (err) return;

    // หาไฟล์ jpg ทั้งหมด พร้อมเวลาแก้ไข
    const jpgObjs = files.filter(f => f.endsWith('.jpg'))
      .map(f => ({
        file: f,
        mtime: fs.statSync(path.join(global.folderVideosExtract, f)).mtime
      }));
    if (jpgObjs.length === 0) return;

    // ลบไฟล์ jpg ที่เกิน MAX_JPG (ลบเก่าสุด)
    if (jpgObjs.length > MAX_JPG) {
      const toDelete = jpgObjs.sort((a, b) => a.mtime - b.mtime).slice(0, jpgObjs.length - MAX_JPG);
      toDelete.forEach(f => fs.unlink(path.join(global.folderVideosExtract, f.file), () => {}));
    }

    // หาไฟล์ jpg ล่าสุด
    const latestObj = jpgObjs.sort((a, b) => b.mtime - a.mtime)[0];
    const imgPath = path.join(global.folderVideosExtract, latestObj.file);
    fs.readFile(imgPath, (err, data) => {
      if (!err && data) {
        const base64Image = data.toString('base64');
        if(base64Image.length > 10000) { // ตรวจสอบขนาดภาพ
          io.emit('camera_image', {
              filename : latestObj.file,
              base64Image : base64Image
            }
          );
        }
      }
    });
  });
}, intervalMs);



//=== ตั้งค่าการใช้งาน GPIO บน Raspberry Pi
if (process.platform === 'linux') {
  global.gpio = pigpio({ host: 'localhost' });

  // เมื่อเชื่อมต่อสำเร็จ
  global.gpio.once('connected', () => {
    console.log('<--- ✅ pigpio-client connected --->');
    console.log('global.RELAY1_STATE ===> ' , global.RELAY1_STATE, global.RELAY1_STATE == 0 ? '[ON]' : '[OFF]' );
    console.log('global.RELAY2_STATE ===> ' , global.RELAY2_STATE, global.RELAY2_STATE == 0 ? '[ON]' : '[OFF]' );
    // console.log('global.SERVO1_PIN ===> ' , global.SERVO1_PIN );
    // console.log('global.SERVO2_PIN ===> ' , global.SERVO2_PIN);
    // //=== LED1 ***
    // global.led1 = global.gpio.gpio(Number(global.LED1_PIN));
    // global.led1.modeSet('output');
    // global.led1.write(global.LED1_STATE); // ทดสอบเปิด LED


    //=== RELAY1 ***
    global.relay1 = global.gpio.gpio(Number(global.RELAY1_PIN));
    global.relay1.modeSet('output');
    global.relay1.write(global.RELAY1_STATE); // เปิด RELAY
    //=== RELAY2 ***
    global.relay2 = global.gpio.gpio(Number(global.RELAY2_PIN));
    global.relay2.modeSet('output');
    global.relay2.write(global.RELAY2_STATE); // เปิด RELAY
    //=== BTN1 ***
    global.btn1 = global.gpio.gpio(global.BTN1_PIN);
    global.btn1.modeSet('input');
    global.btn1.pullUpDown(2); // PUD_UP
    //=== BTN2 ***
    global.btn2 = global.gpio.gpio(global.BTN2_PIN);
    global.btn2.modeSet('input');
    global.btn2.pullUpDown(2); // PUD_UP
    // //=== สร้าง object servo1, servo2
    // global.servo1 = global.gpio.gpio(global.SERVO1_PIN);
    // global.servo2 = global.gpio.gpio(global.SERVO2_PIN);

    // สมมติ global.gpio.gpio(pin) สร้าง object สำหรับแต่ละขา
    global.stepperPins = [
      global.gpio.gpio(global.STEPPER1_PIN1),
      global.gpio.gpio(global.STEPPER1_PIN2),
      global.gpio.gpio(global.STEPPER1_PIN3),
      global.gpio.gpio(global.STEPPER1_PIN4)
    ];    

    //=== ตรวจสอบค่าปุ่ม 1 - รอบแรก
    global.btn1.read().then( val => {
      console.log(`btn1 initial value: ${val}`); // 1 คือ ปุ่มไม่ถูกกด (active low)
    }).catch(err => {
      console.error('btn1 read error:', err);
    });
    //=== subscribe notify - เมื่อมีการกดปุ่ม
    global.btn1.notify((level, tick) => {
      // console.log(`btn1 notify: level=${level}, tick=${tick}`);
      // btn1 notify: level=1, tick=1777072481
      // push switch - กดติด ปล่อยดับ
      // level === 0 คือ ปุ่มถูกกด (active low) 
      // level === 1 คือ ปุ่มปล่อย
      if (level === 0) {
        //== เปิด/ปิด RELAY1
        const newRelayState = global.RELAY1_STATE === 1 ? 0 : 1;
        global.relay1.write(newRelayState);
        global.RELAY1_STATE = newRelayState;
        // //=== เขียนลง LowDb - ยังไม่ใช้ ***
        // global.db.read().then( async () => {
        //   // //== สถานะ LED1 กับ RELAY1
        //   // if (!global.db.data.let1State) {
        //   //   global.db.data.let1State = {};            
        //   // }
        //   // global.db.data.let1State['led1'] = {
        //   //   ledState: global.LED1_STATE,
        //   //   timeStamp: myDateTime.now()
        //   // };

        //   // //== สถานะ LED1 กับ RELAY1
        //   // if (!global.db.data.relay1State) {
        //   //   global.db.data.relay1State = {};            
        //   // }
        //   // global.db.data.relay1State['relay1'] = {
        //   //   relayState: global.RELAY1_STATE,
        //   //   timeStamp: myDateTime.now()
        //   // };
        //   await global.db.write();
        // }); 
        //=== boardcast ผ่าน socket.io
        global.io.emit('button_pressed', { 
          buttonId: 's01', 
          relayState: global.RELAY1_STATE // ledState: global.LED1_STATE,
        });

      }
    });

    //=== ตรวจสอบค่าปุ่ม 2 - รอบแรก
    global.btn2.read().then( val => {
      console.log(`btn2 initial value: ${val}`); // 1 คือ ปุ่มไม่ถูกกด (active low)
    }).catch(err => {
      console.error('btn2 read error:', err);
    });
    //=== subscribe notify - เมื่อมีการกดปุ่ม
    global.btn2.notify((level, tick) => {
      // console.log(`btn2 notify: level=${level}, tick=${tick}`);
      if (level === 0) {
        //== เปิด/ปิด RELAY2
        const newRelayState = global.RELAY2_STATE === 1 ? 0 : 1;
        global.relay2.write(newRelayState);
        global.RELAY2_STATE = newRelayState;
        //=== boardcast ผ่าน socket.io
        global.io.emit('button_pressed', { 
          buttonId: 's02', 
          relayState: global.RELAY2_STATE
        });
      }
    });

    //=== ตรวจสอบ error
    global.btn2.on('error', err => {
      console.error('btn2 error:', err);
    });
  });

  global.gpio.on('error', err => {
    console.error('pigpio-client error:', err);
  });
}

//=== ปิด LED อัตโนมัติเมื่อปิดระบบหรือ process ถูก kill ===
if (process.platform === 'linux') {
  let cleanupCalled = false;
  
  const turnOffDevicesSync = () => {
    if (cleanupCalled) return;
    cleanupCalled = true;
    try {

      //=== Boardcast สถานะเริ่มต้น - ปุ่ม1 & ปุ่ม2
      global.io.emit('button_pressed', { buttonId: 's01', relayState: 1})
      global.io.emit('button_pressed', { buttonId: 's02', relayState: 1})
      // ปิด Relay 1&2 - Active High to turn off
      exec(`pigs w ${global.RELAY1_PIN} 1`); 
      exec(`pigs w ${global.RELAY2_PIN} 1`);

      // ถ้าต้องการให้รอคำสั่งปิด LED เสร็จก่อนค่อยปิด RELAY
      // exec(`pigs w ${global.LED1_PIN} 0`, (err) => {
      //   if (!err) {
      //     exec(`pigs w ${global.RELAY1_PIN} 1`);
      //   }
      // });
    } catch (err) {
      console.log(err.message);
    }
  };

  process.once('SIGINT', () => { turnOffDevicesSync(); process.exit(); });
  process.once('SIGTERM', () => { turnOffDevicesSync(); process.exit(); });
  process.once('exit', () => { turnOffDevicesSync(); });
}
























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



// const { pigpio } = await import('pigpio-client');
// const gpio = pigpio({ host: 'localhost' });
// const button = gpio.gpio(16);

// button.modeSet('input');
// button.pullUpDown(2); // 2 = PUD_UP (ถ้าต้องการ pull-up)

// button.notify((level, tick) => {
//   if (level === 0) { // ปุ่มถูกกด (active low)
//     // ส่ง HTTP POST ไปยัง API
//     fetch('http://localhost/switch/switch-button', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ buttonId: 'btn1' })
//     });
//   }
// });