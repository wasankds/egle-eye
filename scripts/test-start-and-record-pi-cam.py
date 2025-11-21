from PIL import Image  # Pillow ใช้ในการเข้ารหัสเป็น JPEG/Base64
import cv2  # *** ใช้ OpenCV ในการแปลงสี YUV420 -> BGR ***
from picamera2 import Picamera2
import base64
import io
import numpy as np
import time
picam2 = Picamera2()
picam2.start()


# --- 1. กำหนดค่าคอนฟิกกล้อง (กำหนด lores เป็น YUV420 ตามที่ libcamera ต้องการ) ---
lores_size = (320, 240)
main_size = (1280, 720)
lores_width, lores_height = lores_size

picam2 = Picamera2()

config = picam2.create_video_configuration(
    main={"size": main_size, "format": "XBGR8888"},
    lores={"size": lores_size, "format": "YUV420"},  # ต้องเป็น YUV420
    display="main"
)

# 2. Configure และ Start
try:
    picam2.configure(config)
    picam2.start()
    print(
        f"▶️ กล้องเริ่มทำงานแล้ว (Main Stream: {main_size}, Lores Stream: {lores_size})")
    print("--------------------------------------------------")
except Exception as e:
    print(f"🚨 ไม่สามารถเริ่มต้นกล้องได้: {e}")
    exit(1)


# --- 3. ฟังก์ชันช่วยในการแปลงภาพเป็น Base64 String (ใช้ CV2 แปลงสี YUV420) ---
def frame_to_base64_cv2(yuv_array: np.ndarray, width: int, height: int) -> str:
    """
    แปลง NumPy Array (YUV420) ที่ได้จาก picamera2 เป็น Base64 String โดยใช้ CV2 
    """
    try:
        # 1. ปรับรูปร่าง Array ให้ตรงตามที่ cv2.cvtColor คาดหวัง
        # สำหรับ YUV420, ความสูงของ Array จะเป็น H * 1.5
        height_yuv = int(height * 1.5)

        # ปรับรูปร่าง Array เป็น (Height * 1.5, Width) เพื่อให้ CV2 ตีความเป็น YUV420
        yuv_frame = yuv_array.reshape(height_yuv, width)

        # 2. แปลง YUV420 (ในรูปแบบ I420) เป็น BGR (รูปแบบมาตรฐานของ CV2)
        bgr_frame = cv2.cvtColor(yuv_frame, cv2.COLOR_YUV2BGR_I420)

        # 3. เข้ารหัส BGR Frame เป็น JPEG Byte Stream ในหน่วยความจำ
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
        result, buffer = cv2.imencode('.jpg', bgr_frame, encode_param)

        if not result:
            raise Exception("CV2 JPEG encoding failed")

        # 4. เข้ารหัสไบต์ JPEG เป็น Base64 String
        base64_string = base64.b64encode(buffer.tobytes()).decode('utf-8')

        return base64_string

    except Exception as e:
        print(f"⚠️ เกิดข้อผิดพลาดในการแปลง Base64 (CV2): {e}")
        return ""


# --- 4. Loop การจับภาพ ---
try:
    for i in range(5):
        time.sleep(2)

        # ใช้ capture_array() เพื่อดึง YUV420 Array ดิบเท่านั้น
        lores_frame_array = picam2.capture_array("lores")

        print(
            f"\n📸 จับภาพครั้งที่ {i+1} สำเร็จ! ขนาด: {lores_height}x{lores_width}")

        # แปลงเป็น Base64 โดยใช้ฟังก์ชัน CV2
        base64_data = frame_to_base64_cv2(
            lores_frame_array,
            lores_width,
            lores_height
        )

        if base64_data:
            print(
                f"   - ข้อมูลภาพถูกแปลงเป็น Base64 String แล้ว (ความยาว: {len(base64_data)} ตัวอักษร)")
            print(
                f"   - ตัวอย่าง Base64 String: data:image/jpeg;base64,{base64_data[:50]}...")
            print("   - พร้อมส่ง Base64 ผ่าน Socket.IO (ใช้ CV2)")

        print("--------------------------------------------------")

except KeyboardInterrupt:
    print("\n🛑 หยุดการทำงานตามคำสั่งผู้ใช้")

except Exception as e:
    print(f"\n🚨 เกิดข้อผิดพลาดร้ายแรง: {e}")

finally:
    # 5. หยุดการทำงานของกล้อง
    if picam2.started:
        picam2.stop()
    print("✅ กล้องหยุดทำงานแล้ว")
