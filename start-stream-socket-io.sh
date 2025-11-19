#!/bin/bash
# Start mediamtx if not running
if ! pgrep -x mediamtx > /dev/null; then
  nohup ~/mediamtx/mediamtx -config ~/mediamtx/mediamtx.yml > ~/mediamtx/mediamtx.log 2>&1 &
  sleep 2
fi

# Start MJPEG stream (run forever)
# อย่า output binary ไป terminal!
# ให้ Node.js อ่าน stdout ของ ffmpeg โดยตรง
# ถ้าต้อง debug ให้ redirect ไป /dev/null
rpicam-vid --width 640 --height 480 --codec h264 --framerate 10 --inline --timeout 0 -o - | \
ffmpeg -re -i - -vf fps=5 -update 1 -q:v 5 -f image2pipe -vcodec mjpeg - > /dev/null
