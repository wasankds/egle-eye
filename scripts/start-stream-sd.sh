#!/bin/bash
# Start mediamtx if not running
if ! pgrep -x mediamtx > /dev/null; then
  nohup ~/mediamtx/mediamtx -config ~/mediamtx/mediamtx.yml > ~/mediamtx/mediamtx.log 2>&1 &
  sleep 2
fi

# Start RTSP stream (run forever)
# Workaround: encode with libx264 to ensure RTSP compatibility
rpicam-vid --width 720 --height 480 --codec h264 --framerate 10 --inline --timeout 0 -o - | \

### กิน CPU เยอะไปหน่อย
# ffmpeg -re -fflags +genpts -r 10 -i - -c:v libx264 -preset ultrafast -tune zerolatency -f rtsp rtsp://localhost:8554/stream


### ใช้ h264_v4l2m2m เพื่อลดการใช้ CPU
# ffmpeg -re -fflags +genpts -r 10 -i - -c:v h264_v4l2m2m -f rtsp rtsp://localhost:8554/stream

### ปรับ bitrate เป็น 1200k เพื่อคุณภาพที่ดีขึ้น
ffmpeg -re -fflags +genpts -r 10 -i - -c:v h264_v4l2m2m -b:v 1200k -f rtsp rtsp://localhost:8554/stream 