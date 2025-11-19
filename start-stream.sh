#!/bin/bash
# Start mediamtx if not running
if ! pgrep -x mediamtx > /dev/null; then
  nohup ~/mediamtx/mediamtx -config ~/mediamtx/mediamtx.yml > ~/mediamtx/mediamtx.log 2>&1 &
  sleep 2
fi

# Start RTSP stream (run forever)
# Workaround: encode with libx264 to ensure RTSP compatibility
rpicam-vid --width 640 --height 480 --codec h264 --framerate 15 --inline --timeout 0 -o - | \
ffmpeg -re -fflags +genpts -r 15 -i - -c:v libx264 -preset ultrafast -tune zerolatency -f rtsp rtsp://localhost:8554/stream
