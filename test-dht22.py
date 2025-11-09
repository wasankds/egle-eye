import Adafruit_DHT
sensor = Adafruit_DHT.DHT22
pin = 4  # หรือ 17 ถ้าเปลี่ยนขา
humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
print('Temp={0:0.1f}C  Humidity={1:0.1f}%'.format(temperature, humidity))
