const Gpio = require('pigpio').Gpio;
const servo = new Gpio(18, {mode: Gpio.OUTPUT});

let pulseWidth = 1000;
servo.servoWrite(pulseWidth);

setInterval(() => {
  pulseWidth += 250;
  if (pulseWidth > 2500) pulseWidth = 500;
  servo.servoWrite(pulseWidth);
  console.log(`Pulse width: ${pulseWidth}us`);
}, 1000);

process.on('SIGINT', () => {
  servo.servoWrite(0);
  process.exit();
});