/**
 * DEEP DIVE FORENSICS ENGINE V2
 * Features: Smart Context Window, Idempotency, Noise Filtering
 */

import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  OLLAMA_URL: 'http://localhost:11434',
  MODEL: 'qwen2.5:1.5b',
  MONGODB_URI: 'mongodb://localhost:27017/secondbrain',
  CONTEXT_SIZE: 8192, // Increased from 2048 to 8k
};

// ============================================================================
// SCHEMAS
// ============================================================================

const DeepDiveSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  projectName: String,
  sessionId: String,
  messageId: String, // NEW: Unique ID for idempotency
  timestamp: Date,
  original_prompt: String,
  analysis: {
    intent: String,
    tech_stack: [String],
    thought_process: String,
    scenario: String,
    is_debugging: Boolean,
    struggle_score: Number,
    tools_called: [String] // Added based on your request
  }
});
// Composite index to prevent duplicates
DeepDiveSchema.index({ sessionId: 1, messageId: 1 }, { unique: true });

const DeepDiveLog = mongoose.model('DeepDiveLog', DeepDiveSchema);
const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));

// ============================================================================
// SMART CONTEXT FILTER
// ============================================================================

function cleanPrompt(text) {
  if (!text) return "";
  
  // 1. Remove Lockfiles and heavy noise
  let cleaned = text.replace(/```(pnpm-lock\.yaml|yarn\.lock|package-lock\.json)[\s\S]*?```/g, '[Lockfile Skipped for Context]');
  
  // 2. Truncate massive middle parts of generic code blocks if > 4000 chars
  // This keeps the headers and the errors at the bottom
  if (cleaned.length > 6000) {
    const start = cleaned.substring(0, 3000);
    const end = cleaned.substring(cleaned.length - 3000);
    cleaned = `${start}\n\n... [SNIPPED ${cleaned.length - 6000} CHARS OF CODE] ...\n\n${end}`;
  }
  
  return cleaned;
}

// ============================================================================
// AI ANALYST
// ============================================================================

async function analyzeExchange(prompt, responseSnippet, prevContext) {
  const cleanInput = cleanPrompt(prompt);
  
  const systemPrompt = `You are a Senior Forensic Software Architect. 
  Reconstruct the developer's thought process based on this interaction.
  
  PREVIOUS CONTEXT: ${prevContext}

  OUTPUT FORMAT (Strict JSON):
  {
    "intent": "The exact technical goal (e.g. 'Fixing cloudbuild.yaml memory limit')",
    "tech_stack": ["List", "Specific", "Libs"],
    "thought_process": "Infer the developer's mental state. (e.g. 'Developer realized 512MiB was insufficient for build')",
    "scenario": "The Coding Scenario (e.g. DevOps Configuration)",
    "is_debugging": true/false,
    "struggle_score": 1-10 (1=Flow, 10=Hell),
    "tools_called": ["List tools if seen in prompt, else empty"]
  }`;

  const userPayload = `USER PROMPT:\n${cleanInput}\n\nAI RESPONSE SUMMARY:\n${responseSnippet}`;

  try {
    const res = await fetch(`${CONFIG.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        prompt: userPayload,
        system: systemPrompt,
        format: 'json',
        stream: false,
        options: { 
          temperature: 0.1, 
          num_ctx: CONFIG.CONTEXT_SIZE, // CRITICAL FIX
          num_predict: 500
        }
      })
    });
    
    const data = await res.json();
    return JSON.parse(data.response);
  } catch (e) {
    console.error("  ❌ LLM Error:", e.message);
    return null;
  }
}

// ============================================================================
// MAIN LOOP
// ============================================================================

async function main() {
  console.log(`🔥 DEEP DIVE V2 ONLINE | Context: ${CONFIG.CONTEXT_SIZE} tokens`);
  await mongoose.connect(CONFIG.MONGODB_URI);

  const cursor = Conversation.find({ 'conversations.exchanges': { $exists: true, $not: { $size: 0 } } }).cursor();
  
  let processed = 0;
  let skipped = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    
    // Sort chronological
    const sortedSessions = (doc.conversations || []).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (const session of sortedSessions) {
      let runningContext = "Start of Project Session";

      for (const exchange of session.exchanges) {
        // IDEMPOTENCY CHECK
        // We use prompt content hash or ID if available. Assuming exchange._id exists or we create a signature.
        const msgSignature = exchange._id ? exchange._id.toString() : session.sessionId + "_" + exchange.timestamp;
        
        const exists = await DeepDiveLog.exists({ sessionId: session.sessionId, messageId: msgSignature });
        
        if (exists) {
          skipped++;
          process.stdout.write('.'); // Dot for skip
          continue;
        }

        if (!exchange.prompt) continue;

        console.log(`\n🔍 Analyzing: [${doc.projectName}] ${exchange.prompt.substring(0, 50).replace(/\n/g, ' ')}...`);

        const analysis = await analyzeExchange(exchange.prompt, exchange.response || "", runningContext);

        if (analysis) {
          runningContext = analysis.intent; // Update context for next turn

          await DeepDiveLog.create({
            projectId: doc._id,
            projectName: doc.projectName,
            sessionId: session.sessionId,
            messageId: msgSignature,
            timestamp: exchange.timestamp || new Date(),
            original_prompt: exchange.prompt,
            analysis: analysis
          });

          const status = analysis.is_debugging ? "🐞 DEBUG" : "⚡ FLOW";
          console.log(`   ${status} [Score: ${analysis.struggle_score}] ${analysis.intent}`);
          processed++;
        }
      }
    }
  }

  console.log(`\n✨ COMPLETE. Processed: ${processed}, Skipped (Already Done): ${skipped}`);
  process.exit(0);
}

main().catch(console.error);