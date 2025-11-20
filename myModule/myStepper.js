


// สมมติใช้ pigpio-client หรือไลบรารีที่ควบคุม stepper ได้
// stepperObj: อ็อบเจกต์ควบคุม stepper motor
// currentAngle: องศาปัจจุบัน (เก็บไว้ใน global หรือในอ็อบเจกต์)
// targetAngle: องศาที่ต้องการหมุนไป
// stepPerDegree: จำนวน step ต่อ 1 องศา (ขึ้นกับ stepper/driver)

export async function rotateToAngle(stepperObj, currentAngle, targetAngle, stepPerDegree = 1.8) {
  // stepPerDegree: เช่น 1.8 สำหรับ 200 steps/rev (360/200)
  const diff = targetAngle - currentAngle;
  const steps = Math.round(diff / stepPerDegree);
  if (steps === 0) return;

  if (steps > 0) {
    // หมุนขวา (clockwise)
    await stepperObj.step(steps, 1); // 1 = CW
  } else {
    // หมุนซ้าย (counter-clockwise)
    await stepperObj.step(-steps, 0); // 0 = CCW
  }
  // อัปเดต currentAngle
  return targetAngle;
}


//==== 


// export async function setAngle(gpioObj, angle, minPulse, maxPulse, delayMs = 500) {
//   const pulse = Math.round(minPulse + (angle / 180) * (maxPulse - minPulse));
//   console.log(`angle=${angle}, pulse=${pulse}`);
  
//   await gpioObj.setServoPulsewidth(pulse);
//   setTimeout(() => {
//     gpioObj.setServoPulsewidth(0);
//   }, delayMs);
// }


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
