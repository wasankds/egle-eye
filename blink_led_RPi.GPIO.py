import RPi.GPIO as GPIO
import time

LED_PIN = 17  # ใช้ GPIO17 (Pin 11)
BLINK_INTERVAL = 1  # วินาที

GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)  # เปิดไฟ
        print("LED ON")
        time.sleep(BLINK_INTERVAL)
        GPIO.output(LED_PIN, GPIO.LOW)   # ปิดไฟ
        print("LED OFF")
        time.sleep(BLINK_INTERVAL)
except KeyboardInterrupt:
    pass
finally:
    GPIO.cleanup()
