// import { spawn } from 'child_process';
import express from 'express'
const router = express.Router()
import fs from 'fs'
import path from 'path'
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/videos'
const PATH_DELETE = `${PATH_MAIN}/delete`
const PATH_DOWNLOAD = `${PATH_MAIN}/download`
const PATH_VIEW = `${PATH_MAIN}/view`
const PREFIX = PATH_MAIN.replace(/\//g,"_")

//=============================================
// 
// router.get(PATH_MAIN, async (req, res) => {
router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`)
  // console.log("req.query ===> ", req.query)

  const date = req.query.date ? req.query.date : null

  try {

    //=== อ่านรายชื่อไฟล์วิดีโอ .mjpeg จากโฟลเดอร์ videos
    let videosFiles_mjpeg_all = [];
    if (fs.existsSync(global.folderVideos)) {
      const files = fs.readdirSync(global.folderVideos);
      for (const file of files) {
        const filePath = path.join(global.folderVideos, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          videosFiles_mjpeg_all.push({  
            name: file, // video_2025-11-19_17-45-20.mp4
            time : file.slice(6, 25).replace('_', ' '),
            size: (stat.size / (1024 * 1024)).toFixed(2) + ' MB',
          });
        }
      }
    }
    //=== จับวันที่ไม่ซ้ำ
    const uniqueDates = [...new Set(videosFiles_mjpeg_all.map(video => video.time.slice(0, 10)))];

    //=== กรองตามวันที่ถ้ามี date
    const videosFiles_mjpeg = videosFiles_mjpeg_all.filter(video => {
      if (date) {
        return video.time.startsWith(date);
      }
      return true;
    });
    //=== เรียงลำดับชื่อไฟล์จากใหม่ไปเก่า
    videosFiles_mjpeg.sort((a, b) => b.name.localeCompare(a.name));

    const html = await myGeneral.renderView('videos', res, {
      title: global.PAGE_VIDEOS ,
      time : myDateTime.getDate() ,
      msg: req.flash('msg') ,

      user: await lowDB.getSessionData(req) ,
      data : videosFiles_mjpeg ,
      date ,
      uniqueDates ,

      PREFIX ,
      PATH_MAIN ,
      PATH_DELETE ,
      PATH_DOWNLOAD ,
      PATH_VIEW ,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})



router.post(PATH_DELETE, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)

  try {
    const filename = req.body.filename;
    if(!filename){
      return res.send({
        status: 'error',
        class: 'red', 
        message: `ไม่มีชื่อไฟล์ที่ต้องการลบ`,
      });
    }

    var filePath = path.join(global.folderVideos, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.send({
            status: 'error',
            class: 'red',
            message: `ลบไฟล์ "${filename}" ไม่สำเร็จ: ${err.message}`,
          });
        }
        return res.send({
          status: 'ok',
          class: 'green',
          message: `ลบไฟล์ "${filename}" เรียบร้อยแล้ว`,
        });
      });      
    } else {
      return res.send({
        status: 'error',
        class: 'red',
        message: `ไม่พบไฟล์ "${filename}" ที่ต้องการลบ`,
      });
    }
  } catch (error) {
    console.log("Error ===> " , error.message)
    return res.send({
      status: 'error',
      class: 'red',
      message: error.message,
    });
  }
})



router.get(PATH_DOWNLOAD, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log(`-----------------${req.path}----------------------`)
  // console.log("req.query ===> ", req.query)
  try {
    const filename = req.query.filename;
    if (!filename) {
      // ส่ง error เป็น text/plain (ไม่ใช่ JSON) เพื่อให้ <a download> แสดงผลถูกต้อง
      return res.status(400).type('text').send('ไม่มีชื่อไฟล์ที่ต้องการดาวน์โหลด');
    }
    // ป้องกัน path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).type('text').send('ชื่อไฟล์ไม่ถูกต้อง');
    }

    var filePath = path.join(global.folderVideos, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).type('text').send(`ไม่พบไฟล์ "${filename}" ที่ต้องการดาวน์โหลด`);
    }
    // ตั้ง Content-Disposition ให้รองรับชื่อไฟล์พิเศษ/ภาษาไทย
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.download(filePath, filename, (err) => {
      if (err && !res.headersSent) {
        console.log('Download error ===>', err.message);
        res.status(500).type('text').send('เกิดข้อผิดพลาดระหว่างดาวน์โหลดไฟล์');
      }
    });
  } catch (error) {
    console.log('Error ===>', error.message);
    if (!res.headersSent) {
      res.status(500).type('text').send('เกิดข้อผิดพลาด: ' + error.message);
    }
  }
})



//=============================================================
router.get(`${PATH_VIEW}/:filename`, (req, res) => {
  // console.log(`---- ${req.originalUrl} ----`);
  // console.log("req.params ===> ", req.params);

  // ตรวจสอบสิทธิ์ที่นี่ (เช่น req.session, JWT, ฯลฯ)
  if (!req.session.isAuth) return res.status(403).send('Forbidden');

  const filename = req.params.filename;
  const videoPath = path.join(global.folderVideos, filename); // ปรับ path ให้ตรงกับที่เก็บไฟล์จริง
  // ตรวจสอบว่าไฟล์มีอยู่จริง
  if (!fs.existsSync(videoPath)) return res.status(404).send('Not found');

  // ส่งไฟล์แบบ stream (รองรับ seek)
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

export default router





// //=============================================================
// router.post(PATH_CONVERT, async (req, res) => {
//   // console.log(`-----------------${req.originalUrl}----------------------`)
//   // console.log("req.body ===> " , req.body)

//   try {
//     const filename = req.body.filename;
//     if(!filename){
//       return res.send({
//         status: 'error',
//         class: 'red',
//         message: `ไม่มีชื่อไฟล์ที่ต้องการแปลง`,
//       });
//     }
//     const filePath = path.join(global.folderVideos, filename);

//     if (!fs.existsSync(filePath)) {
//       return res.send({
//         status: 'error',
//         class: 'red',
//         message: `ไม่พบไฟล์ "${filename}" ที่ต้องการแปลง`,
//       });
//     }

//     //=== แปลงไฟล์ (ตัวอย่างใช้ ffmpeg แปลงเป็น mp4)
//     const outputFilename = path.parse(filename).name + '.mp4';
//     const outputPath = path.join(global.folderVideosMp4, outputFilename); 

//     const FRAMERATE = process.env.VIDEO_FRAMERATE
//     const ffmpeg = spawn('ffmpeg', [
//         '-y',
//         '-framerate', String(FRAMERATE),
//         '-i', filePath,
//         '-c:v', 'libx264',
//         '-pix_fmt', 'yuv420p',
//         outputPath
//     ]);
//     ffmpeg.on('exit', code => {
//       if (code === 0) {
//         console.log('Converted', filename, 'to', outputFilename);
//         return res.send({
//           status: 'ok',
//           class: 'green',
//           message: `แปลงไฟล์ "${filename}" เป็น "${outputFilename}" เรียบร้อยแล้ว`,
//         });
//       } else {
//         console.error('Failed to convert', filename);
//         return res.send({
//           status: 'error',
//           class: 'red',
//           message: `แปลงไฟล์ "${filename}" ไม่สำเร็จ`,
//         });
//       } 
//     });    
//   } catch (error) {
//     console.log("Error ===> " , error.message)
//     return res.send({
//       status: 'error',
//       class: 'red',
//       message: error.message,
//     });
//   }
// })




// router.get(PATH_STREAM, (req, res) => {
//   console.log(`---- ${req.originalUrl} ----`);

//   res.writeHead(200, {
//     'Content-Type': 'video/x-motion-jpeg',
//     'Cache-Control': 'no-cache',
//     'Connection': 'close',
//     'Pragma': 'no-cache'
//   });

//   const cam = spawn('rpicam-vid', [
//     '-t', '0',
//     '--width', '640',
//     '--height', '480',
//     '--codec', 'mjpeg',
//     '-o', '-'
//   ]);

//   cam.stdout.pipe(res);

//   cam.stderr.on('data', (data) => {
//     console.log('rpicam-vid stderr:', data.toString());
//   });


//   req.on('close', () => {
//     cam.kill('SIGINT');
//   });
// });