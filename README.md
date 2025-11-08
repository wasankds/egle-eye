# Eagle Eye

## การใช้งาน Git

**SSH Clone:**
```bash
git@github.com:wasankds/egle-eye.git
```

**HTTPS Clone:**
```bash
git clone https://github.com/wasankds/egle-eye.git egle-eye
```

## การตั้งค่าไฟล์ Environment

เปลี่ยนชื่อไฟล์ `.env-deploy` เป็น `.env`:
```bash
mv .env-deploy .env
```

## การจัดการ Process

**ลบ Process ทั้งหมด:**
```bash
pgrep -fla node
```
```bash
ps aux | grep node
```

| คอลัมน์   | คำอธิบาย                                                                                   |
|-----------|---------------------------------------------------------------------------------------------|
| USER      | ชื่อผู้ใช้ที่รัน Process นั้น                                                                |
| PID       | Process ID (หมายเลขประจำตัวของ Process)                                                     |
| %CPU      | เปอร์เซ็นต์การใช้ CPU ในปัจจุบัน                                                            |
| %MEM      | เปอร์เซ็นต์การใช้ RAM ในปัจจุบัน                                                            |
| STAT      | สถานะของ Process (เช่น S=Sleeping, R=Running, Sl=Sleeping and multi-threaded)               |
| COMMAND   | คำสั่งที่ใช้ในการรัน Process                                                                |

### ตัวอย่างผลลัพธ์การดู Process

```
wasankds  867  2.9  9.3  1263192  86796  pts/0  Sl+  15:34  0:04  node egleeye.js
```

- **PID:** `867` คือ Node.js process หลักที่กำลังรันไฟล์ `egleeye.js`
- **%CPU:** `2.9` แสดงว่า Process นี้ใช้ CPU อยู่ 2.9%
- **%MEM:** `9.3` หมายถึงใช้ RAM 9.3% ของทั้งหมด (ประมาณ 86.8 MB จาก 906 MB)
- **STAT:** `Sl+` คือสถานะ Sleeping (รอ I/O หรือเหตุการณ์), เป็น Multi-threaded (L), และรัน foreground (+)
- **COMMAND:** `node egleeye.js` ยืนยันว่าเป็นแอป Node.js ของคุณ


**ลบ Process ทั้งหมด:**
```bash
pkill -9 bun
pkill -9 node
```

## ตรวจสอบพอร์ตที่ใช้งาน

**ดูพอร์ตทั้งหมด:**
```bash
sudo ss -tuln
```

**ดูพอร์ต 3000:**
```bash
sudo ss -tulpn | grep 3000
```

**ออปชั่นคำอธิบาย:**
- `-t` แสดงเฉพาะพอร์ต TCP
- `-u` แสดงเฉพาะพอร์ต UDP
- `-l` แสดงเฉพาะ Socket ที่อยู่ในสถานะ LISTEN (รอการเชื่อมต่อ)
- `-n` แสดงเป็นตัวเลข (IP และ Port) แทนชื่อ Host/Service (ทำให้เร็วขึ้น)
- `-p` แสดงชื่อโปรเซสและ PID ที่ใช้พอร์ตนั้น

**ตัวอย่างผลลัพธ์:**
```
tcp   LISTEN 0 512 *:3000 *:* users:(("bun",pid=57546,fd=13))
```

## การจัดการ systemd

**ตรวจสอบ systemd ที่ใช้ pid:**
```bash
systemctl status <pid>
```

**ลบ Process แบบระบุ pid:**
```bash
sudo kill <pid>
```

**ปิด systemd:**
```bash
sudo systemctl stop <ชื่อ systemd>
```

**ปิดการทำงานอัตโนมัติของ systemd:**
```bash
sudo systemctl disable <ชื่อ systemd>
```

**ตรวจสอบสถานะ:**
```bash
systemctl status <ชื่อ systemd>
```

## คำสั่งควบคุมเครื่อง

**รีบูตเครื่อง:**
```bash
sudo reboot
```

**ปิดเครื่อง:**
```bash
sudo shutdown now
```

**ดูการใช้งานแบบเรียลไทม์ (Real-Time Monitoring):**
```bash
top
```