import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to root/data/exports
const EXPORT_DIR = path.resolve(__dirname, '../../../data/exports');
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

async function exportCollections() {
  try {
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    console.log(`Connecting to ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
        console.log('⚠️ No collections found in database.');
    }

    for (const collection of collections) {
      const name = collection.name;
      console.log(`📦 Exporting ${name}...`);
      
      const filePath = path.join(EXPORT_DIR, `${name}.json`);
      const writeStream = fs.createWriteStream(filePath, { flags: 'w' });
      
      writeStream.write('[\n');
      
      const cursor = mongoose.connection.db.collection(name).find({});
      let count = 0;
      let hasNext = await cursor.hasNext();

      while (hasNext) {
        const doc = await cursor.next();
        writeStream.write(JSON.stringify(doc, null, 2));
        
        hasNext = await cursor.hasNext();
        if (hasNext) {
          writeStream.write(',\n');
        }
        
        count++;
        if (count % 1000 === 0) {
            process.stdout.write(`\r   -> Processed ${count} records...`);
        }
      }

      writeStream.write('\n]');
      writeStream.end();
      
      console.log(`\n   -> Saved ${name}.json (${count} records)`);
    }

    console.log('✨ Export complete.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

exportCollections();
