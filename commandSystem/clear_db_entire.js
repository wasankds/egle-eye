import 'dotenv/config' ;  // อยู่บนสุดเสมอ
import readline from 'readline'; // ใช้สำหรับรับ input จาก command line
import { MongoClient } from 'mongodb'

//===========================================
// 
async function prompt_breforeRun() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('พิมพ์ "yes" เพื่อยืนยันการลบข้อมูล: ', async (answer) => {
    if (answer.trim().toLowerCase() === 'yes') {
      await clear_Database();
    } else {
      console.log('ยกเลิกการลบข้อมูล');
      process.exit(0);
    }
    rl.close();
  });
}

//===========================================
// 
async function clear_Database() {
  const client = new MongoClient(dbUrl);
  const dbUrl = process.env.DB_URL
  const dbName = process.env.DB_NAME
  console.log("dbUrl ==> : " + dbUrl)
  console.log("dbName ==> : " + dbName)

  console.log('Starting to clear database...')
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName)

    //=== 1.) จับทุก collection
    const colls = await db.listCollections().toArray()

    //=== 2.) ลบข้อมูลในทุก collections
    await Promise.all( colls.map( async coll => {
      console.log("coll.name ==> : " + coll.name)

      await db.collection(coll.name).deleteMany({})
      console.log("Collection '" + coll.name + "' cleared.")
    }))

    //=== 3.) ลบฐานข้อมูล
    await db.dropDatabase();
    console.log(`Database '${dbName}' deleted.`);

  } catch (error) {
    console.error('Error deleting fields:', error)
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB')
  }

}

// เรียกใช้งาน prompt ก่อนลบจริง
prompt_breforeRun();

