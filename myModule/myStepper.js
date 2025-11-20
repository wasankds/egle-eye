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

//==== เซ็ตสถานะเริ่มต้นการหมุนมอเตอร์
export function resetRotation() {
  if(!global.gpio) {
    return {
      status: 'no gpio',
    }
  }

  // ปิดทุกขา
  for (let j = 0; j < 4; j++) global.stepperPins[j].write(0);
  return { status: 'ok' };
}


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

