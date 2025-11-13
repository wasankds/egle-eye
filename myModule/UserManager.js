// import { EncryptedJSONFile } from '../myModule/crypto.js';

//=== คลาสสำหรับจัดการข้อมูลยูสเซอร์
// import { UserManager } from './myModule/lowDB.js';
// const userManager = new UserManager(global.db);
// await userManager.add({ userId: 1, username: 'test', ... });
export class UserManager {
  constructor(db) {
    this.db = db;
    if (!this.db.data) this.db.data = {};
    if (!this.db.data.users) this.db.data.users = [];
  }

  async getAll() {
    await this.db.read();
    return this.db.data.users;
  }

  async getById(userId) {
    await this.db.read();
    return this.db.data.users.find(u => u.userId === userId);
  }

  async getByUsername(username) {
    await this.db.read();
    return this.db.data.users.find(u => u.username === username);
  }

  async getByEmail(email) {
    await this.db.read();
    return this.db.data.users.find(u => u.userEmail === email);
  }

  async add(user) {
    await this.db.read();
    this.db.data.users.push(user);
    await this.db.write();
    return user;
  }

  async update(userId, updateObj) {
    await this.db.read();
    const user = this.db.data.users.find(u => u.userId === userId);
    if (user) {
      Object.assign(user, updateObj);
      await this.db.write();
      return user;
    }
    return null;
  }

  async remove(userId) {
    await this.db.read();
    this.db.data.users = this.db.data.users.filter(u => u.userId !== userId);
    await this.db.write();
  }
}