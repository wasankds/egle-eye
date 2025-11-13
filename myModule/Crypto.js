// import { Low } from 'lowdb';
// import { JSONFile } from 'lowdb/node';
import CryptoJS from 'crypto-js';
import fs from 'fs';
const secretKey = process.env.DB_ENCRYPTED_KEY;

export class EncryptedJSONFile {
  constructor(filename) {
    this.filename = filename;
  }

  async read() {
    try {
      const encrypted = await fs.promises.readFile(this.filename, 'utf-8');
      const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (e) {
      return null;
    }
  }

  async write(obj) {
    const json = JSON.stringify(obj);
    const encrypted = CryptoJS.AES.encrypt(json, secretKey).toString();
    await fs.promises.writeFile(this.filename, encrypted, 'utf-8');
  }
  
}

// // ใช้งานกับ lowdb
// const adapter = new EncryptedJSONFile('data/db.json');
// const db = new Low(adapter, { users: [], sessions: [] });