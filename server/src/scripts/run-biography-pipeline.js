
/**
 * BIOGRAPHY PIPELINE (Combined Queue + Worker)
 * 1. Scans MongoDB for projects.
 * 2. Adds them to the queue.
 * 3. Starts the worker to process them immediately.
 */

import { Queue, Worker } from 'bullmq';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import IORedis from 'ioredis';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// CONFIG
const CONFIG = {
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain',
  OLLAMA_URL: 'http://localhost:11434',
  MODEL: 'phi3.5',
  CONTEXT_WINDOW: 32768,
  MIN_CONTENT_LENGTH: 15,
  CONCURRENCY: 1, // Run 1 project at a time to avoid Ollama overload
  THERMAL_COOLDOWN: 2000, // 2s sleep between AI calls to prevent GPU overheating
  BATCH_COOLDOWN: 10000, // 10s sleep every 50 items
};

// ============================================================================
// SCHEMAS
// ============================================================================

const RawConversation = mongoose.model(
  'RawConversation',
  new mongoose.Schema({}, { strict: false })
);

const ArchiveSchema = new mongoose.Schema({
  originalId: mongoose.Schema.Types.ObjectId,
  projectName: String,
  sessionId: String,
  sequenceIndex: Number,
  timestamp: Date,
  raw: {
    prompt: String,
    response_summary: String,
    code_files_involved: [String],
  },
  analysis: mongoose.Schema.Types.Mixed, // Allow any structure from AI
});
// Ensure index exists (idempotency)
ArchiveSchema.index({ sessionId: 1, sequenceIndex: 1 }, { unique: true });

// Check if model exists before compiling (hot reload safety)
const NeuralArchive = mongoose.models.NeuralArchive || mongoose.model('NeuralArchive', ArchiveSchema);

// ============================================================================
// UTILS
// ============================================================================

function cleanInput(text) {
  if (!text) return "";
  return text
    .replace(/\[object Object\]/g, "")
    .replace(/```(pnpm-lock\.yaml|yarn\.lock)[\s\S]*?```/g, "[Lockfile Removed]")
    .trim();
}

function extractFileNames(text) {
  const matches = text.match(/[\w\-\/]+\.(js|jsx|ts|tsx|css|html|json|py|go)/g);
  return [...new Set(matches || [])].slice(0, 5);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeWithPhi(prompt, response, prevContext) {
  const cleanPrompt = cleanInput(prompt);
  const cleanResponse = cleanInput(response).substring(0, 500);

  const systemPrompt = `You are a Technical Biographer. Analyze this interaction.
  PREVIOUS CONTEXT: "${prevContext.intent || "Start"}"
  INPUT:
  - User: "${cleanPrompt}"
  - AI: "${cleanResponse}..."
  TASK: Return strict JSON.
  {
    "intent": "Specific goal",
    "scenario": "Context",
    "thought_process": "Infer mental state",
    "tech_context": ["List"],
    "struggle_score": 1-10,
    "is_milestone": true/false,
    "tools_used": ["List"]
  }`;

  try {
    const res = await fetch(`${CONFIG.OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        prompt: systemPrompt,
        format: "json",
        stream: false,
        options: {
          temperature: 0.1,
          num_ctx: CONFIG.CONTEXT_WINDOW,
          num_predict: 500,
        },
      }),
    });
    const data = await res.json();
    return JSON.parse(data.response);
  } catch (e) {
    // console.error("AI Error:", e.message);
    return null;
  }
}

// ============================================================================
// WORKER PROCESSOR
// ============================================================================

async function processProject(job) {
  const { projectName } = job.data;
  console.log(`\n📖 WORKER: Starting biography for "${projectName}"`);

  // 1. Stream Raw Files
  const cursor = RawConversation.find({
    projectName: projectName,
    part: { $lte: 1 }, // Only process first part or unchunked files
  })
    .sort({ importedAt: 1 })
    .cursor();

  let runningContext = { intent: "Start", struggle_score: 0 };
  let processed = 0;
  let skipped = 0;
  let rawCount = 0;

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    rawCount++;
    
    // Reconstruct Exchanges
    let localExchanges = [];

    // Handle VS Code JSON Export (source='file' or 'vscode' with requests array)
    if ((doc.source === "file" || doc.source === "vscode") && doc.content && Array.isArray(doc.content.requests)) {
        const session = doc.content;
        if (session.requests) {
          session.requests.forEach((req) => {
            // Handle message text (can be object or string)
            let promptText = "";
            if (typeof req.message === 'string') {
                promptText = req.message;
            } else if (req.message && req.message.text) {
                promptText = req.message.text;
            }

            // Handle response (can be string or array of tool invocations)
            let responseText = "";
            if (typeof req.response === 'string') {
                responseText = req.response;
            } else if (Array.isArray(req.response)) {
                // Extract text from array if possible, or summarize
                responseText = req.response.map(r => {
                    if (typeof r === 'string') return r;
                    if (r.value) return r.value; // Simple value
                    if (r.invocationMessage?.value) return `[Tool: ${r.invocationMessage.value}]`;
                    return "";
                }).join('\n');
            }

            if (promptText) {
                localExchanges.push({
                  id: doc._id,
                  sessionId: session.sessionId || doc.filePath,
                  timestamp: new Date(req.timestamp || doc.importedAt),
                  prompt: promptText,
                  response: responseText,
                });
            }
          });
        }
    }
    // Handle Kiro / File Format
    else if (doc.source === "file" || doc.source === "kiro") {
      let messages = [];
      
      if (Array.isArray(doc.content)) {
          messages = doc.content;
      } else if (doc.content && Array.isArray(doc.content.chat)) {
          messages = doc.content.chat;
      }

      if (messages.length > 0) {
        let lastUserMsg = null;
        messages.forEach((msg) => {
          if (msg.role === "user") {
            lastUserMsg = msg;
          } else if (msg.role === "assistant" && lastUserMsg) {
            localExchanges.push({
              id: doc._id,
              sessionId: doc.filePath,
              timestamp: new Date(msg.timestamp || doc.importedAt),
              prompt: lastUserMsg.content,
              response: msg.content,
            });
            lastUserMsg = null;
          }
        });
      }
    }
    // Handle VS Code Format (Legacy)
    else if (doc.source === "vscode" && Array.isArray(doc.content)) {
      doc.content.forEach((session) => {
        if (session.requests) {
          session.requests.forEach((req) => {
            localExchanges.push({
              id: doc._id,
              sessionId: session.sessionId || "vscode-legacy",
              timestamp: new Date(req.timestamp || doc.importedAt),
              prompt: req.message,
              response: req.response,
            });
          });
        }
      });
    }

    // Analyze Exchanges
    for (const ex of localExchanges) {
      if (!ex.prompt || ex.prompt.length < CONFIG.MIN_CONTENT_LENGTH) continue;

      const exists = await NeuralArchive.exists({
        sessionId: ex.sessionId,
        timestamp: ex.timestamp,
      });

      if (exists) {
        skipped++;
        continue;
      }

      const analysis = await analyzeWithPhi(ex.prompt, ex.response, runningContext);
      
      // THERMAL PROTECTION
      await sleep(CONFIG.THERMAL_COOLDOWN);
      if (processed % 50 === 0) {
          process.stdout.write(` [❄️ Cooling Down...] `);
          await sleep(CONFIG.BATCH_COOLDOWN);
      }

      if (analysis) {
        runningContext = analysis;
        await NeuralArchive.create({
          originalId: ex.id,
          projectName: projectName,
          sessionId: ex.sessionId,
          sequenceIndex: processed,
          timestamp: ex.timestamp,
          raw: {
            prompt: ex.prompt,
            response_summary: ex.response.substring(0, 200) + "...",
            code_files_involved: extractFileNames(ex.prompt + ex.response),
          },
          analysis: analysis,
        });
        processed++;
        
        // Update Job Progress
        if (processed % 5 === 0) {
            await job.updateProgress({ processed, skipped, rawCount });
            process.stdout.write(`\r   Project: ${projectName.substring(0, 20)} | Analyzed: ${processed} | Skipped: ${skipped}`);
        }
      }
    }
  }

  console.log(`\n✅ WORKER: Finished "${projectName}". Analyzed: ${processed}, Skipped: ${skipped}`);
  return { processed, skipped, rawCount };
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

async function main() {
  console.log("🚀 BIOGRAPHY PIPELINE: Initializing...");
  
  try {
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log("🔌 Connected to MongoDB");

    const connection = new IORedis({
      host: CONFIG.REDIS_HOST,
      port: CONFIG.REDIS_PORT,
      maxRetriesPerRequest: null
    });

    // 1. Setup Queue
    const queue = new Queue('biographer-queue', { connection });
    
    // 2. Populate Queue (Idempotent)
    console.log("📊 Aggregating projects...");
    const projectStats = await RawConversation.aggregate([
      { $group: { _id: "$projectName", count: { $sum: 1 } } },
      { $sort: { count: 1 } } 
    ]);

    console.log(`📋 Found ${projectStats.length} projects.`);
    let added = 0;
    for (const project of projectStats) {
      const name = project._id;
      if (!name || name === 'unknown') continue;

      await queue.add(
        'analyze-project', 
        { projectName: name, fileCount: project.count },
        { jobId: `biography-v2-${name}` } // Force re-run with v2 ID
      );
      added++;
    }
    console.log(`✅ Queue populated with ${added} jobs (v2).`);

    // 3. Start Worker
    console.log("👷 Starting Worker...");
    const worker = new Worker('biographer-queue', processProject, {
      connection,
      concurrency: CONFIG.CONCURRENCY
    });

    worker.on('completed', (job, returnvalue) => {
      console.log(`🎉 Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed: ${err.message}`);
    });

    worker.on('error', (err) => {
        console.error('❌ Worker Error:', err);
    });

    // Keep process alive
    console.log("⏳ Pipeline active. Press Ctrl+C to stop.");

  } catch (e) {
    console.error("❌ Fatal Error:", e);
    process.exit(1);
  }
}

main();
