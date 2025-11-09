const Gpio = require('onoff').Gpio;

// กำหนด GPIO สำหรับแต่ละ segment
const segments = [
  new Gpio(4, 'out'),  // a
  new Gpio(17, 'out'), // b
  new Gpio(18, 'out'), // c
  new Gpio(27, 'out'), // d
  new Gpio(22, 'out'), // e
  new Gpio(23, 'out'), // f
  new Gpio(24, 'out')  // g
];

// รูปแบบ segment สำหรับเลข 0-9 (1=ติด, 0=ดับ)
const numbers = [
  [1,1,1,1,1,1,0], // 0
  [0,1,1,0,0,0,0], // 1
  [1,1,0,1,1,0,1], // 2
  [1,1,1,1,0,0,1], // 3
  [0,1,1,0,0,1,1], // 4
  [1,0,1,1,0,1,1], // 5
  [1,0,1,1,1,1,1], // 6
  [1,1,1,0,0,0,0], // 7
  [1,1,1,1,1,1,1], // 8
  [1,1,1,1,0,1,1]  // 9
];

function displayNumber(num) {
  numbers[num].forEach((val, idx) => segments[idx].writeSync(val));
}

// ตัวอย่าง: แสดงเลข 5
displayNumber(5);

// cleanup เมื่อจบ
process.on('SIGINT', () => {
  segments.forEach(seg => seg.writeSync(0));
  segments.forEach(seg => seg.unexport());
  process.exit();
});