/**
 * CLOUD BIOGRAPHER (Gemini 3 Vertex Edition)
 * Uses: @google-cloud/vertexai (Required for Gemini 3 Preview)
 * Auth: Requires 'gcloud auth application-default login'
 */

import mongoose from 'mongoose';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pLimit from 'p-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// CONFIG
const CONFIG = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain',
  // Your Project ID from the screenshot
  PROJECT_ID: process.env.GCP_PROJECT_ID || 'maaxly-deploy-trial', 
  LOCATION: process.env.GCP_LOCATION || 'us-central1',
  // The EXACT Model ID for Gemini 3 Flash Preview
  MODEL_NAME: 'gemini-3-flash-preview', 
  CONCURRENCY: 20, // Gemini 3 Flash is built for high throughput
};

if (!CONFIG.PROJECT_ID) {
    console.error("❌ ERROR: GCP_PROJECT_ID is missing in .env");
    console.error("   (It should be 'maaxly-deploy-trial' based on your screenshot)");
    process.exit(1);
}

// ============================================================================
// VERTEX AI SETUP
// ============================================================================
const vertexAI = new VertexAI({ project: CONFIG.PROJECT_ID, location: CONFIG.LOCATION });
const model = vertexAI.getGenerativeModel({ 
    model: CONFIG.MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json"
    }
});

// ============================================================================
// SCHEMAS
// ============================================================================
const RawConversation = mongoose.models.RawConversation || mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }), 'rawconversations');

const NeuralArchiveSchema = new mongoose.Schema({
  originalId: mongoose.Schema.Types.ObjectId,
  projectName: String,
  sessionId: String,
  sequenceIndex: Number,
  timestamp: { type: Date, default: Date.now },
  analysis: {
    intent: String,
    scenario: String,
    thought_process: String,
    tech_context: [String],
    struggle_score: Number,
    is_milestone: Boolean,
    tools_used: [String]
  },
  raw: { prompt: String, response_summary: String }
});
NeuralArchiveSchema.index({ originalId: 1 }, { unique: true });
const NeuralArchive = mongoose.models.NeuralArchive || mongoose.model('NeuralArchive', NeuralArchiveSchema, 'neuralarchives');

// ============================================================================
// ANALYSIS WORKER
// ============================================================================
async function analyzeWithGemini3(prompt, response, prevIntent) {
  const cleanPrompt = (prompt || "").substring(0, 50000); // 1M Token Window!
  const cleanResponse = (response || "").substring(0, 10000);

  const userMsg = `
    Analyze this developer chat log.
    Context: ${prevIntent}
    
    User: ${cleanPrompt}
    AI: ${cleanResponse}
    
    Return strict JSON:
    {
      "intent": "Brief goal",
      "scenario": "Debugging/Refactoring/Learning",
      "thought_process": "Infer mental state",
      "tech_context": ["List technologies"],
      "struggle_score": 1-10,
      "is_milestone": boolean,
      "tools_used": ["List tools"]
    }
  `;

  try {
    const result = await model.generateContent(userMsg);
    const responseObj = await result.response;
    const text = responseObj.candidates[0].content.parts[0].text;
    
    // Clean potential markdown wrapping
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    // 429 = Quota Limit (Vertex has higher quotas, but still possible)
    if (e.message.includes('429')) return 'RATE_LIMIT';
    console.error(`Gemini 3 Error: ${e.message}`);
    return null;
  }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================
async function main() {
  await mongoose.connect(CONFIG.MONGO_URI);
  
  // --- IDEMPOTENCY STATUS REPORT ---
  const totalRaw = await RawConversation.countDocuments();
  const processedCount = await RawConversation.countDocuments({ processed: true });
  const pendingCount = totalRaw - processedCount;
  const archivesCount = await NeuralArchive.countDocuments();
  
  console.log('\n📊 STATUS REPORT:');
  console.log(`   Raw Documents:     ${totalRaw}`);
  console.log(`   Already Processed: ${processedCount}`);
  console.log(`   Pending Analysis:  ${pendingCount}`);
  console.log(`   Neural Archives:   ${archivesCount}`);
  
  if (pendingCount === 0) {
    console.log('\n✅ All documents already processed. Nothing to do.');
    process.exit(0);
  }
  
  console.log(`\n🚀 GEMINI 3 FLASH BIOGRAPHER ACTIVE`);
  console.log(`   Project: ${CONFIG.PROJECT_ID}`);
  console.log(`   Model:   ${CONFIG.MODEL_NAME}`);
  console.log(`   Processing ${pendingCount} documents...\n`);

  // Using cursor for memory efficiency
  const cursor = RawConversation.find({ processed: { $ne: true } }).cursor();
  const limit = pLimit(CONFIG.CONCURRENCY);
  
  let newlyProcessed = 0;
  let tasks = [];

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    const task = limit(async () => {
        // Extraction Logic
        const content = doc.data || doc;
        let promptText = "";
        
        if (content.content && typeof content.content === 'string') promptText = content.content;
        else if (content.prompt) promptText = content.prompt;
        else if (content.requests && content.requests[0]) promptText = JSON.stringify(content.requests[0]);
        else promptText = JSON.stringify(content).substring(0, 5000);

        if (!promptText || promptText.length < 5) {
             await RawConversation.updateOne({ _id: doc._id }, { $set: { processed: true } });
             return;
        }

        // Call Gemini 3
        const analysis = await analyzeWithGemini3(promptText, "", "Stream");

        if (analysis === 'RATE_LIMIT') {
             console.log("⏳ Throttling...");
             await new Promise(r => setTimeout(r, 5000));
             return; 
        }

        if (analysis) {
            try {
                await NeuralArchive.create({
                    originalId: doc._id,
                    projectName: doc.projectName || "Unknown",
                    sessionId: doc.filePath || "Unknown",
                    timestamp: doc.timestamp || new Date(),
                    analysis: analysis,
                    raw: { prompt: promptText.substring(0, 1000), response_summary: "Gemini 3 Analysis" }
                });
                await RawConversation.updateOne({ _id: doc._id }, { $set: { processed: true } });
                newlyProcessed++;
                if (newlyProcessed % 10 === 0) process.stdout.write(`\r✅ Analyzed: ${newlyProcessed}`);
            } catch (err) {
                if (err.code !== 11000) console.error(`DB Error: ${err.message}`);
            }
        }
    });

    tasks.push(task);
    if (tasks.length >= 50) {
        await Promise.all(tasks);
        tasks = [];
    }
  }

  await Promise.all(tasks);
  
  // Final status
  const finalArchives = await NeuralArchive.countDocuments();
  console.log(`\n🎉 DONE.`);
  console.log(`   New Archives Created: ${newlyProcessed}`);
  console.log(`   Total Archives Now:   ${finalArchives}`);
  
  await mongoose.disconnect();
  process.exit(0);
}

// Only run if called directly
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectRun) {
  main();
}

export { main as runArchiver };