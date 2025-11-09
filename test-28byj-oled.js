const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

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
const delay = 5; // ms (ปรับความเร็วได้)

// OLED setup
const i2cBus = i2c.openSync(1);
const opts = { width: 128, height: 32, address: 0x3C };
const oled = new Oled(i2cBus, opts);
oled.clearDisplay();

// รับจำนวนก้าวจาก command line (เช่น node test-28byj-oled.js 4096)
const stepsToMove = parseInt(process.argv[2], 10) || 4096;
let stepsDone = 0;
const direction = stepsToMove >= 0 ? 1 : -1;
const totalSteps = Math.abs(stepsToMove);

function updateOled() {
	oled.clearDisplay();
	oled.setCursor(1, 1);
	oled.writeString(font, 2, `Steps: ${stepsDone}/${totalSteps}`, 1, true);
}

function stepMotor() {
  const s = seq[step];
  IN1.digitalWrite(s[0]);
  IN2.digitalWrite(s[1]);
  IN3.digitalWrite(s[2]);
  IN4.digitalWrite(s[3]);
  step = (step + direction + seq.length) % seq.length;
  stepsDone++;
  if (stepsDone % 50 === 0 || stepsDone === totalSteps) {
    updateOled(); // อัปเดต OLED ทุก 50 ก้าว
    console.log(`Steps: ${stepsDone}/${totalSteps}`);
  }
  if (stepsDone >= totalSteps) {
    clearInterval(interval);
    IN1.digitalWrite(0);
    IN2.digitalWrite(0);
    IN3.digitalWrite(0);
    IN4.digitalWrite(0);
    oled.setCursor(1, 20);
    oled.writeString(font, 1, 'Done!', 1, true);
    process.exit();
  }
}

updateOled(); // แสดงสถานะเริ่มต้น
const interval = setInterval(stepMotor, delay); // ขับมอเตอร์ ทุกๆ delay ms

process.on('SIGINT', () => {
	clearInterval(interval);
	IN1.digitalWrite(0);
	IN2.digitalWrite(0);
	IN3.digitalWrite(0);
	IN4.digitalWrite(0);
	oled.clearDisplay();
	oled.setCursor(1, 1);
	oled.writeString(font, 1, 'Stopped', 1, true);
	process.exit();
});
