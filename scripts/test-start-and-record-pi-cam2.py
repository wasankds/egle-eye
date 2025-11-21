import time
import numpy as np
import io
import base64
from picamera2 import Picamera2
import cv2
from PIL import Image

# --- 1. กำหนดค่าคอนฟิกกล้อง ---
lores_size = (320, 240)
main_size = (1280, 720)
lores_width, lores_height = lores_size

picam2 = Picamera2()

# กำหนด lores stream เป็น YUV420 ตามที่ libcamera ต้องการ
config = picam2.create_video_configuration(
    main={"size": main_size, "format": "XBGR8888"},
    lores={"size": lores_size, "format": "YUV420"},
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


# --- 3. ฟังก์ชันช่วยในการแปลงภาพ, บันทึกไฟล์ และสร้าง Base64 (ใช้ CV2) ---
def frame_to_base64_and_save(yuv_array: np.ndarray, width: int, height: int) -> str:
    """
    แปลง YUV420 Array เป็น BGR, บันทึกเป็นไฟล์ JPEG และสร้าง Base64 String
    """
    try:
        # 1. ปรับรูปร่าง Array และแปลง YUV420 เป็น BGR โดยใช้ OpenCV
        height_yuv = int(height * 1.5)
        yuv_frame = yuv_array.reshape(height_yuv, width)

        # แปลง YUV420 (ในรูปแบบ I420) เป็น BGR
        bgr_frame = cv2.cvtColor(yuv_frame, cv2.COLOR_YUV2BGR_I420)

        # 2. บันทึกไฟล์ JPEG ลงในโฟลเดอร์ปัจจุบัน
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 70]
        filename = f"captured_image_{time.strftime('%Y%m%d_%H%M%S')}.jpg"

        # cv2.imwrite ใช้ในการบันทึกภาพ
        cv2.imwrite(filename, bgr_frame, encode_param)

        # 3. สร้าง Base64 String สำหรับส่งผ่านเครือข่าย
        result, buffer = cv2.imencode('.jpg', bgr_frame, encode_param)

        if not result:
            raise Exception("CV2 JPEG encoding failed")

        base64_string = base64.b64encode(buffer.tobytes()).decode('utf-8')

        # ส่งชื่อไฟล์ที่บันทึกออกไปด้วย (เพื่อแสดงผลในคอนโซล)
        return base64_string, filename

    except Exception as e:
        print(f"⚠️ เกิดข้อผิดพลาดในการแปลงและบันทึก: {e}")
        return "", None


# --- 4. Loop การจับภาพ ---
try:
    for i in range(5):
        time.sleep(2)

        # ใช้ capture_array() เพื่อดึง YUV420 Array ดิบ
        lores_frame_array = picam2.capture_array("lores")

        print(
            f"\n📸 จับภาพครั้งที่ {i+1} สำเร็จ! ขนาด: {lores_height}x{lores_width}")

        # แปลง, บันทึก และสร้าง Base64
        base64_data, saved_filename = frame_to_base64_and_save(
            lores_frame_array,
            lores_width,
            lores_height
        )

        if base64_data:
            print(f"   - ✅ บันทึกภาพลงในไฟล์: **{saved_filename}**")
            print(
                f"   - ข้อมูลภาพถูกแปลงเป็น Base64 String แล้ว (ความยาว: {len(base64_data)} ตัวอักษร)")
            print(f"   - พร้อมส่ง Base64 ผ่าน Socket.IO")

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
