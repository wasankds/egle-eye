import pigpio
import time

SERVO_PIN = 18  # GPIO18
pi = pigpio.pi()
if not pi.connected:
    print("pigpio daemon not running!")
    exit(1)

try:
    pi.set_servo_pulsewidth(SERVO_PIN, 1500)  # ตำแหน่งกลาง
    print("Pulse width: 1500us")
    time.sleep(5)
    pi.set_servo_pulsewidth(SERVO_PIN, 0)     # ปิด PWM
finally:
    pi.stop()
