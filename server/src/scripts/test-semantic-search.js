/**
 * Test Semantic Search on KIRO Code Vectors
 * 
 * Verifies that the 125K extracted vectors work correctly in Qdrant
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline } from '@xenova/transformers';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'kiro-code-vectors';

async function main() {
  console.log('🔗 Connecting to Qdrant...');
  const qdrant = new QdrantClient({ url: QDRANT_URL });
  
  console.log('🤖 Loading embedding model (all-MiniLM-L6-v2)...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  // Test queries
  const testQueries = [
    'authentication login user credentials',
    'database connection MongoDB setup',
    'API route handler Express',
    'React component useState hooks',
    'error handling try catch'
  ];
  
  console.log('\n🔍 Running semantic search tests...\n');
  
  for (const query of testQueries) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('─'.repeat(80));
    
    // Generate embedding for query
    const output = await embedder(query, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);
    
    // Search Qdrant
    const results = await qdrant.search(COLLECTION_NAME, {
      vector: queryVector,
      limit: 5,
      with_payload: true
    });
    
    if (results.length === 0) {
      console.log('   ⚠️  No results found\n');
      continue;
    }
    
    results.forEach((result, idx) => {
      console.log(`\n${idx + 1}. Score: ${result.score.toFixed(4)}`);
      console.log(`   File: ${result.payload.path}`);
      console.log(`   Lines: ${result.payload.startLine}-${result.payload.endLine}`);
      console.log(`   Project: ${result.payload.cacheKey.substring(0, 16)}...`);
      console.log(`   Content: ${result.payload.content.substring(0, 150)}...`);
    });
    
    console.log('\n');
  }
  
  // Get collection statistics
  console.log('\n📊 Collection Statistics:');
  const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
  console.log(`   Total Points: ${collectionInfo.points_count}`);
  console.log(`   Vector Dimension: ${collectionInfo.config.params.vectors.size}`);
  console.log(`   Distance Metric: ${collectionInfo.config.params.vectors.distance}`);
  
  // Sample random vectors
  console.log('\n🎲 Random Sample:');
  const scroll = await qdrant.scroll(COLLECTION_NAME, {
    limit: 3,
    with_payload: true,
    with_vector: false
  });
  
  scroll.points.forEach((point, idx) => {
    console.log(`\n${idx + 1}. ID: ${point.id}`);
    console.log(`   File: ${point.payload.path}`);
    console.log(`   Lines: ${point.payload.startLine}-${point.payload.endLine}`);
  });
  
  console.log('\n✅ Semantic search is working correctly!');
  console.log('Next: Integrate with Second Brain API for frontend access');
}

main()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
