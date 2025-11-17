import express from 'express'
const router = express.Router()
import { spawn } from 'child_process';
import fs from 'fs'
import path from 'path'
import mainAuth from "../authorize/mainAuth.js" 
const myGeneral = await import(`../${global.myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${global.myModuleFolder}/myDateTime.js`)
const lowDB = await import(`../${global.myModuleFolder}/LowDb.js`)
const PATH_MAIN = '/videos'
const PREFIX = PATH_MAIN.replace(/\//g,"_") 
const PATH_DELETE = `${PATH_MAIN}/delete`
const PATH_DELETE_MP4 = `${PATH_MAIN}/delete-mp4`
const PATH_DOWNLOAD = `${PATH_MAIN}/download`
const PATH_DOWNLOAD_MP4 = `${PATH_MAIN}/download-mp4`
const PATH_CONVERT = `${PATH_MAIN}/convert`


//=============================================
// 
// router.get(PATH_MAIN, mainAuth.isOA, async (req, res) => {
router.get(PATH_MAIN, async (req, res) => {

  try {

    //=== อ่านรายชื่อไฟล์วิดีโอ .mjpeg จากโฟลเดอร์ videos
    const videosFiles_mjpeg = [];
    if (fs.existsSync(global.folderVideos)) {
      const files = fs.readdirSync(global.folderVideos);
      for (const file of files) {
        const filePath = path.join(global.folderVideos, file);
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          videosFiles_mjpeg.push({  
            name: file,
            size: stat.size,
            modifiedTime: stat.mtime
          });
        }
      }
    }

    //=== อ่านรายชื่อไฟล์วิดีโอ .mp4 จากโฟลเดอร์ videos gloval.folderVideosMp4
    const videosFiles_mp4 = [];
    if (fs.existsSync(global.folderVideosMp4)) {
      const filesMp4 = fs.readdirSync(global.folderVideosMp4);
      for (const fileMp4 of filesMp4) {
        const filePathMp4 = path.join(global.folderVideosMp4, fileMp4);
        const statMp4 = fs.statSync(filePathMp4);
        if (statMp4.isFile()) {
          videosFiles_mp4.push(fileMp4);
        }
      }
    }

    //=== videosFiles ลนลูปไปหาชื่อไฟล์ที่ตรงกันในโฟลเดอร์  gloval.folderVideosMp4 ถ้ามีให้เพิ่มคีย์ mp4Exists: true
    for (let video of videosFiles_mjpeg) {
      const mp4Filename = path.parse(video.name).name + '.mp4';
      video.mp4Filename = videosFiles_mp4.includes(mp4Filename) ? mp4Filename : null; 
      video.mp4Filesize = videosFiles_mp4.includes(mp4Filename) ? fs.statSync(path.join(global.folderVideosMp4, mp4Filename)).size : null;
    }
    // console.log("videosFiles_mjpeg ===> " , videosFiles_mjpeg)

    const html = await myGeneral.renderView('videos', res, {
      title: global.PAGE_VIDEOS ,
      time : myDateTime.getDate(),
      msg: req.flash('msg'),

      user: await lowDB.getSessionData(req),
      data : videosFiles_mjpeg,

      PREFIX,
      PATH_MAIN,
      PATH_DELETE,
      PATH_DELETE_MP4,
      PATH_CONVERT,
      PATH_DOWNLOAD,
      PATH_DOWNLOAD_MP4,
    })
    res.send(html)
  } catch (error) {
    console.log("Error ===> " , error.message)
    res.status(404).sendFile(file404)
  }
})



router.post([PATH_DELETE, PATH_DELETE_MP4], async (req, res) => {
  console.log(`-----------------${req.originalUrl}----------------------`)
  console.log("req.body ===> " , req.body)

  try {
    const filename = req.body.filename;
    if(!filename){
      return res.send({
        status: 'error',
        class: 'red', 
        message: `ไม่มีชื่อไฟล์ที่ต้องการลบ`,
      });
    }

    if(req.path === PATH_DELETE_MP4){
      var filePath = path.join(global.folderVideosMp4, filename);
    } else if(req.path === PATH_DELETE){
      var filePath = path.join(global.folderVideos, filename);
    }

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


router.get([PATH_DOWNLOAD, PATH_DOWNLOAD_MP4], async (req, res) => {
  console.log(`-----------------${req.originalUrl}----------------------`)
  console.log(`-----------------${req.path}----------------------`)
  console.log("req.query ===> ", req.query)
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

    // 
    if(req.path === PATH_DOWNLOAD_MP4){
      var filePath = path.join(global.folderVideosMp4, filename);
    }else if(req.path === PATH_DOWNLOAD){
      var filePath = path.join(global.folderVideos, filename);
    }

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
router.post(PATH_CONVERT, async (req, res) => {
  // console.log(`-----------------${req.originalUrl}----------------------`)
  // console.log("req.body ===> " , req.body)

  try {
    const filename = req.body.filename;
    if(!filename){
      return res.send({
        status: 'error',
        class: 'red',
        message: `ไม่มีชื่อไฟล์ที่ต้องการแปลง`,
      });
    }
    const filePath = path.join(global.folderVideos, filename);

    if (!fs.existsSync(filePath)) {
      return res.send({
        status: 'error',
        class: 'red',
        message: `ไม่พบไฟล์ "${filename}" ที่ต้องการแปลง`,
      });
    }

    //=== แปลงไฟล์ (ตัวอย่างใช้ ffmpeg แปลงเป็น mp4)
    const outputFilename = path.parse(filename).name + '.mp4';
    const outputPath = path.join(global.folderVideosMp4, outputFilename); 

    const FRAMERATE = process.env.VIDEO_FRAMERATE
    const ffmpeg = spawn('ffmpeg', [
        '-y',
        '-framerate', String(FRAMERATE),
        '-i', filePath,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        outputPath
    ]);
    ffmpeg.on('exit', code => {
      if (code === 0) {
        console.log('Converted', filename, 'to', outputFilename);
        return res.send({
          status: 'ok',
          class: 'green',
          message: `แปลงไฟล์ "${filename}" เป็น "${outputFilename}" เรียบร้อยแล้ว`,
        });
      } else {
        console.error('Failed to convert', filename);
        return res.send({
          status: 'error',
          class: 'red',
          message: `แปลงไฟล์ "${filename}" ไม่สำเร็จ`,
        });
      } 
    });    
  } catch (error) {
    console.log("Error ===> " , error.message)
    return res.send({
      status: 'error',
      class: 'red',
      message: error.message,
    });
  }
})

export default router





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