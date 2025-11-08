import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
console.log('projectRoot:', projectRoot);


// กำหนดโฟลเดอร์ต้นทางและปลายทาง
const sourceFolder = path.join(projectRoot, 'mymodule');
const destinationFolder = path.join(projectRoot, 'mymodule-min');

// สร้างโฟลเดอร์ปลายทางถ้ายังไม่มี
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

// อ่านไฟล์ทั้งหมดในโฟลเดอร์ต้นทาง
const jsFiles = fs.readdirSync(sourceFolder).filter(file => file.endsWith('.js'));

// ฟังก์ชันสำหรับ minify และ obfuscate
async function minifyAndObfuscate(fileName) {
  const filePath = path.join(sourceFolder, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');

  console.log('================================');
  console.log(`กำลังประมวลผลไฟล์: ${fileName}`);

  // Minify ด้วย esbuild
  const minifiedResult = await esbuild.transform(fileContent, { minify: true, loader: 'js' });
  const minifiedCode = minifiedResult.code;

  // Obfuscate ด้วย javascript-obfuscator
  const obfuscationResult = JavaScriptObfuscator.obfuscate(minifiedCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 1,
    debugProtection: true,
    disableConsoleOutput: true,
  });

  // เขียนไฟล์ที่ถูก minify และ obfuscate ลงในโฟลเดอร์ปลายทาง
  const outputPath = path.join(destinationFolder, fileName);
  fs.writeFileSync(outputPath, obfuscationResult.getObfuscatedCode(), 'utf8');

  console.log(`สร้างไฟล์ ${fileName} เรียบร้อยแล้วใน ${destinationFolder}`);
  console.log('------------------------------');
}

// รันฟังก์ชันสำหรับไฟล์ทั้งหมดในโฟลเดอร์ต้นทาง
async function processAllFiles() {
  for (const fileName of jsFiles) {
    await minifyAndObfuscate(fileName);
  }
  console.log('การประมวลผลไฟล์ทั้งหมดเสร็จสิ้น!');
}

await processAllFiles();