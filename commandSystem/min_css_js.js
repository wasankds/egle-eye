import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// ทำ minification ทั้งหมดที่อยู่ในโฟลเดอร์ minification
// โฟลเดอร์ที่เก็บไฟล์ .js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const folderPath = path.join(projectRoot, 'minification');
console.log('------- min Project --------');
console.log('projectRoot:', projectRoot);
console.log('Folder path:', folderPath);


// อ่านไฟล์ทั้งหมดในโฟลเดอร์
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // กรองเฉพาะไฟล์ .js
  const jsFiles = files.filter(file => file.endsWith('.js'));

  // รันไฟล์ทีละไฟล์ตามลำดับ
  const runFile = (index) => {
    if (index >= jsFiles.length) {
      console.log('All files executed.');
      return;
    }

    const filePath = path.join(folderPath, jsFiles[index]);
    console.log(`Running file: ${filePath}`);

    exec(`node ${filePath}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error executing file ${filePath}:`, err);
        return;
      }

      console.log(`Output for ${filePath}:\n`, stdout);
      if (stderr) {
        console.error(`Error output for ${filePath}:\n`, stderr);
      }

      // รันไฟล์ถัดไป
      runFile(index + 1);
    });
  };

  // เริ่มรันไฟล์แรก
  runFile(0);
});