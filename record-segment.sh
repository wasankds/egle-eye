#!/bin/bash
mkdir -p ~/videos
MAX_FILES=100

while true; do
 cd ~/videos
 FILE_COUNT=$(ls -1 | wc -l)
 if [ "$FILE_COUNT" -gt "$MAX_FILES" ]; then
 REMOVE_COUNT=$((FILE_COUNT - MAX_FILES))
 ls -1tr | head -n "$REMOVE_COUNT" | xargs rm -f
 fi

 # Record 10-minute segments from RTSP stream
 ffmpeg -rtsp_transport tcp -i rtsp://localhost:8554/stream \
 -c copy -f segment -segment_time 600 \
 -reset_timestamps 1 -strftime 1 "video_%Y-%m-%d_%H-%M-%S.mp4"
 sleep 1
done