import { pigpio } from 'pigpio-client';
const gpio = pigpio({ host: 'localhost' });
const led = gpio.gpio(26);
await led.modeSet('output');
await led.write(1);