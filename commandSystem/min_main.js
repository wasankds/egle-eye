import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { fileURLToPath } from 'url';



// โฟลเดอร์ที่เก็บไฟล์ .js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
console.log(`------------------------------`);
console.log('__filename ===> ' , __filename);
console.log('__dirname ===> ' , __dirname);
console.log('projectRoot:', projectRoot);

const fileName = 'mpos'; // ห้ามผิด


//====================================================
// ฟังก์ชันสำหรับสร้างไฟล์ JS ที่ถูก minify และ obfuscated
//
async function min_project_file() {
  console.log(`-------------- JS - MIN/OBF ----------------`);

  const mainJsPath = path.join(projectRoot, `${fileName}.js`);
  const combined = fs.readFileSync(mainJsPath, 'utf8');
  
  // 2. Minify ด้วย esbuild
  esbuild.transform(combined, { minify: true, loader: 'js' }).then(result => {
    const minifiedCode = result.code;
    const minPath = path.join(projectRoot, `${fileName}.min.js`);
    fs.writeFileSync(minPath, minifiedCode, 'utf8');
    console.log(`สร้างไฟล์ ${fileName}-min.js (minified) เรียบร้อยแล้ว`);

    // 3. Obfuscate ต่อ
    const obfuscationResult = JavaScriptObfuscator.obfuscate(
      minifiedCode,
      {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        debugProtection: true,
        // debugProtectionInterval: 4000,
        disableConsoleOutput: true,
      }
    );
    const obfPath = path.join(projectRoot, `${fileName}.obf.js`);
    fs.writeFileSync(obfPath, obfuscationResult.getObfuscatedCode(), 'utf8');
    console.log(`สร้างไฟล์ ${fileName}-obf.js (obfuscated) เรียบร้อยแล้ว`);

    //=== ลบไฟล์ min ทิ้ง
    if (fs.existsSync(minPath)) {
      fs.unlinkSync(minPath);
      console.log(`ลบไฟล์ ${fileName}.min.js เรียบร้อยแล้ว`);
    }

  });
}

await min_project_file(); // เรียกใช้ฟังก์ชันเพื่อสร้างไฟล์ JS