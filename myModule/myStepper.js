
// const pins = [
//   global.gpio.gpio(global.STEPPER1_PIN1),
//   global.gpio.gpio(global.STEPPER1_PIN2),
//   global.gpio.gpio(global.STEPPER1_PIN3),
//   global.gpio.gpio(global.STEPPER1_PIN4)
// ];

const seq = [
  [1,0,0,1],
  [1,0,0,0],
  [1,1,0,0],
  [0,1,0,0],
  [0,1,1,0],
  [0,0,1,0],
  [0,0,1,1],
  [0,0,0,1]
];

async function stepMotor(steps, dir = 1, delay = 5) {
  for (let i = 0; i < steps; i++) {
    const idx = dir > 0 ? i % seq.length : (seq.length - (i % seq.length)) % seq.length;
    for (let j = 0; j < 4; j++) {
      await pins[j].write(seq[idx][j]);
    }
    await new Promise(r => setTimeout(r, delay));
  }
  // ปิดทุกขา
  for (let j = 0; j < 4; j++) await pins[j].write(0);
}


// // สมมติใช้ pigpio-client หรือไลบรารีที่ควบคุม stepper ได้
// // stepperObj: อ็อบเจกต์ควบคุม stepper motor
// // currentAngle: องศาปัจจุบัน (เก็บไว้ใน global หรือในอ็อบเจกต์)
// // targetAngle: องศาที่ต้องการหมุนไป
// // stepPerDegree: จำนวน step ต่อ 1 องศา (ขึ้นกับ stepper/driver)

// export async function rotateToAngle(stepperObj, currentAngle, targetAngle, stepPerDegree = 1.8) {
//   // stepPerDegree: เช่น 1.8 สำหรับ 200 steps/rev (360/200)
//   const diff = targetAngle - currentAngle;
//   const steps = Math.round(diff / stepPerDegree);
//   if (steps === 0) return;

//   if (steps > 0) {
//     // หมุนขวา (clockwise)
//     await stepperObj.step(steps, 1); // 1 = CW
//   } else {
//     // หมุนซ้าย (counter-clockwise)
//     await stepperObj.step(-steps, 0); // 0 = CCW
//   }
//   // อัปเดต currentAngle
//   return targetAngle;
// }


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
