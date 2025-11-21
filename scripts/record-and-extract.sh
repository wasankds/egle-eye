#!/bin/bash

VIDEO_DIR="videos"
EXTRACT_DIR="videos-extract"
# SEGMENT_TIME=600        # 10 นาที (วินาที)
SEGMENT_TIME=60 # 1 นาที (วินาที)
MAX_FILES=100
EXTRACT_FILE="$EXTRACT_DIR/latest.jpg"

mkdir -p "$VIDEO_DIR"
mkdir -p "$EXTRACT_DIR"


# 1. ffmpeg: บันทึกวิดีโอ segment 10 นาที/ไฟล์ 
# - สกัดภาพ jpg (resize 320x180) ซ้ำชื่อเดิม
# ffmpeg -f v4l2 -i /dev/video0 \
#   -c:v libx264 -preset veryfast -crf 23 \
#   -f segment -segment_time $SEGMENT_TIME -reset_timestamps 1 "$VIDEO_DIR/out_%03d.mp4" \
#   -vf "fps=0.1,scale=320:180" -update 1 "$EXTRACT_FILE" &

ffmpeg -y -f v4l2 -framerate 10 -video_size 720x480 -i /dev/video0 \
  -vf "format=yuv420p" \
  -c:v mjpeg \
  -f segment -segment_time $SEGMENT_TIME -reset_timestamps 1 -strftime 1 "$VIDEO_DIR/%Y-%m-%d_%H-%M-%S.mp4" \
  -vf "fps=5,scale=320:180,format=rgb24" -update 1 "$EXTRACT_FILE" &

FFMPEG_PID=$!

# 2. ลูปเช็คจำนวนไฟล์ใน videos/ ลบไฟล์เก่าเมื่อเกิน 100
while true; do
  FILES=($VIDEO_DIR/*.mp4)
  COUNT=${#FILES[@]}
  if [ $COUNT -gt $MAX_FILES ]; then
    # sort by time, ลบไฟล์เก่าสุด
    ls -1tr $VIDEO_DIR/*.mp4 | head -n $(($COUNT - $MAX_FILES)) | xargs rm -f
  fi
  sleep 60
done

wait $FFMPEG_PID