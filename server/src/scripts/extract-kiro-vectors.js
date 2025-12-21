/**
 * Extract KIRO Agent Vectors from SQLite to Qdrant
 * 
 * This script reads 125K+ pre-computed code embeddings from KIRO's index.sqlite
 * and imports them into Qdrant for semantic code search.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { QdrantClient } from '@qdrant/js-client-rest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SQLITE_PATH = path.resolve(__dirname, '../../../workspace-storage/KIRO/globalStorage/kiro.kiroagent/index/index.sqlite');
const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'kiro-code-vectors';
const BATCH_SIZE = 100;

/**
 * Parse KIRO's text-encoded vector format to Float32Array
 * KIRO stores vectors as JSON arrays: "[-0.038, 0.001, ...]"
 */
function parseVectorString(vectorText) {
  try {
    const arr = JSON.parse(vectorText);
    return new Float32Array(arr);
  } catch (error) {
    console.error('Failed to parse vector:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔗 Connecting to KIRO SQLite database...');
  const db = new Database(SQLITE_PATH, { readonly: true });
  
  console.log('🔗 Connecting to Qdrant...');
  const qdrant = new QdrantClient({ url: QDRANT_URL });
  
  try {
    // Check if collection exists, create if not
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (!exists) {
      console.log(`📦 Creating collection: ${COLLECTION_NAME}`);
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 384,
          distance: 'Cosine'
        }
      });
    } else {
      console.log(`✅ Collection exists: ${COLLECTION_NAME}`);
    }
    
    // Count total vectors
    const countRow = db.prepare('SELECT COUNT(*) as total FROM lance_db_cache').get();
    const totalVectors = countRow.total;
    console.log(`📊 Found ${totalVectors} vectors in KIRO database`);
    
    // Sample a few vectors first to understand format
    console.log('\n🔬 Analyzing vector format...');
    const samples = db.prepare('SELECT uuid, cacheKey, path, vector, LENGTH(vector) as vec_len FROM lance_db_cache LIMIT 3').all();
    
    samples.forEach((sample, idx) => {
      console.log(`\nSample ${idx + 1}:`);
      console.log(`  UUID: ${sample.uuid}`);
      console.log(`  Cache Key: ${sample.cacheKey}`);
      console.log(`  Path: ${sample.path}`);
      console.log(`  Vector Length (text): ${sample.vec_len} bytes`);
      console.log(`  Vector Preview: ${sample.vector.substring(0, 100)}...`);
      
      // Test parsing
      const parsed = parseVectorString(sample.vector);
      if (parsed) {
        console.log(`  ✅ Parsed successfully: ${parsed.length} dimensions`);
      }
    });
    
    console.log('\n📤 Starting full extraction to Qdrant...');
    console.log(`Processing ${totalVectors} vectors in batches of ${BATCH_SIZE}...\n`);
    
    let processed = 0;
    let failed = 0;
    const startTime = Date.now();
    
    // Process in batches
    for (let offset = 0; offset < totalVectors; offset += BATCH_SIZE) {
      const batch = db.prepare(`
        SELECT uuid, cacheKey, path, vector, startLine, endLine, contents
        FROM lance_db_cache
        LIMIT ? OFFSET ?
      `).all(BATCH_SIZE, offset);
      
      const points = [];
      for (const row of batch) {
        const vectorArray = parseVectorString(row.vector);
        if (!vectorArray) {
          failed++;
          continue;
        }
        
        points.push({
          id: row.uuid,
          vector: Array.from(vectorArray),
          payload: {
            cacheKey: row.cacheKey,
            path: row.path,
            content: row.contents.substring(0, 5000), // Limit payload size
            startLine: row.startLine,
            endLine: row.endLine,
            source: 'kiro-agent'
          }
        });
      }
      
      if (points.length > 0) {
        await qdrant.upsert(COLLECTION_NAME, {
          wait: true,
          points
        });
        processed += points.length;
      }
      
      // Progress update every 10 batches
      if ((offset / BATCH_SIZE) % 10 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (processed / elapsed).toFixed(0);
        console.log(`   Processed: ${processed}/${totalVectors} (${((processed/totalVectors)*100).toFixed(1)}%) | Rate: ${rate} vectors/sec`);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Extraction complete!`);
    console.log(`   Processed: ${processed} vectors`);
    console.log(`   Failed: ${failed} vectors`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Average Rate: ${(processed / duration).toFixed(0)} vectors/sec`);
    
    // Verify collection
    const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
    console.log(`\n📊 Qdrant Collection Info:`);
    console.log(`   Name: ${collectionInfo.name}`);
    console.log(`   Vectors: ${collectionInfo.vectors_count}`);
    console.log(`   Points: ${collectionInfo.points_count}`);
    
    console.log('\n');
    console.log('Next steps:');
    console.log('1. Test semantic search: "authentication implementation"');
    console.log('2. Verify results match expected code snippets');
    console.log('3. Integrate with Second Brain API');
    
    // Get statistics
    const statsQuery = db.prepare(`
      SELECT 
        cacheKey,
        COUNT(*) as vector_count,
        COUNT(DISTINCT path) as unique_files
      FROM lance_db_cache
      GROUP BY cacheKey
      ORDER BY vector_count DESC
      LIMIT 10
    `).all();
    
    console.log('\n📊 Top 10 Projects by Vector Count:\n');
    statsQuery.forEach((stat, idx) => {
      console.log(`${idx + 1}. ${stat.cacheKey.substring(0, 16)}...`);
      console.log(`   Vectors: ${stat.vector_count}, Files: ${stat.unique_files}\n`);
    });
    
    // Get code snippet statistics
    const snippetCount = db.prepare('SELECT COUNT(*) as total FROM code_snippets').get();
    const chunkCount = db.prepare('SELECT COUNT(*) as total FROM chunks').get();
    
    console.log('📊 Additional Statistics:');
    console.log(`   Code Snippets: ${snippetCount.total}`);
    console.log(`   Code Chunks: ${chunkCount.total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Run if called directly
main()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

export { parseVectorString };
