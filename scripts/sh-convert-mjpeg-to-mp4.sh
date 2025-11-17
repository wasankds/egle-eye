#!/bin/bash
# sh-convert-mjpeg-to-mp4.sh

FRAMERATE=10   # ปรับตามที่บันทึกจริง
for f in *.mjpeg; do
  [ -e "$f" ] || continue
  mp4="${f%.mjpeg}.mp4"
  if [ ! -f "$mp4" ]; then
    echo "Converting $f -> $mp4"
    ffmpeg -y -framerate $FRAMERATE -i "$f" -c:v libx264 -pix_fmt yuv420p "$mp4"
    # ถ้าต้องการลบ .mjpeg หลังแปลงสำเร็จ ให้เพิ่มบรรทัดนี้:
    # [ -f "$mp4" ] && rm "$f"
  else
    echo "Skip $f (already converted)"
  fi
done

# 
# วิธีใช้:

# บันทึกไฟล์นี้เป็น sh-convert-mjpeg-to-mp4.sh ในโฟลเดอร์ที่มีไฟล์ .mjpeg
# ให้สิทธิ์รัน:
# chmod +x sh-convert-mjpeg-to-mp4.sh
# รันสคริปต์:
# ./sh-convert-mjpeg-to-mp4.sh

# สามารถนำไปตั้ง cron job ให้รันอัตโนมัติได้ เช่น ทุกวันตี 2:
# 0 2 * * * /path/to/sh-convert-mjpeg-to-mp4.sh

# ชั่วงโมงละ 1 ครั้ง:
# 0 * * * * /path/to/sh-convert-mjpeg-to-mp4.sh