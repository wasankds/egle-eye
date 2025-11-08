// dht11_node_debug.js
const Gpio = require('pigpio').Gpio;
const PIN = 18;

const inPin = new Gpio(PIN, {mode: Gpio.INPUT, pullUpDown: Gpio.PUD_OFF, alert: true});

let prevTick = 0;
let first = true;

inPin.on('alert', (level, tick) => {
  if (first) { prevTick = tick; first = false; }
  const delta = tick - prevTick;
  console.log(level, tick, delta);
  prevTick = tick;
});

// trigger:
inPin.mode(Gpio.OUTPUT);
inPin.digitalWrite(0);
setTimeout(() => {
  inPin.mode(Gpio.INPUT);
  console.log('released, now waiting for edges...');
}, 18);