const sensor = require('node-dht-sensor');
function readDHT() {
  sensor.read(22, 4, function(err, temperature, humidity) {
    if (!err) {
      console.log(`Temp: ${temperature}°C, Humidity: ${humidity}%`);
    } else {
      console.error('Read error:', err);
      setTimeout(readDHT, 2000);
    }
  });
}
readDHT();