const { pigpio } = await import('pigpio-client');

const client = pigpio(); // localhost, default port 8888
const servo1 = client.gpio(18);
const servo2 = client.gpio(13);

function setAngle(servo, angle, minPulse, maxPulse) {
  const pulse = Math.round(minPulse + (angle / 180) * (maxPulse - minPulse));
  console.log(`angle=${angle}, pulse=${pulse}`);
  servo.servoWrite(pulse);
  setTimeout(() => {
    servo.servoWrite(0);
  }, 500);
}

setAngle(servo1, 100, 600, 2400);
setTimeout(() => setAngle(servo1, 80, 600, 2400), 1000);
setTimeout(() => setAngle(servo1, 90, 600, 2400), 2000);

setTimeout(() => setAngle(servo2, 100, 600, 2400), 3000);
setTimeout(() => setAngle(servo2, 80, 600, 2400), 4000);
setTimeout(() => setAngle(servo2, 90, 600, 2400), 5000);

setTimeout(() => {
  servo1.servoWrite(0);
  servo2.servoWrite(0);
  console.log('[INFO] จบการทดสอบและหยุด servo ทั้งสองตัวแล้ว');
  process.exit(0);
}, 6000);