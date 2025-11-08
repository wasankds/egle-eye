import 'dotenv/config' ;  // อยู่บนสุดเสมอ
import readline from 'readline'; // ใช้สำหรับรับ input จาก command line
import { MongoClient } from 'mongodb' ; 
const dbUrl = process.env.DB_URL
const dbName = process.env.DB_NAME
console.log("dbUrl ==> : " + dbUrl)
console.log("dbName ==> : " + dbName)

//===========================================
// 
async function prompt_beforeRun() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('พิมพ์ "yes" เพื่อยืนยันการลบข้อมูล: ', async (answer) => {
    if (answer.trim().toLowerCase() === 'yes') {
      await clear_dataDatabase();
    } else {
      console.log('ยกเลิกการลบข้อมูล');
      process.exit(0);
    }
    rl.close();
  });
}

//=========================================== 
// 
async function clear_dataDatabase() {
  
  const client = new MongoClient(dbUrl);
  
  //=== 1.) collections ที่ไม่ต้องการลบข้อมูล
  const exceptColls = [ 
    'settings', 
    // 'settingsSystem', ไม่มีแล้ว
    'settingsSystemEmail' 
  ]

  console.log('Starting to clear database...')
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName)

    //=== จับทุก collection
    const colls = await db.listCollections().toArray()

    //=== ลบข้อมูลในทุก collections
    await Promise.all( colls.map( async coll => {
      console.log("coll.name ==> : " + coll.name)

      if (exceptColls.includes(coll.name)){
        console.log("Skipping collection '" + coll.name + "'")
        return
      }

      await db.collection(coll.name).deleteMany({})
      console.log("Collection '" + coll.name + "' cleared.")
    }))


    //=== ลบฐานข้อมูล
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
prompt_beforeRun()
