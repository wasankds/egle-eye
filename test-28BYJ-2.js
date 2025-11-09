const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

// กำหนดขา GPIO ที่ต่อกับ IN1-IN4 ของ ULN2003
const IN1 = new Gpio(17, {mode: Gpio.OUTPUT});
const IN2 = new Gpio(18, {mode: Gpio.OUTPUT});
const IN3 = new Gpio(27, {mode: Gpio.OUTPUT});
const IN4 = new Gpio(22, {mode: Gpio.OUTPUT});

// ลำดับการขับขดลวด (half-step)
const seq = [
  [1,0,0,0],
  [1,1,0,0],
  [0,1,0,0],
  [0,1,1,0],
  [0,0,1,0],
  [0,0,1,1],
  [0,0,0,1],
  [1,0,0,1]
];

let step = 0;

// รับจำนวนก้าวจาก command line (เช่น node test-28BYJ.js 4096)
// 4096 ก้าว = ประมาณ 1 รอบ
const stepsToMove = parseInt(process.argv[2], 10) || 4096; 
const delay = 5; // ms (ปรับความเร็วได้)

let stepsDone = 0;
const direction = stepsToMove >= 0 ? 1 : -1;
const totalSteps = Math.abs(stepsToMove);

function stepMotor() {
  const s = seq[step];
  IN1.digitalWrite(s[0]);
  IN2.digitalWrite(s[1]);
  IN3.digitalWrite(s[2]);
  IN4.digitalWrite(s[3]);
  step = (step + direction + seq.length) % seq.length;
  stepsDone++;
  if (stepsDone >= totalSteps) {
    clearInterval(interval);
    IN1.digitalWrite(0);
    IN2.digitalWrite(0);
    IN3.digitalWrite(0);
    IN4.digitalWrite(0);
    process.exit();
  }
}

const interval = setInterval(stepMotor, delay);

process.on('SIGINT', () => {
  clearInterval(interval);
  IN1.digitalWrite(0);
  IN2.digitalWrite(0);
  IN3.digitalWrite(0);
  IN4.digitalWrite(0);
  process.exit();
});