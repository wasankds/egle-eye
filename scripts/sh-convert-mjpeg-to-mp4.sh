
#!/bin/bash
# sh-convert-mjpeg-to-mp4.sh

FRAMERATE=10   # ปรับตามที่บันทึกจริง
SRC_DIR="$(dirname "$0")/../videos"
DEST_DIR="$(dirname "$0")/../videos-mp4"
mkdir -p "$DEST_DIR"

for f in "$SRC_DIR"/*.mjpeg; do
  [ -e "$f" ] || continue
  base=$(basename "$f" .mjpeg)
  mp4="$DEST_DIR/$base.mp4"
  if [ ! -f "$mp4" ]; then
    echo "Converting $f -> $mp4"
    ffmpeg -y -framerate $FRAMERATE -i "$f" -c:v libx264 -pix_fmt yuv420p "$mp4"
    if [ -f "$mp4" ]; then
      rm "$f"
    fi
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