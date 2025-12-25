import { embeddingService } from '../services/embedding.js';

async function verify() {
  console.log('🧪 Starting Embedding Verification...');
  
  const text = "Hello World";
  
  try {
    const start = Date.now();
    const vector = await embeddingService.getEmbedding(text);
    const duration = Date.now() - start;

    console.log(`✅ Embedding generated in ${duration}ms`);
    console.log(`📏 Vector Length: ${vector.length}`);
    
    if (vector.length === 384) {
      console.log('SUCCESS: Vector dimension matches MiniLM-L6-v2 spec (384).');
      process.exit(0);
    } else {
      console.error(`FAILURE: Expected 384 dimensions, got ${vector.length}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification Failed:', error);
    process.exit(1);
  }
}

verify();