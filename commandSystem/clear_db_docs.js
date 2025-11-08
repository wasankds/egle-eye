import 'dotenv/config' ;  // อยู่บนสุดเสมอ
import readline from 'readline'; // ใช้สำหรับรับ input จาก command line
import { MongoClient } from 'mongodb' ; 
const dbUrl = process.env.DB_URL
const dbName = process.env.DB_NAME
import '../mymodule-min/myGlobal.js'  // ประกาศ global ตัวแปรต่างๆ - ใช้ตัว min


//===========================================
// 
async function prompt_beforeRun() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('พิมพ์ "yes" เพื่อยืนยันการลบข้อมูล: ', async (answer) => {
    if (answer.trim().toLowerCase() === 'yes') {
      await clear_docs_data();
    } else {
      console.log('ยกเลิกการลบข้อมูล');
      process.exit(0);
    }
    rl.close();
  });
}
//===========================================
// 
async function clear_docs_data() {
  const client = new MongoClient(dbUrl);
  try {
    await client.connect();
    console.log('----- Connected to MongoDB ------');

    const db = client.db(dbName)

    //=== ล้างข้อมูลใน collections ที่ระบุ
    const colls = [
      global.dbColl_warehouseIn ,
      global.dbColl_warehouseOut ,
      global.dbColl_sales ,
      global.dbColl_return ,

      global.dbColl_report_warehouseIn_item1 ,
      global.dbColl_report_warehouseOut_item1 ,
      global.dbColl_report_sales_item1 ,
      global.dbColl_report_return_item1 ,
      
      global.dbColl_report_warehouseIn_item2 ,
      global.dbColl_report_warehouseOut_item2 ,
      global.dbColl_report_sales_item2 ,
      global.dbColl_report_return_item2 ,
    ]
    console.log('Collections to be cleared:', colls);

    //=== ลบข้อมูลในทุก collections
    for (const collName of colls) {
      console.log("Collection ===> : " + collName)
      await db.collection(collName).deleteMany({})
    }

  } catch (error) {
    console.error('Error deleting fields:', error)
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB')
  }
}


prompt_beforeRun()