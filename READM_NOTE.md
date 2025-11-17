
## Git: รีเซ็ตและอัปเดตโปรเจกต์

ใช้คำสั่งเหล่านี้เพื่อรีเซ็ตไฟล์ทั้งหมดในโปรเจกต์และดึงโค้ดล่าสุดจากรีโมต

```bash
git reset --hard HEAD      # รีเซ็ตไฟล์ทั้งหมดกลับไปที่ commit ล่าสุด
git clean -fd              # ลบไฟล์และโฟลเดอร์ที่ไม่ได้อยู่ใน git
git pull                   # ดึงโค้ดล่าสุดจากรีโมต
```

##   รันคำสั่งเดียวเลย

```bash
git reset --hard HEAD && git clean -fd && git pull  
```

## สร้าง branch ชื่อ camera-stream
จากนั้น commit เก็บไว้
จากนั้นกลับไปทำงานต่อที่ main โดยไม่ยุ่งกับ branch ชื่อ camera-stream

```bash
git checkout -b camera-stream
git add .
git commit -m "feat: implement efficient multi-client camera stream relay"
git checkout main
```



## ปิด pigpiod

```bash
sudo killall pigpiod
sudo pigpiod
```

## คำสั่ง scp

```bash
 PS D:\aWK_LeaseSystem\egle-eye> scp node-servo-moter.js wasankds@192.168.1.135:~/egle-eye
```
##  คำสั่ง scp - ก๊อปี้ไฟล์ video

```bash
 PS D:\aWK_LeaseSystem\egle-eye> scp wasankds@192.168.1.135:~/egle-eye/videos/2025-11-16_10-18-04.h264 .
```

```bash
## ใช้คำสั่งนี้บน Raspberry Pi เพื่อตรวจสอบและ kill ทุก process ที่เกี่ยวกับ rpicam-vid หรือ libcamera

ps aux | grep rpicam
sudo killall rpicam-vid

ps aux | grep libcamera
sudo killall libcamera-vid
```

```bash
หรือ kill แบบ force (ถ้ายังไม่หยุด):
sudo killall -9 rpicam-vid
sudo killall -9 libcamera-vid
```