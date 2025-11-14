// ทดสอบ pigpio-client ด้วย ES6 module
import { pigpio } from 'pigpio-client';

const gpio = pigpio({ host: 'localhost' });
const led = gpio.gpio(26); // เปลี่ยนหมายเลข GPIO ได้

async function testLed() {
  try {
    await led.modeSet('output');
    await led.write(1);
    console.log('LED ON');
    await new Promise(r => setTimeout(r, 2000));
    await led.write(0);
    console.log('LED OFF');
    process.exit(0);
  } catch (err) {
    console.error('pigpio-client error:', err.message);
    process.exit(1);
  }
}

testLed();
