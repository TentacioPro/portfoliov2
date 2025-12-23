/**
 * RAW INGESTION ENGINE (ELT Pattern)
 * Goal: Move data from Disk -> MongoDB as fast as possible.
 * Strategy: Parallel File Reading + Bulk Writes + Large File Chunking.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { glob } from 'glob';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIG
const CONFIG = {
  WORKSPACE_ROOT: path.resolve(__dirname, '../../../workspace-storage'),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain',
  BATCH_SIZE: 100, 
  CONCURRENCY: 20,
  // MongoDB Limit is 16MB. We use 10MB chunks to be safe with BSON overhead and UTF-8 expansion.
  CHUNK_SIZE_CHARS: 10 * 1024 * 1024 
};

// ============================================================================
// SCHEMAS
// ============================================================================

const RawConversationSchema = new mongoose.Schema({
  source: String, 
  filePath: String,
  projectName: String,
  workspaceId: String,
  importedAt: Date,
  
  // Chunking Metadata
  isChunked: { type: Boolean, default: false },
  part: { type: Number, default: 1 },
  totalParts: { type: Number, default: 1 },
  
  // The Payload (Object if small, String chunk if large)
  content: mongoose.Schema.Types.Mixed 
});

// Compound index to allow multiple parts for the same file
RawConversationSchema.index({ filePath: 1, part: 1 }, { unique: true });

const RawConversation = mongoose.model('RawConversation', RawConversationSchema);

// ============================================================================
// PARSERS
// ============================================================================

async function parseVSCodeDB(filePath) {
  try {
    const db = await open({ filename: filePath, driver: sqlite3.Database });
    const row = await db.get("SELECT value FROM ItemTable WHERE key LIKE 'workbench.panel.chat%' OR key LIKE 'interactive.sessions%'");
    await db.close();
    if (row && row.value) return JSON.parse(row.value);
  } catch (e) { return null; }
  return null;
}

async function parseJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) { return null; }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function main() {
  console.log(`🚀 INGESTION ENGINE: Scanning "${CONFIG.WORKSPACE_ROOT}"...`);
  await mongoose.connect(CONFIG.MONGO_URI);

  const patterns = [
    '**/state.vscdb', 
    '**/*.chat',
    '**/chatSessions/*.json',
    '**/*chat_history.json' 
  ];
  
  const files = await glob(patterns, { 
    cwd: CONFIG.WORKSPACE_ROOT, 
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**'] 
  });

  console.log(`📂 Found ${files.length} potential conversation files.`);

  let bulkOps = [];
  let processed = 0;
  let success = 0;
  let chunked = 0;

  for (const file of files) {
    const ext = path.extname(file);
    let content = null;
    let type = "unknown";

    const relativePath = path.relative(CONFIG.WORKSPACE_ROOT, file);
    const parts = relativePath.split(path.sep);
    const projectName = parts.length > 1 ? parts[1] : parts[0]; 
    const workspaceId = parts.length > 1 ? parts[1] : 'unknown';

    if (file.endsWith('state.vscdb')) {
        content = await parseVSCodeDB(file);
        type = "vscode";
    } else if (file.includes('chatSessions') && ext === '.json') {
        content = await parseJSON(file);
        type = "vscode";
    } else if (ext === '.chat') {
        content = await parseJSON(file);
        type = "kiro";
    } else if (ext === '.json') {
        content = await parseJSON(file);
        type = "file";
    }

    if (content) {
      const jsonString = JSON.stringify(content);
      // Check length in characters (approximation for speed, but safe margin used)
      const len = jsonString.length;
      
      if (len > CONFIG.CHUNK_SIZE_CHARS) {
          // --- CHUNKING PATH ---
          const totalParts = Math.ceil(len / CONFIG.CHUNK_SIZE_CHARS);
          // console.log(`   ✂️  Chunking ${path.basename(file)} (${(len/1024/1024).toFixed(2)} MB) into ${totalParts} parts.`);
          
          for (let i = 0; i < totalParts; i++) {
              const start = i * CONFIG.CHUNK_SIZE_CHARS;
              const end = start + CONFIG.CHUNK_SIZE_CHARS;
              const chunkStr = jsonString.substring(start, end);
              
              bulkOps.push({
                updateOne: {
                  filter: { filePath: file, part: i + 1 },
                  update: {
                    $set: {
                      source: type,
                      filePath: file,
                      projectName: projectName,
                      workspaceId: workspaceId,
                      importedAt: new Date(),
                      isChunked: true,
                      part: i + 1,
                      totalParts: totalParts,
                      content: chunkStr // Store as string chunk
                    }
                  },
                  upsert: true
                }
              });
          }
          chunked++;
      } else {
          // --- NORMAL PATH ---
          bulkOps.push({
            updateOne: {
              filter: { filePath: file, part: 1 },
              update: {
                $set: {
                  source: type,
                  filePath: file,
                  projectName: projectName,
                  workspaceId: workspaceId,
                  importedAt: new Date(),
                  isChunked: false,
                  part: 1,
                  totalParts: 1,
                  content: content // Store as Object
                }
              },
              upsert: true
            }
          });
      }
      success++;
    }

    processed++;
    if (processed % 50 === 0) {
        process.stdout.write(`\rProcessing: ${processed}/${files.length} | buffer: ${bulkOps.length} | chunked: ${chunked}`);
    }

    if (bulkOps.length >= CONFIG.BATCH_SIZE) {
      try {
        await RawConversation.bulkWrite(bulkOps);
      } catch (err) {
        console.error(`\n❌ Batch write failed: ${err.message}`);
      }
      bulkOps = [];
    }
  }

  if (bulkOps.length > 0) {
    try {
        await RawConversation.bulkWrite(bulkOps);
    } catch (err) {
        console.error(`\n❌ Final batch write failed: ${err.message}`);
    }
  }

  console.log(`\n\n✅ INGESTION COMPLETE.`);
  console.log(`   Scanned: ${processed}`);
  console.log(`   Imported Files: ${success}`);
  console.log(`   Large Files Chunked: ${chunked}`);
  
  process.exit(0);
}

main();
