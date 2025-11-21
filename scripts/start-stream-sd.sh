#!/bin/bash
# Start mediamtx if not running
if ! pgrep -x mediamtx > /dev/null; then
  nohup ~/mediamtx/mediamtx -config ~/mediamtx/mediamtx.yml > ~/mediamtx/mediamtx.log 2>&1 &
  sleep 2
fi

# Start RTSP stream (run forever) + บันทึกวิดีโอ segment + extract jpg
VIDEO_DIR="videos"
EXTRACT_DIR="videos-extract"
SEGMENT_TIME=600        # 10 นาที (วินาที)
MAX_FILES=100
EXTRACT_FILE="$EXTRACT_DIR/latest.jpg"

mkdir -p "$VIDEO_DIR"
mkdir -p "$EXTRACT_DIR"

# Start RTSP stream (เลือก hardware หรือ software encoder ได้)
rpicam-vid --width 720 --height 480 --codec h264 --framerate 10 --inline --timeout 0 -o - | \
ffmpeg -re -fflags +genpts -r 10 -i - \
  -c:v h264_v4l2m2m -b:v 1200k -f rtsp rtsp://localhost:8554/stream \
  -c:v copy -f segment -segment_time $SEGMENT_TIME -reset_timestamps 1 "$VIDEO_DIR/out_%03d.mp4" \
  -vf "fps=0.1,scale=320:180" -update 1 "$EXTRACT_FILE" &

FFMPEG_PID=$!

# ลูปเช็คจำนวนไฟล์ใน videos/ ลบไฟล์เก่าเมื่อเกิน 100
while true; do
  FILES=($VIDEO_DIR/*.mp4)
  COUNT=${#FILES[@]}
  if [ $COUNT -gt $MAX_FILES ]; then
    ls -1tr $VIDEO_DIR/*.mp4 | head -n $(($COUNT - $MAX_FILES)) | xargs rm -f
  fi
  sleep 60
done

wait $FFMPEG_PID