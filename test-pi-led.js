const { pigpio } = require('pigpio-client');
const gpio = pigpio({ host: 'localhost' });
const led = gpio.gpio(26);
led.modeSet('output').then(() => led.write(1));