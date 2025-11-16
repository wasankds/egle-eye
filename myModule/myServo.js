

export async function setAngle(gpioObj, angle, minPulse, maxPulse) {
  const pulse = Math.round(minPulse + (angle / 180) * (maxPulse - minPulse));
  console.log(`angle=${angle}, pulse=${pulse}`);
  gpioObj.setServoPulsewidth(pulse);
  setTimeout(() => {
    gpioObj.setServoPulsewidth(0);
  }, 500);
}


// //===========================================
// // ใช้สำหรับ Render View โดยลบ comment HTML ออก
// // 
// export async function renderView(viewName, res, obj){
//   return new Promise((resolve, reject) => {
//     res.render(viewName, obj, (err, html) => {
//       if (err) {
//         console.error('Error rendering EJS:', err)
//         reject(err)
//       } else {
//         const cleanedHtml = cleanHtml(html)
//         resolve(cleanedHtml)
//       }
//     })
//   })
// }
