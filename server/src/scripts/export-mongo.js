import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to root/data/exports
const EXPORT_DIR = path.resolve(__dirname, '../../../data/exports');
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

// --- IDEMPOTENCY: Track export metadata ---
const EXPORT_META_FILE = path.join(EXPORT_DIR, '.export_meta.json');

function loadExportMeta() {
    try {
        if (fs.existsSync(EXPORT_META_FILE)) {
            return JSON.parse(fs.readFileSync(EXPORT_META_FILE, 'utf-8'));
        }
    } catch (e) {}
    return {};
}

function saveExportMeta(meta) {
    fs.writeFileSync(EXPORT_META_FILE, JSON.stringify(meta, null, 2));
}

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
        process.exit(0);
    }

    // --- IDEMPOTENCY STATUS REPORT ---
    const meta = loadExportMeta();
    console.log('\n📊 EXPORT STATUS:');
    
    let toExport = [];
    for (const collection of collections) {
        const name = collection.name;
        const currentCount = await mongoose.connection.db.collection(name).countDocuments();
        const lastExport = meta[name];
        const filePath = path.join(EXPORT_DIR, `${name}.json`);
        const fileExists = fs.existsSync(filePath);
        
        if (lastExport && lastExport.count === currentCount && fileExists) {
            console.log(`   ${name}: ${currentCount} docs (✅ up-to-date, exported ${new Date(lastExport.timestamp).toLocaleDateString()})`);
        } else if (fileExists && lastExport) {
            console.log(`   ${name}: ${currentCount} docs (⚡ changed since last export: ${lastExport.count})`);
            toExport.push({ name, count: currentCount });
        } else {
            console.log(`   ${name}: ${currentCount} docs (🆕 never exported)`);
            toExport.push({ name, count: currentCount });
        }
    }
    
    if (toExport.length === 0) {
        console.log('\n✅ All collections already exported and up-to-date. Nothing to do.');
        process.exit(0);
    }
    
    // Check for --force flag
    if (!process.argv.includes('--force') && toExport.length < collections.length) {
        console.log(`\nℹ️  Will export ${toExport.length}/${collections.length} collections (changed/new only).`);
        console.log('   Use --force to re-export all collections.\n');
    } else if (process.argv.includes('--force')) {
        console.log('\n⚡ Force flag detected. Re-exporting ALL collections.\n');
        toExport = collections.map(c => ({ name: c.name }));
    }

    for (const { name } of toExport) {
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
      
      // Update metadata
      meta[name] = { count, timestamp: new Date().toISOString() };
      
      console.log(`\n   -> Saved ${name}.json (${count} records)`);
    }

    saveExportMeta(meta);
    console.log('\n✨ Export complete. Metadata saved to .export_meta.json');
    process.exit(0);
  } catch (err) {
    console.error('❌ Export failed:', err);
    process.exit(1);
  }
}

// Only run if called directly
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectRun) {
    exportCollections();
}

export { exportCollections };
