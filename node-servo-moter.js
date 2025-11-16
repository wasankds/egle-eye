

const { Gpio } = require('pigpio');

const SERVO_PIN1 = 18; // GPIO18 (Pin 12)
const SERVO_PIN2 = 13; // GPIO13 (Pin 33)
const MIN_PULSE1 = 600;
const MAX_PULSE1 = 2400;
const MIN_PULSE2 = 600;
const MAX_PULSE2 = 2400;

const servo1 = new Gpio(SERVO_PIN1, { mode: Gpio.OUTPUT });
const servo2 = new Gpio(SERVO_PIN2, { mode: Gpio.OUTPUT });

function setAngle(servo, angle, minPulse, maxPulse) {
  const pulse = Math.round(minPulse + (angle / 180) * (maxPulse - minPulse));
  console.log(`angle=${angle}, pulse=${pulse}`);
  servo.servoWrite(pulse);
  setTimeout(() => {
    servo.servoWrite(0); // ปิด PWM หลังหมุน
  }, 500);
}

// ตัวอย่างการหมุน Servo 1
setAngle(servo1, 100, MIN_PULSE1, MAX_PULSE1);
setTimeout(() => setAngle(servo1, 80, MIN_PULSE1, MAX_PULSE1), 1000);
setTimeout(() => setAngle(servo1, 90, MIN_PULSE1, MAX_PULSE1), 2000);

// ตัวอย่างการหมุน Servo 2
setTimeout(() => setAngle(servo2, 100, MIN_PULSE2, MAX_PULSE2), 3000);
setTimeout(() => setAngle(servo2, 80, MIN_PULSE2, MAX_PULSE2), 4000);
setTimeout(() => setAngle(servo2, 90, MIN_PULSE2, MAX_PULSE2), 5000);

// ปิดโปรแกรมหลังจบ
setTimeout(() => {
  servo1.servoWrite(0);
  servo2.servoWrite(0);
  console.log('[INFO] จบการทดสอบและหยุด servo ทั้งสองตัวแล้ว');
  process.exit(0);
}, 6000);