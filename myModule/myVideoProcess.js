import { spawn } from 'child_process';
let ffmpegProcess = null;
let streamClients = [];

export function addMjpegClient(res) {
  if (process.platform !== 'linux') return;
  if (!ffmpegProcess) {
    ffmpegProcess = spawn('ffmpeg', [
      '-rtsp_transport', 'tcp',
      '-i', 'rtsp://localhost:8554/stream',
      '-f', 'mjpeg',
      '-q:v', '5',
      '-r', '10',
      'pipe:1'
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