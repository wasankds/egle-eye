
// npm install i2c-bus oled-i2c-bus oled-font-5x7
const i2c = require('i2c-bus');
const Oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');

const i2cBus = i2c.openSync(1);
const opts = {
  width: 128,
  height: 32,
  address: 0x3C
};

const oled = new Oled(i2cBus, opts);
oled.clearDisplay();
oled.setCursor(1, 1);
oled.writeString(font, 2, 'Hello Pi!', 1, true);