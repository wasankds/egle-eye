
/* 

การสร้าง index ด้วย db.collection.createIndex({key:1})
ควรทำ "ครั้งเดียว" ต่อ collection (ไม่ต้องทำซ้ำทุกครั้งที่ query)
โดยปกติจะทำในขั้นตอน setup database หรือ maintenance

*/
 
import 'dotenv/config'
import { MongoClient } from 'mongodb'
const dbUrl = process.env.DB_URL
const dbName = process.env.DB_NAME
console.log('Database URL :', dbUrl)
console.log('Database Name :', dbName)

const client = new MongoClient(dbUrl);
async function createDbCollectionIndexFunc() {
  try {
    await client.connect();
    const db = client.db(dbName);


    //=== 1.) กรองชื่อ collection ที่ต้องการสร้าง index
    // - ขึ้นต้นด้วย e + ตัวเลข 3 ตัว (เช่น e001, e123)
    const filterRegex = /^e\d{3}$/;
    const colls = await db.listCollections().toArray()
    const filteredColls = colls
                          .map(coll => coll.name)
                          .filter(name => filterRegex.test(name));

    //=== วนลูปสร้าง index บนฟิลด์ "key"
    for (const collName of filteredColls) { 
      const collection = db.collection(collName);      

      //=== ล้าง Index ของเดิม (ถ้ามี) - ยกเว้น _id index
      try {
        const indexes = await collection.listIndexes().toArray();
        console.log(`Existing indexes in '${collName}':`, indexes.map(idx => idx.name));
        
        // ลบ index ทั้งหมดยกเว้น _id_
        for (const index of indexes) {
          if (index.name !== '_id_') {
            await collection.dropIndex(index.name);
            console.log(`Dropped index '${index.name}' from collection '${collName}'`);
          }
        }
      } catch (error) {
        console.log(`No existing indexes to drop in collection '${collName}':`, error.message);
      }

      const result2 = await collection.createIndex({ id: 1 });
      const result1 = await collection.createIndex({ key: 1 });
      const result3 = await collection.createIndex({ timeInterval: 1 });
      // ใช้ combined index - ต้องค้นหาข้อมูลโดยใช้ key และ timeInterval ร่วมกัน
      const result4 = await collection.createIndex({ key: 1, timeInterval: 1 });

      console.log(`Index 'key' created on collection '${collName}':`, result1);
      console.log(`Index 'id' created on collection '${collName}':`, result2);
      console.log(`Index 'timeInterval' created on collection '${collName}':`, result3);
      console.log(`Index 'key_timeInterval' created on collection '${collName}':`, result4);
      console.log(`-------------------------------------------`);
    }

    //=== 2.) collection อื่นๆ
    const collections_other = [
      { name: 'users', index: { userId: 1 } },
      { name: 'alerts', index: { key: 1, deviceId: 1 } },
    ]
    for (const { name, index } of collections_other) {
      const collection = db.collection(name);
      
      //=== ล้าง index เดิม (ยกเว้น _id)
      try {
        const indexes = await collection.listIndexes().toArray();
        console.log(`Existing indexes in '${name}':`, indexes.map(idx => idx.name));
        
        // ลบ index ทั้งหมดยกเว้น _id_
        for (const idx of indexes) {
          if (idx.name !== '_id_') {
            await collection.dropIndex(idx.name);
            console.log(`Dropped index '${idx.name}' from collection '${name}'`);
          }
        }
      } catch (error) {
        console.log(`No existing indexes to drop in collection '${name}':`, error.message);
      }
      
      const result = await collection.createIndex(index);
      console.log(`Index created on collection '${name}':`, result);
    }

  } catch (error) {
    console.error('Error deleting fields:', error)
  } finally {
    await client.close();
  }
}

createDbCollectionIndexFunc()