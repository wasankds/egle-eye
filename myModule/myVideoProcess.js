import { spawn } from 'child_process';
let ffmpegProcess = null;
let streamClients = [];

// เรียกใช้เมื่อมี client ใหม่ (ดึง RTSP → MJPEG)
export function addMjpegClient(res) {
  if (process.platform !== 'linux') return;
  if (!ffmpegProcess) {
    ffmpegProcess = spawn('ffmpeg', [
      '-rtsp_transport', 'tcp', // ใช้ TCP แทน UDP
      '-i', 'rtsp://localhost:8554/stream', // URL ของกล้อง RTSP
      '-f', 'mjpeg', // รูปแบบเอาต์พุต
      '-q:v', '5', // คุณภาพของภาพ 1-31 (น้อย=ดี)
      '-r', '10',  // เฟรมต่อวินาที
      'pipe:1'     // ส่งออกทาง stdout
    ]);
    ffmpegProcess.stdout.on('data', (data) => {
      streamClients.forEach(r => r.write(data));
    });
    ffmpegProcess.on('exit', () => {
      ffmpegProcess = null;
      streamClients.forEach(r => r.end());
      streamClients = [];
    });
  }
  streamClients.push(res);
  res.on('close', () => {
    streamClients = streamClients.filter(r => r !== res);
    if (streamClients.length === 0 && ffmpegProcess) {
      ffmpegProcess.kill('SIGINT');
      ffmpegProcess = null;
    }
  });
}

