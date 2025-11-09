import pigpio
import time

LED_PIN = 17  # ใช้ GPIO17 (Pin 11)
BLINK_INTERVAL = 1  # วินาที

# เชื่อมต่อกับ pigpio daemon
pi = pigpio.pi()
if not pi.connected:
    print("ไม่สามารถเชื่อมต่อ pigpio daemon ได้ กรุณารัน 'sudo pigpiod' ก่อน")
    exit(1)

try:
    while True:
        pi.write(LED_PIN, 1)  # เปิดไฟ
        print("LED ON")
        time.sleep(BLINK_INTERVAL)
        pi.write(LED_PIN, 0)  # ปิดไฟ
        print("LED OFF")
        time.sleep(BLINK_INTERVAL)
except KeyboardInterrupt:
    pass
finally:
    pi.write(LED_PIN, 0)
    pi.stop()
