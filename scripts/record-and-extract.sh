#!/bin/bash

VIDEO_DIR="videos"
EXTRACT_DIR="videos-extract"
SEGMENT_TIME=60 # 10 นาที (วินาที)
MAX_FILES=100
EXTRACT_FILE="$EXTRACT_DIR/latest.jpg"

mkdir -p "$VIDEO_DIR"
mkdir -p "$EXTRACT_DIR"

# 1. ใช้ rpicam-vid ส่ง h264 stream ไป ffmpeg (ตัด option ที่ error ออก)
rpicam-vid -t 0 -o - --width 720 --height 480 --framerate 10 --codec h264 | \
ffmpeg -y -f h264 -analyzeduration 10000000 -probesize 10000000 -i - \
  -c:v copy \
  -f segment -segment_time $SEGMENT_TIME -reset_timestamps 1 -strftime 1 "$VIDEO_DIR/%Y-%m-%d_%H-%M-%S.mp4" &

FFMPEG_PID=$!


# 2. extract jpg จากวิดีโอล่าสุด (เขียนทับ latest.jpg ตลอด)
sleep 10 # รอให้ไฟล์ mp4 แรกถูกสร้างและมีข้อมูลก่อน
while true; do
  FILES=($VIDEO_DIR/*.mp4)
  COUNT=${#FILES[@]}
  if [ $COUNT -gt $MAX_FILES ]; then
    ls -1tr $VIDEO_DIR/*.mp4 | head -n $(($COUNT - $MAX_FILES)) | xargs rm -f
  fi
  LATEST_MP4=$(ls -1tr $VIDEO_DIR/*.mp4 2>/dev/null | tail -n 1)
  if [ -n "$LATEST_MP4" ]; then
    ffmpeg -y -i "$LATEST_MP4" -vf "select=not(mod(n\,2)),scale=320:180" -vframes 1 "$EXTRACT_FILE" >/dev/null 2>&1
  fi
  sleep 1
done

wait $FFMPEG_PID