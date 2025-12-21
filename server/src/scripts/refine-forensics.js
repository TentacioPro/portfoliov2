/**
 * REFINERY PIPELINE: Forensic Analysis of Chat Exchanges
 * 
 * Architecture:
 * - Sequential Processing (Concurrency: 1)
 * - Heuristic Pre-filtering
 * - LLM Analysis (Ollama qwen2.5:1.5b)
 * - Graceful Error Handling
 * - Progress Tracking
 * 
 * Philosophy: "Automation via Verification"
 * - Schema validation before DB write
 * - Atomic updates (no partial states)
 * - Idempotent (safe to re-run)
 */

import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION (The "Immutable" Layer)
// ============================================================================

const CONFIG = {
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  MODEL: 'qwen2.5:1.5b', // Optimized for JSON output
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/secondbrain',
  BATCH_SIZE: 1, // Sequential processing
  PROGRESS_INTERVAL: 10, // Log every N documents
};

// Struggle detection keywords
const STRUGGLE_KEYWORDS = [
  'error', 'fail', 'failed', 'wrong', 'broken', 
  'issue', 'problem', 'crash', 'bug', 'exception'
];

// ============================================================================
// MONGOOSE SCHEMA (Verification First)
// ============================================================================

const ConversationSchema = new mongoose.Schema({
  projectName: String,
  workspaceId: String,
  projectPath: String,
  techStack: [String],
  conversations: [{
    sessionId: String,
    timestamp: Date,
    exchanges: [{
      prompt: String,
      response: String,
      timestamp: Date,
      toolsUsed: [String],
      filesEditedCount: Number,
      modelUsed: String
    }]
  }],
  totalExchanges: Number,
  firstChatDate: Date,
  lastChatDate: Date,
  extractedAt: Date,
  
  // NEW: Analysis field
  analysis: {
    intent: String,
    tech_stack: [String],
    difficulty_score: Number,
    summary: String,
    struggle_heuristic: Boolean,
    processed_at: Date
  }
}, { strict: false });

const Conversation = mongoose.model('Conversation', ConversationSchema);

// ============================================================================
// CORE LOGIC (Atomic Functions)
// ============================================================================

/**
 * Extract first 3 exchanges from conversation
 * @param {Object} doc - MongoDB document
 * @returns {string} - Combined text for analysis
 */
function extractContext(doc) {
  const exchanges = [];
  
  for (const conversation of doc.conversations || []) {
    for (const exchange of conversation.exchanges || []) {
      exchanges.push(exchange);
      if (exchanges.length >= 3) break;
    }
    if (exchanges.length >= 3) break;
  }
  
  return exchanges
    .map(ex => `USER: ${ex.prompt || ''}\nAI: ${ex.response || ''}`)
    .join('\n\n')
    .substring(0, 4000); // Limit context window
}

/**
 * Heuristic Struggle Detection
 * @param {string} text - User text to analyze
 * @returns {boolean} - True if struggle indicators detected
 */
function detectStruggle(text) {
  const lowerText = text.toLowerCase();
  let count = 0;
  
  for (const keyword of STRUGGLE_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    count += matches ? matches.length : 0;
  }
  
  return count > 3;
}

/**
 * Call Ollama API for Forensic Analysis
 * @param {string} context - Chat context
 * @returns {Promise<Object|null>} - Analysis result or null on failure
 */
async function analyzeLLM(context) {
  const systemPrompt = `You are a Forensic Code Analyst. Analyze this developer chat conversation.

TASK: Extract structured metadata from the conversation.

RULES:
1. Return ONLY valid JSON (no markdown, no explanations)
2. Use this EXACT schema:
{
  "intent": "brief description of developer's goal (max 100 chars)",
  "tech_stack": ["technology1", "technology2"],
  "difficulty_score": 1-10 (1=trivial, 10=extremely complex),
  "summary": "one sentence summary (max 200 chars)"
}

3. If unclear, use "unknown" for intent, empty array for tech_stack, 5 for difficulty_score
4. Focus on WHAT the developer is trying to build, not syntax errors`;

  const userPrompt = `Analyze this chat:\n\n${context}`;

  try {
    const response = await fetch(`${CONFIG.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        prompt: userPrompt,
        system: systemPrompt,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.0, // Deterministic
          num_ctx: 2048,
          repeat_penalty: 1.1,
          top_k: 10,
          top_p: 0.1
        }
      }),
      timeout: 60000 // 60 second timeout
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the response (Ollama returns JSON as string in 'response' field)
    const result = JSON.parse(data.response);
    
    // Validate schema
    if (!result.intent || !Array.isArray(result.tech_stack) || 
        typeof result.difficulty_score !== 'number' || !result.summary) {
      throw new Error('Invalid schema from LLM');
    }
    
    return result;
    
  } catch (error) {
    console.error(`   ❌ LLM Error: ${error.message}`);
    return null;
  }
}

/**
 * Process Single Document
 * @param {Object} doc - MongoDB document
 * @returns {Promise<boolean>} - True if successful
 */
async function processDocument(doc) {
  try {
    // 1. Extract context
    const context = extractContext(doc);
    
    if (!context || context.trim().length < 50) {
      console.log(`   ⚠️  Skipped: Insufficient content`);
      return false;
    }
    
    // 2. Heuristic check
    const struggleDetected = detectStruggle(context);
    
    // 3. LLM analysis
    const llmResult = await analyzeLLM(context);
    
    if (!llmResult) {
      return false;
    }
    
    // 4. Update document (Atomic operation)
    await Conversation.updateOne(
      { _id: doc._id },
      {
        $set: {
          analysis: {
            intent: llmResult.intent,
            tech_stack: llmResult.tech_stack,
            difficulty_score: llmResult.difficulty_score,
            summary: llmResult.summary,
            struggle_heuristic: struggleDetected,
            processed_at: new Date()
          }
        }
      }
    );
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Processing Error: ${error.message}`);
    return false;
  }
}

/**
 * Display Progress Bar
 * @param {number} current - Current progress
 * @param {number} total - Total items
 * @param {number} succeeded - Success count
 * @param {number} failed - Failure count
 */
function logProgress(current, total, succeeded, failed) {
  const percent = ((current / total) * 100).toFixed(1);
  const barLength = 40;
  const filled = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  process.stdout.write(
    `\r[${bar}] ${percent}% | Processed: ${current}/${total} | ✅ ${succeeded} | ❌ ${failed}`
  );
}

/**
 * Main Refinery Pipeline
 */
async function main() {
  console.log('═'.repeat(80));
  console.log('🔥 REFINERY PIPELINE: Forensic Analysis Engine');
  console.log('═'.repeat(80));
  console.log(`📦 Model: ${CONFIG.MODEL}`);
  console.log(`🔗 Ollama: ${CONFIG.OLLAMA_URL}`);
  console.log(`🗄️  Database: ${CONFIG.MONGODB_URI}`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('✅ MongoDB: Connected\n');

    // 2. Test Ollama connection
    try {
      const testResponse = await fetch(`${CONFIG.OLLAMA_URL}/api/version`);
      if (!testResponse.ok) throw new Error('Connection failed');
      console.log('✅ Ollama: Connected\n');
    } catch (error) {
      console.error('❌ Ollama: Connection failed');
      console.error('💡 Hint: Run `docker-compose up -d ollama` and pull model:');
      console.error(`   docker exec secondbrain-ollama ollama pull ${CONFIG.MODEL}`);
      process.exit(1);
    }

    // 3. Count unanalyzed documents
    const totalDocs = await Conversation.countDocuments({ 
      'analysis.processed_at': { $exists: false }
    });
    
    console.log(`📊 Found ${totalDocs} unanalyzed conversations\n`);
    
    if (totalDocs === 0) {
      console.log('✨ All documents already analyzed!');
      process.exit(0);
    }

    // 4. Process documents sequentially
    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    
    console.log('🚀 Starting analysis...\n');
    
    // Process in small batches for memory efficiency
    const batchSize = 50;
    
    while (processed < totalDocs) {
      const batch = await Conversation.find({ 
        'analysis.processed_at': { $exists: false }
      })
      .limit(batchSize)
      .lean(); // Use lean() for better performance
      
      if (batch.length === 0) break;
      
      for (const doc of batch) {
        const projectName = doc.projectName || 'Unknown';
        
        // Show current document being processed
        if (processed % CONFIG.PROGRESS_INTERVAL === 0 && processed > 0) {
          console.log(`\n📝 [${projectName}]`);
        }
        
        const success = await processDocument(doc);
        
        if (success) {
          succeeded++;
        } else {
          failed++;
        }
        
        processed++;
        
        // Update progress bar
        logProgress(processed, totalDocs, succeeded, failed);
      }
    }
    
    // 5. Final Report
    console.log('\n\n' + '═'.repeat(80));
    console.log('✨ REFINERY COMPLETE');
    console.log('═'.repeat(80));
    console.log(`📊 Final Statistics:`);
    console.log(`   Total Processed:  ${processed}`);
    console.log(`   ✅ Succeeded:      ${succeeded} (${((succeeded / processed) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Failed:         ${failed} (${((failed / processed) * 100).toFixed(1)}%)`);
    console.log('═'.repeat(80));
    
    // 6. Verify results
    const analyzedCount = await Conversation.countDocuments({ 
      'analysis.processed_at': { $exists: true }
    });
    console.log(`\n🔍 Verification: ${analyzedCount} documents now have analysis data`);
    
  } catch (error) {
    console.error('\n💥 Pipeline Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB: Disconnected');
  }
}

// ============================================================================
// EXECUTION
// ============================================================================

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Process interrupted. Cleaning up...');
  await mongoose.disconnect();
  process.exit(0);
});

main();