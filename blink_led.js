const Gpio = require('pigpio').Gpio;
const led = new Gpio(17, {mode: Gpio.OUTPUT});
const interval = 1000; // ms

let value = 0;
setInterval(() => {
  value = value ^ 1; // Toggle value between 0 and 1
  led.digitalWrite(value);
  console.log(value ? 'LED ON' : 'LED OFF');
}, interval);

process.on('SIGINT', () => {
  led.digitalWrite(0);
  process.exit();
});