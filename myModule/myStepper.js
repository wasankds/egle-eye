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

//=== 
// steps = จำนวนก้าวที่ต้องการหมุน
// dir = ทิศทางการหมุน 1=ขวา, -1=ซ้าย
// delay = หน่วงเวลา (มิลลิวินาที) ระหว่างก้าว
export async function stepMotor(steps=200, dir=1, delay=5) {
  if(!global.gpio || !global.stepperPins) {
    return {
      status: 'no gpio',
    }
  }

  for (let i = 0; i < steps; i++) {
    const idx = dir > 0 ? i % seq.length : (seq.length - (i % seq.length)) % seq.length;
    for (let j = 0; j < 4; j++) {
      await global.stepperPins[j].write(seq[idx][j]);
    }
    await new Promise(r => setTimeout(r, delay));
  }
  // ปิดทุกขา
  for (let j = 0; j < 4; j++) await global.stepperPins[j].write(0);
}





// //==== เซ็ตสถานะเริ่มต้นการหมุนมอเตอร์
// export function resetRotation() {
//   if(!global.gpio) {
//     return {
//       status: 'no gpio',
//     }
//   }

//   // ปิดทุกขา
//   for (let j = 0; j < 4; j++) global.stepperPins[j].write(0);
//   return { status: 'ok' };
// }

// //=== เปิด 2 ตัวต้านทานบนขา IN1 และ IN2 ปิด ขา IN3 และ IN4
// export function rotate1() {
//   if(!global.gpio) {
//     return { status: 'no gpio', }
//   }
//   global.stepperPins[0].write(1); // IN1
//   global.stepperPins[1].write(1); // IN2
//   global.stepperPins[2].write(0); // IN3
//   global.stepperPins[3].write(0); // IN4
//   return { status: 'ok' };
// }

// //=== เปิด 2 ตัวต้านทานบนขา IN2 และ IN3 ปิด ขา IN1 และ IN4
// export function rotate2() {
//   if(!global.gpio) {
//     return { status: 'no gpio', }
//   }
//   global.stepperPins[0].write(0); // IN1
//   global.stepperPins[1].write(1); // IN2
//   global.stepperPins[2].write(1); // IN3
//   global.stepperPins[3].write(0); // IN4
//   return { status: 'ok' };
// }

