import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPORT_DIR = path.resolve(__dirname, '../../../data/exports');
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

// --- IDEMPOTENCY: Track import metadata ---
const IMPORT_META_FILE = path.join(EXPORT_DIR, '.import_meta.json');

function loadImportMeta() {
    try {
        if (fs.existsSync(IMPORT_META_FILE)) {
            return JSON.parse(fs.readFileSync(IMPORT_META_FILE, 'utf-8'));
        }
    } catch (e) {}
    return {};
}

function saveImportMeta(meta) {
    fs.writeFileSync(IMPORT_META_FILE, JSON.stringify(meta, null, 2));
}

function askQuestion(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.toLowerCase());
    }));
}

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

    // --- IDEMPOTENCY STATUS REPORT ---
    const fileStat = fs.statSync(filePath);
    const fileModified = fileStat.mtime.toISOString();
    const meta = loadImportMeta();
    const lastImport = meta[`${jsonFileName}->${targetCollectionName}`];
    
    const collection = mongoose.connection.db.collection(targetCollectionName);
    const existingCount = await collection.countDocuments();
    
    console.log('\n📊 IMPORT STATUS:');
    console.log(`   Source File:      ${jsonFileName}`);
    console.log(`   File Modified:    ${new Date(fileModified).toLocaleString()}`);
    console.log(`   Target Collection: ${targetCollectionName}`);
    console.log(`   Existing Docs:    ${existingCount}`);
    
    if (lastImport) {
        console.log(`   Last Import:      ${new Date(lastImport.timestamp).toLocaleString()}`);
        console.log(`   Last Import Count: ${lastImport.count}`);
        
        // Check if file hasn't changed since last import
        if (lastImport.fileModified === fileModified && existingCount === lastImport.count) {
            console.log('\n✅ Collection already up-to-date with source file. Nothing to do.');
            if (!process.argv.includes('--force')) {
                process.exit(0);
            }
            console.log('   --force detected. Proceeding anyway.\n');
        }
    }

    console.log(`\n📂 Reading ${jsonFileName}...`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`📊 Found ${data.length} documents in file.`);
    
    // Check for existing data and decide strategy
    if (existingCount > 0 && !process.argv.includes('--force')) {
      console.log(`\n⚠️ Collection "${targetCollectionName}" already has ${existingCount} documents.`);
      console.log('   Options:');
      console.log('     [s] Skip - Exit without changes');
      console.log('     [m] Merge - Add only new documents (by _id)');
      console.log('     [r] Replace - Drop and reimport all');
      
      const choice = await askQuestion('\n   Choose action [s/m/r]: ');
      
      if (choice === 's') {
          console.log('Skipping import.');
          process.exit(0);
      } else if (choice === 'r') {
          console.log('🗑️ Dropping existing collection...');
          await collection.drop();
      } else if (choice === 'm') {
          // Merge mode: Get existing IDs
          console.log('🔍 Analyzing existing documents for merge...');
          const existingIds = new Set();
          const cursor = collection.find({}, { projection: { _id: 1 } });
          for await (const doc of cursor) {
              existingIds.add(doc._id.toString());
          }
          
          const newDocs = data.filter(d => !existingIds.has(d._id?.toString?.() || d._id?.$oid));
          console.log(`   Found ${newDocs.length} new documents to add.`);
          
          if (newDocs.length === 0) {
              console.log('✅ No new documents to import.');
              process.exit(0);
          }
          
          // Import only new docs
          const BATCH_SIZE = 1000;
          let inserted = 0;
          for (let i = 0; i < newDocs.length; i += BATCH_SIZE) {
              const batch = newDocs.slice(i, i + BATCH_SIZE);
              await collection.insertMany(batch);
              inserted += batch.length;
              process.stdout.write(`\r   -> Inserted ${inserted}/${newDocs.length} documents...`);
          }
          
          // Update metadata
          const finalCount = await collection.countDocuments();
          meta[`${jsonFileName}->${targetCollectionName}`] = { 
              count: finalCount, 
              timestamp: new Date().toISOString(),
              fileModified 
          };
          saveImportMeta(meta);
          
          console.log(`\n✅ Successfully merged ${newDocs.length} new documents.`);
          console.log(`📊 Total documents now: ${finalCount}`);
          process.exit(0);
      }
    } else if (existingCount > 0 && process.argv.includes('--force')) {
      console.log(`🗑️ Force flag: Dropping existing collection...`);
      await collection.drop();
    }

    // Full import (new collection or after drop)
    const BATCH_SIZE = 1000;
    let inserted = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      await collection.insertMany(batch);
      inserted += batch.length;
      process.stdout.write(`\r   -> Inserted ${inserted}/${data.length} documents...`);
    }

    // Update metadata
    const finalCount = await collection.countDocuments();
    meta[`${jsonFileName}->${targetCollectionName}`] = { 
        count: finalCount, 
        timestamp: new Date().toISOString(),
        fileModified 
    };
    saveImportMeta(meta);

    console.log(`\n✅ Successfully imported ${data.length} documents into "${targetCollectionName}"`);
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
  --force  Drop existing collection before import (skip prompts)

Idempotency:
  - Tracks last import timestamp and document counts
  - Supports merge mode to add only new documents
  - Skips import if source file unchanged since last run
`);
  process.exit(1);
}

const [jsonFile, collectionName] = args;
importCollection(jsonFile, collectionName);
