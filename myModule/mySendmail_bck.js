
// import * as myDateTime from "./myDateTime.js"
// import * as myGeneral from "./myGeneral.js"
import nodemailer from 'nodemailer'
const myGeneral = await import(`../${myModuleFolder}/myGeneral.js`)
const myDateTime = await import(`../${myModuleFolder}/myDateTime.js`)

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: `${process.env.EMAIL_WHOSEND}`, // ต้องครอบด้วย Backtik
//     pass: `${process.env.EMAIL_APP_PASSWORD}`     // ต้องครอบด้วย Backtik
//   }
// });
// const sender = `"Wasan Khunnadiloksawet" <wasankds@gmail.com>`

//================================================
// ใช้ส่งเมล์เมื่อเพิ่มยูสเซอร์ - เลือกส่งไม่ได้  
// 
export async function sendRegisterUserEmail(user, password){
  try{ 

    //=== ต้องดึงข้อมูลการตั้งค่าจากฐานข้อมูล
    const settingsSystem = await myGeneral.getSettingsSystem()
    if (!settingsSystem || !settingsSystem.EMAIL_WHOSEND || !settingsSystem.EMAIL_APP_PASSWORD) {
      throw new Error('ไม่ได้ตั้งค่าการส่งอีเมล์อย่างถูกต้อง')
    }

    //=== สร้างตัวส่งอีเมล์
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: `${settingsSystem.EMAIL_WHOSEND}`, // ต้องครอบด้วย Backtik
        pass: `${settingsSystem.EMAIL_APP_PASSWORD}`     // ต้องครอบด้วย Backtik
      }
    });
    const sysname = `[${global.SYS_NAME} ${global.SYS_NAME2}]`
    const sender = `"${sysname} อิเมล์อัตโนมัติ" <${settingsSystem.EMAIL_WHOSEND}>` // ชื่อผู้ส่งอีเมล์

    //=== สร้างเนื้อหาอีเมล์
    const mailOptions = {
      from: sender,
      to: user.userEmail,
      subject: `${sysname} แจ้งลงทะเบียนยูสเซอร์ [${ myDateTime.getDateTime() }]`.trim() ,  
      html: `
        <div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:1rem">
          <p style="font-weight:bold">ข้อมูลยูสเซอร์</p>
          <p>อีเมล์ : <span style="color:blue;">${user.userEmail}</span></p>
          <p>รหัสผ่าน : <span style="color:blue;text-decoration:underline">${password}</span></p>
          <p>ชื่อ : <span style="color:blue;">${user.userPrefix} ${user.userFirstname} ${user.userLastname}</span></p>
          <p>เบอร์โทรศัพท์ : <span style="color:blue;">${user.userPhone}</span></p>
          <p>สิทธิ์การใช้งาน : <span style="color:blue;">${user.userAuthority}</span></p>
          <p>สถานะ : <span style="color:blue;">${user.userStatus}</span></p>
        </div>
        <p style="margin-top:12px;font-size:14px">
          <span>เข้าใช้งานระบบ ${global.SYS_NAME} ${global.SYS_NAME2} ได้ที่</span>
          <span><a href="${DOMAIN_ALLOW}" target="_blank">${DOMAIN_ALLOW}</span>
        </p>`
    }
    return await transporter.sendMail(mailOptions)
  }catch(err){ 
    console.log(err)
    return err
  }
}




//================================================
// ส่งลิงค์รีเซ็ตพาสเวิร์ด
// 
export async function sendResetPassword(user, resetUrl){
  try{
    // console.log("user ===> ", user)
    // console.log("resetUrl ===> ", resetUrl)

    //=== ต้องดึงข้อมูลการตั้งค่าจากฐานข้อมูล
    const settingsSystem = await myGeneral.getSettingsSystem()
    // console.log("settingsSystem ===> ", settingsSystem)

    if (!settingsSystem || !settingsSystem.EMAIL_WHOSEND || !settingsSystem.EMAIL_APP_PASSWORD) {
      throw new Error('ไม่ได้ตั้งค่าการส่งอีเมล์อย่างถูกต้อง')
    }
    console.log("EMAIL_WHOSEND ===>" , settingsSystem.EMAIL_WHOSEND)
    console.log("EMAIL_APP_PASSWORD ===>" , settingsSystem.EMAIL_APP_PASSWORD)
    // EMAIL_WHOSEND ===> wasankds@gmail.com
    // EMAIL_APP_PASSWORD ===> czes ztev jwkf itze

    //=== สร้างตัวส่งอีเมล์
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: settingsSystem.EMAIL_WHOSEND, // ต้องครอบด้วย Backtik
        pass: settingsSystem.EMAIL_APP_PASSWORD     // ต้องครอบด้วย Backtik
      } ,
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // const sysname = `[${global.SYS_NAME} ${global.SYS_NAME2}]`
    const sysname = `[${global.SYS_NAME}]`
    const sender = `"${sysname} อิเมล์อัตโนมัติ" <${settingsSystem.EMAIL_WHOSEND}>` // ชื่อผู้ส่งอีเมล์

    //=== สร้างเนื้อหาอีเมล์
    const mailOptions = {
      from: sender,
      to: user.userEmail,
      subject: `${sysname} แจ้งรีเซ็ตพาสเวิร์ด [${ myDateTime.getDateTime() }]`.trim() ,
      html: `
        <div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:1rem">

          <p>
            <span>เรียนคุณ</span>
            <span style="color:blue;"> ${user.userFirstname} ${user.userLastname}</span>
            <span style="color:blue;"> ( ${user.userEmail} )</span>
          </p>

          <p>
            <span>เราได้ส่งลิ้งค์สำหรับรีเซ็ตพาสเวิร์ดมาให้ ดังต่อไปนี้</span>
          </p>
          <p>
            <a href="${resetUrl}" target="_blank"> 
              <span style="color:blue;"> ${resetUrl} </span>
            </a>
          </p>
          
          <p>
            <span style="padding:0 5px">✍</span> 
            <span style="color:orange">หากท่านได้รับลิงค์ข้างต้น </span> 
            แต่ท่านไม่ได้เป็นผู้กด <span style="color:red">(ส่งคำร้องขอให้รีเซ็ตพาสเวิร์ด)</span> 
            <span style="color:red">ขอให้ท่านไม่ต้องสนใจอิเมล์ฉะบับนี้</span>
          </p>
        </div>`
      }
    // console.log(mailOptions)
    return await transporter.sendMail(mailOptions)
  }catch(err){ 
    console.log(err)
    return err
  }
}



/* 

ตัวอย่างการตอบกับจาก ransporter.sendMail(mailOptions)

{
  accepted: [ 'wasankds@gmail.com' ],
  rejected: [],
  ehlo: [
    'SIZE 35882577',
    '8BITMIME',
    'AUTH LOGIN PLAIN XOAUTH2 PLAIN-CLIENTTOKEN OAUTHBEARER XOAUTH',
    'ENHANCEDSTATUSCODES',
    'PIPELINING',
    'CHUNKING',
    'SMTPUTF8'
  ],
  envelopeTime: 763,
  messageTime: 955,
  messageSize: 3084,
  response: '250 2.0.0 OK  1753666746 d2e1a72fcca58-7640b8b2221sm3874334b3a.127 - gsmtp',
  envelope: { from: 'wasankds@gmail.com', to: [ 'wasankds@gmail.com' ] },
  messageId: '<f93291d5-6f10-6044-6352-48d5e3c91805@gmail.com>'
}
 


*/












// //================================================
// // 
// // 
// export async function sendUserEnroll (dataEnroll, imageObj){
//   const dataUser = dataEnroll.dataUser
//   const dataCartItems = dataEnroll.dataCartItems

//   const INDEX_CourseCode = 0
//   const INDEX_CourseName = 1
//   const INDEX_CoursePrice = 2

//   let paraEnrollCourses = `<div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:0.9rem">
//     <p style="color:blue">✍ คอร์สที่ท่านลงทะเบียนเรียนมีดังต่อไปนี้</p>`
//   dataCartItems.forEach( row => {
//     paraEnrollCourses += `<p>
//       (<span style="color:green">${row[INDEX_CourseCode]}</span>)&nbsp;
//       <span>${row[INDEX_CourseName]}</span>&nbsp;
//       =&nbsp;<span style="color:green">${row[INDEX_CoursePrice]}</span> บ.
//     </p>`
//   })
//   paraEnrollCourses +=`<p>
//     <span>รวม</span>&nbsp;
//     <span style="color:green">${dataUser.enrollTotalPrice}</span>
//     <span>&nbsp;บาท</span>
//   </p>`
//   paraEnrollCourses += "</div>"

//   //=== ถ้าต้องการให้ส่งบิล
//   let paraBill = ""
//   if(dataUser.enrollRequireReceipt == 'true'){
//     paraBill = `<div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:0.9rem">
//       <p style="color:blue">✍ ที่อยู่สำหรับส่งใบเสร็จรับเงิน</p>
//       <p>
//         <span>ชื่อ</span>
//         <span>:</span>
//         <span style="color:green">${dataUser.enrollPrefix}</span>
//         <span style="color:green">${dataUser.enrollFirstname}</span>
//         <span style="color:green">${dataUser.enrollLastname}</span>
//       </p>
//       <p>
//         <span>โทรศัพท์</span>
//         <span>:</span>
//         <span style="color:green">${dataUser.enrollPhone}</span>
//       </p>
//       <p>
//         <span>ที่อยู่</span>
//         <span>:</span>
//         <span style="color:green">${dataUser.enrollAddress1}</span>
//         <span style="color:green">${dataUser.enrollAddress2}</span>
//       </p>
//       <p>
//         <span>จังหวัด</span>
//         <span>:</span>
//         <span style="color:green">${dataUser.enrollProvince}</span>
//       </p>
//       <p>
//         <span>รหัสไปรษณย์</span>
//         <span>:</span>
//         <span style="color:green">${dataUser.enrollPostalCode}</span>
//       </p>
//     </div>`
//   }


//   try{
//     const mailOptions = {
//       from: sender,
//       to: dataUser.enrollEmail,
//       cc: "wasankds@gmail.com",
//       subject: `แจ้งการลงทะเบียนเรียน [${ myDateTime.getDateTime() }]` ,
//       attachments: [
//         {
//           filename: imageObj.imageFilename,
//           path: imageObj.imagePath ,
//           cid: 'paySlip'
//         }
//       ] ,
//       html: `
//         <div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:1rem">
//           <p>
//             <span>เรียนคุณ</span>
//             <span style="color:blue;"> ${dataUser.enrollFirstname} ${dataUser.enrollLastname}</span>
//             <span style="color:blue;"> ( ${dataUser.enrollEmail} )</span>
//           </p>

//           <p>
//             เราได้ส่งรายละเอียดการลงทะเบียนเรียนที่คุณสมัครเรียนมาให้ ดังมีรายละเเอียดดังต่อไปนี้
//             อย่างไรก็ดี เราขอตรวจสอบรายละเอียดก่อน จึงจะสามารถลงทะเบียนให้ท่านได้
//             เมื่อลงทะเบียนสำเร็จ เราจะส่งอิเมล์เพื่อแจ้งยืนยันอีกครั้ง
//           </p>

//           <p>
//             หากต้องการสอบถามการสมัคร สามารถติดต่อถามได้ตามช่องทางที่เราให้ไว้ในหน้าเว็บ ${DOMAIN_ALLOW}
//           </p>
//         </div>`
//         + paraEnrollCourses + paraBill +
//         `<!-- -->
//         <p>
//           <span>เข้าเรียนคอร์สออนไลน์ได้ที่</span>
//           <span><a href="${DOMAIN_ALLOW}" target="_blank">${DOMAIN_ALLOW}</span>
//         </p>

//         <!-- -->
//         <p style="margin-top:10px;padding-top:10px;border-top:1px dashed gray;line-height:1.5rem">
//           <i>
//             <span>ขอขอบคุณที่สมัครเรียนกับเรา</span><br>
//             <span>หวังเป็นอย่างยิ่งว่าคอร์สเรียนของเราจะเป็นประโยชน์ในงาน หรือในชีวิตประจำวันของท่าน</span><br>
//             <span style="color:green">ขอขอบพระคุณอย่างสูง ...🙏</span><br>
//           </i>
//         </p>
//         <img src="cid:paySlip" height="auto" width="80%" alt="Payment Slip" /> `
//       }
//     return await transporter.sendMail(mailOptions)
//   }catch(err){ 
//     return err
//   }
// }



// const mailOptions = {
//   from: from,
//   to: 'info.poeclub@gmail.com',
//   subject: 'Test Email from Node.js : ' + new Date(),  
//   html: `<h1>This is an HTML email</h1>
//          <p>This is the body content with an inline image:</p>
//          <img src="cid:sampleImage" alt="Company Logo" />`,
//   attachments: [
//     {
//       filename: 'sample.png',
//       path: 'D:/aWK_WebProgramming/wasankds.com/sample.png',
//       cid: 'sampleImage'
//     }
//   ]
// };





/* 
//================================================
// ส่งแจ้งคอร์สให้ยูสเซอร์
// 
// exports.sendUserCourseEmail = async function (user){
export async function sendUserCourseEmail(user){
  try{  
    const mailOptions = {
      from: sender,
      to: user.userEmail,
      subject: `แจ้งลงทะเบียนคอร์สเรียน ${user.courseCode} [${ myDateTime.getDateTime() }]` ,  
      html: `
        <div style="padding:10px;border-radius:5px;background-color:white;border:1px dashed black;line-height:1rem">
          <p>
            <span>เรียนคุณ</span>
            <span style="color:blue;"> ${user.userFirstname} ${user.userLastname}</span>
            <span style="color:blue;"> ( ${user.userEmail} )</span>
          </p>
          <p>
            <span>เราได้ลงทะเบียนคอร์สเรียนดังต่อไปนี้ให้คุณเรียบร้อยแล้ว</span>
          </p>
          <p style="font-weight:bold">
            <span style="color:blue;"> ${user.courseCode} : ${user.courseName}</span>
            ( <span>เมื่อวันที่ </span> <span style="color:blue;"> ${user.enrolledDate}</span> ) 
          </p>
          <p>
            <span>เข้าเรียนคอร์สออนไลน์ได้ที่</span>
            <span><a href="${DOMAIN_ALLOW}" target="_blank">${DOMAIN_ALLOW}</span>
          </p>

          <p style="margin-top:10px;padding-top:10px;border-top:1px dashed gray;line-height:1.5rem"><i>
            <span>ขอขอบคุณที่สมัครเรียนกับเรา</span><br>
            <span>หวังเป็นอย่างยิ่งว่าคอร์สเรียนของเราจะเป็นประโยชน์ในงาน หรือในชีวิตประจำวันของท่าน</span><br>
            <span style="color:green">ขอขอบพระคุณอย่างสูง ...🙏</span><br>
          </i></p>
        </div>`
      }
    return await transporter.sendMail(mailOptions)
  }catch(err){ 
    return err
  }
} 
  
*/