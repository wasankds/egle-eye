/********************************
 
ลบไฟล์ .min.js ที่อยู่ในโฟลเดอร์ public/js-min

******************************/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// โฟลเดอร์ที่เก็บไฟล์ .js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
console.log('projectRoot:', projectRoot);

const folderPath = path.join(projectRoot, 'public/js-min');
// อ่านไฟล์ทั้งหมดในโฟลเดอร์
const files = fs.readdirSync(folderPath);

// ลบไฟล์ที่ลงท้ายด้วย .min.js
files.forEach(file => {
  if (file.endsWith('.min.js')) {
    const filePath = path.join(folderPath, file);
    try {
      fs.unlinkSync(filePath); // ลบไฟล์
      console.log(`ลบไฟล์: ${file}`);
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการลบไฟล์ ${file}:`, error.message);
    }
  }
});

console.log('การลบไฟล์ .min.js เสร็จสิ้น!');

