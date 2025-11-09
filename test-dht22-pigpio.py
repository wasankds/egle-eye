
import pigpio
import time


class DHT22_pigpio:
    def __init__(self, pi, gpio_pin):
        self.pi = pi
        self.gpio = gpio_pin
        self.high_tick = 0
        self.bit = 40
        self.either_edge_cb = None
        self.data = []

    def _edge_callback(self, gpio, level, tick):
        if level == 1:
            self.high_tick = tick
        else:
            if self.high_tick != 0:
                pulse_len = pigpio.tickDiff(self.high_tick, tick)
                if self.bit >= 40:
                    self.bit = -2
                    self.data = []
                elif self.bit >= 0:
                    if pulse_len > 60:
                        self.data.append(1)
                    else:
                        self.data.append(0)
                self.bit += 1

    def read(self):
        self.bit = 40
        self.data = []
        self.either_edge_cb = self.pi.callback(
            self.gpio, pigpio.EITHER_EDGE, self._edge_callback)
        self.pi.write(self.gpio, 0)
        time.sleep(0.001)
        self.pi.set_mode(self.gpio, pigpio.INPUT)
        timeout = time.time() + 0.5
        while self.bit < 40 and time.time() < timeout:
            time.sleep(0.001)
        if self.either_edge_cb:
            self.either_edge_cb.cancel()
            self.either_edge_cb = None
        if len(self.data) != 40:
            return None, None
        bytes_data = []
        for i in range(0, 40, 8):
            byte_val = 0
            for j in range(8):
                byte_val = (byte_val << 1) + self.data[i + j]
            bytes_data.append(byte_val)
        checksum = (bytes_data[0] + bytes_data[1] +
                    bytes_data[2] + bytes_data[3]) & 0xFF
        if checksum != bytes_data[4]:
            return None, None
        humidity = ((bytes_data[0] << 8) + bytes_data[1]) / 10.0
        temperature = (((bytes_data[2] & 0x7F) << 8) + bytes_data[3]) / 10.0
        if bytes_data[2] & 0x80:
            temperature = -temperature
        return humidity, temperature


if __name__ == "__main__":
    GPIO_PIN = 4  # หรือ 17 ถ้าเปลี่ยนขา
    pi = pigpio.pi()
    if not pi.connected:
        print("Could not connect to pigpio daemon. Run 'sudo pigpiod' first.")
        exit(1)
    dht22 = DHT22_pigpio(pi, GPIO_PIN)
    humidity, temperature = dht22.read()
    if humidity is not None and temperature is not None:
        print(f"Temp={temperature:0.1f}C  Humidity={humidity:0.1f}%")
    else:
        print("Read error: No data")
    pi.stop()
