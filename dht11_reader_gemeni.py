import pigpio
import time
from pigpio_dht import DHT11

# --- ตั้งค่า ---
# GPIO pin ที่ต่อกับขา Data ของ DHT11 (ตามที่คุณระบุคือ GPIO18)
DHT_PIN = 18
# ----------------

# เชื่อมต่อกับ pigpiod daemon
# สคริปต์นี้จะล้มเหลว หาก 'sudo systemctl start pigpiod' ไม่ได้ถูกรันไว้!
try:
    pi = pigpio.pi()
    if not pi.connected:
        print("ไม่สามารถเชื่อมต่อกับ pigpiod daemon ได้")
        print("โปรดรัน: sudo systemctl start pigpiod")
        exit()
except Exception as e:
    print(f"เกิดข้อผิดพลาดในการเชื่อมต่อ pigpio: {e}")
    print("โปรดตรวจสอบว่าติดตั้ง pigpio และรัน daemon แล้ว")
    exit()

# สร้าง instance ของเซ็นเซอร์
# เราส่ง 'pi' (การเชื่อมต่อ) และ 'DHT_PIN' (ขา GPIO) เข้าไป
sensor = DHT11(pi, DHT_PIN)

print(f"กำลังอ่านค่าจาก DHT11 บน GPIO {DHT_PIN}...")
print("กด Ctrl+C เพื่อหยุด")

try:
    while True:
        try:
            # สั่งอ่านค่า
            result = sensor.read()

            if result.is_valid():
                # อ่านค่าสำเร็จ
                print(f"อ่านค่าสำเร็จ:")
                print(f"  อุณหภูมิ (Temperature): {result.temperature:.1f} °C")
                print(f"  ความชื้น (Humidity):    {result.humidity:.1f} %")
            else:
                # อ่านค่าไม่สำเร็จ (อาจเกิดจากการอ่านเร็วไป หรือสัญญาณรบกวน)
                print(f"อ่านค่าล้มเหลว! (Error code: {result.error_code})")
                print("  - ตรวจสอบการเชื่อมต่อ (สายไฟหลวมหรือไม่?)")
                print("  - เซ็นเซอร์อาจยังไม่พร้อม (รอสักครู่)")

            # DHT11 ไม่ควรอ่านค่าถี่เกินไป (แนะนำ 2 วินาทีขึ้นไป)
            time.sleep(2)

        except pigpio.error as e:
            # มักเกิดปัญหาหากอ่านค่าเร็วเกินไป (sensor timeout)
            print(f"เกิดข้อผิดพลาด pigpio: {e}")
            time.sleep(2)  # รอสักครู่ก่อนลองใหม่

except KeyboardInterrupt:
    print("\nกำลังหยุดโปรแกรม...")
finally:
    # ทำความสะอาดเมื่อจบโปรแกรม
    print("กำลังปิดการเชื่อมต่อ...")
    if 'sensor' in locals():
        sensor.cancel()  # หยุดการทำงานของเซ็นเซอร์
    if 'pi' in locals() and pi.connected:
        pi.stop()  # ปิดการเชื่อมต่อกับ daemon
    print("ปิดเรียบร้อย")
