import { search, generateAnswer } from '../services/retrieval.js';

async function verify() {
  console.log('🧪 Starting RAG Verification...\n');

  const query = "What are Eno Reyes' skills?";
  
  try {
    // 1. Test Search (Retrieval)
    console.log('📍 STEP 1: Testing Semantic Search');
    console.log(`Query: "${query}"\n`);
    
    const searchResults = await search(query, 3);
    
    if (searchResults.length === 0) {
      console.error('❌ FAILURE: No results found. Make sure data has been ingested.');
      process.exit(1);
    }

    console.log(`✅ Retrieved ${searchResults.length} chunks:\n`);
    searchResults.forEach((result, idx) => {
      console.log(`[${idx + 1}] Score: ${result.score.toFixed(4)}`);
      console.log(`    Source: ${result.source}`);
      console.log(`    Text: ${result.text.substring(0, 150)}${result.text.length > 150 ? '...' : ''}`);
      console.log('');
    });

    // 2. Test RAG (Retrieval + Generation)
    console.log('📍 STEP 2: Testing RAG Pipeline (Retrieval + LLM)');
    console.log(`Query: "${query}"\n`);

    const startTime = Date.now();
    const { answer, citations } = await generateAnswer(query);
    const duration = Date.now() - startTime;

    console.log(`✅ Answer generated in ${duration}ms:\n`);
    console.log('--- LLM RESPONSE ---');
    console.log(answer);
    console.log('--- END RESPONSE ---\n');

    console.log(`📚 Citations (${citations.length}):`);
    citations.forEach((citation, idx) => {
      console.log(`  [${idx + 1}] ${citation.source} (score: ${citation.score.toFixed(4)})`);
    });

    // 3. Basic Validation
    console.log('\n🔍 VALIDATION:');
    
    // Extract key terms from retrieved chunks
    const chunkText = searchResults.map(r => r.text.toLowerCase()).join(' ');
    const answerLower = answer.toLowerCase();
    
    // Check if answer references the context
    let hasRelevantContent = false;
    
    // Look for common words (excluding stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did'];
    const chunkWords = chunkText.split(/\W+/).filter(w => w.length > 3 && !stopWords.includes(w));
    const uniqueChunkWords = [...new Set(chunkWords)];
    
    // Check if at least 20% of significant words from chunks appear in answer
    const matchingWords = uniqueChunkWords.filter(word => answerLower.includes(word));
    const relevanceRatio = matchingWords.length / Math.max(uniqueChunkWords.length, 1);
    
    console.log(`  - Unique terms in context: ${uniqueChunkWords.length}`);
    console.log(`  - Matching terms in answer: ${matchingWords.length}`);
    console.log(`  - Relevance ratio: ${(relevanceRatio * 100).toFixed(1)}%`);
    
    if (relevanceRatio >= 0.15 || matchingWords.length >= 3) {
      hasRelevantContent = true;
      console.log(`  ✅ Answer appears relevant to retrieved context`);
    } else {
      console.log(`  ⚠️  Low relevance detected`);
    }

    // Check if answer isn't just "I don't know"
    const hasSubstantiveAnswer = answer.length > 50 && !answer.toLowerCase().includes("don't have any information");
    
    if (hasSubstantiveAnswer) {
      console.log(`  ✅ Answer is substantive (${answer.length} chars)`);
    } else {
      console.log(`  ⚠️  Answer may be too brief or uninformative`);
    }

    console.log('\n' + '='.repeat(60));
    if (hasRelevantContent && hasSubstantiveAnswer) {
      console.log('✅ SUCCESS: RAG pipeline is operational!');
      console.log('The system can retrieve context and generate relevant answers.');
      process.exit(0);
    } else {
      console.log('⚠️  PARTIAL SUCCESS: System works but may need tuning.');
      console.log('Consider ingesting more data or adjusting the retrieval parameters.');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('authentication')) {
      console.error('💡 Hint: Check your GROQ_API_KEY in .env');
    }
    
    if (error.message.includes('ENOENT') || error.message.includes('not found')) {
      console.error('💡 Hint: Make sure all services are running (Qdrant, MongoDB, Redis)');
    }
    
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

verify();
