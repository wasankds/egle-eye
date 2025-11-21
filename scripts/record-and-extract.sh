#!/bin/bash

VIDEO_DIR="videos"
EXTRACT_DIR="videos-extract"
SEGMENT_TIME=600 # 10 นาที (วินาที)  
MAX_VIDEO=500 #1
MAX_JPG=50

mkdir -p "$VIDEO_DIR"
mkdir -p "$EXTRACT_DIR"

# ลบไฟล์ใน EXTRACT_DIR ทั้งหมดตอนเริ่มต้น
rm -f "$EXTRACT_DIR"/*.jpg

# 1. บันทึกวิดีโอ segment 10 นาที/ไฟล์ + extract jpg 5 fps สดจาก stream พร้อมกัน
# q:v 4 คุณภาพดีขึ้น - ลดเป็น 2 ถ้าอยากได้คุณภาพสูงขึ้น
# - fps=10 - ตั้งให้ตรงกับ node.js จะได้ emit ตรงกัน
rpicam-vid -t 0 -o - --width 720 --height 480 --framerate 10 --codec h264 | \
tee \
  >(ffmpeg -y -f h264 -analyzeduration 10000000 -probesize 10000000 -i - \
      -c:v copy \
      -f segment -segment_time $SEGMENT_TIME -reset_timestamps 1 -strftime 1 "$VIDEO_DIR/%Y-%m-%d_%H-%M-%S.mp4" ) \
    | ffmpeg -y -f h264 -analyzeduration 10000000 -probesize 10000000 -i - \
      -vf "fps=5,scale=720:480" -q:v 4 -strftime 1 "$EXTRACT_DIR/%Y-%m-%d_%H-%M-%S_%03d.jpg"

# 2. ลบไฟล์เก่าอัตโนมัติ (mp4/jpg)
while true; do
  FILES=($VIDEO_DIR/*.mp4)
  COUNT=${#FILES[@]}
  if [ $COUNT -gt $MAX_VIDEO ]; then
    ls -1tr $VIDEO_DIR/*.mp4 | head -n $(($COUNT - $MAX_VIDEO)) | xargs rm -f
  fi
  
  JPGS=($EXTRACT_DIR/*.jpg)
  JPG_COUNT=${#JPGS[@]}
  if [ $JPG_COUNT -gt $MAX_JPG ]; then
    ls -1tr $EXTRACT_DIR/*.jpg | head -n $(($JPG_COUNT - $MAX_JPG)) | xargs rm -f
  fi
  sleep 1
done
