import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_DIR = path.resolve(__dirname, '../../../data/exports');
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

async function importCollection(jsonFileName, targetCollectionName) {
  try {
    const filePath = path.join(EXPORT_DIR, jsonFileName);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    console.log(`Connecting to ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`📂 Reading ${jsonFileName}...`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`📊 Found ${data.length} documents`);

    const collection = mongoose.connection.db.collection(targetCollectionName);
    
    // Check if collection exists and has data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ Collection "${targetCollectionName}" already has ${existingCount} documents.`);
      console.log(`   Use --force to drop and reimport, or choose a different name.`);
      
      if (!process.argv.includes('--force')) {
        process.exit(1);
      }
      
      console.log(`🗑️ Dropping existing collection...`);
      await collection.drop();
    }

    // Batch insert (1000 docs at a time)
    const BATCH_SIZE = 1000;
    let inserted = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      await collection.insertMany(batch);
      inserted += batch.length;
      process.stdout.write(`\r   -> Inserted ${inserted}/${data.length} documents...`);
    }

    console.log(`\n✅ Successfully imported ${data.length} documents into "${targetCollectionName}"`);
    
    // Verify
    const finalCount = await collection.countDocuments();
    console.log(`📊 Verification: ${finalCount} documents in collection`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  }
}

// CLI Usage
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (args.length < 2) {
  console.log(`
Usage: node import-mongo.js <json-file> <collection-name> [--force]

Examples:
  node import-mongo.js rawconversations.json neuralarchiveRaw
  node import-mongo.js conversations.json conversations --force

Options:
  --force  Drop existing collection before import
`);
  process.exit(1);
}

const [jsonFile, collectionName] = args;
importCollection(jsonFile, collectionName);
