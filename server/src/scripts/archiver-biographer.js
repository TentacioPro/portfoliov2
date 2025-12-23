/**
 * NEURAL BIOGRAPHER (Streaming Edition)
 * Optimized for massive datasets (10k+ files) without OOM errors.
 */

import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

// CONFIG
const CONFIG = {
  OLLAMA_URL: "http://localhost:11434",
  MODEL: "phi3.5",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/secondbrain",
  CONTEXT_WINDOW: 32768,
  MIN_CONTENT_LENGTH: 15,
};

// SCHEMAS
const RawConversation = mongoose.model(
  "RawConversation",
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
  analysis: {
    intent: String,
    scenario: String,
    thought_process: String,
    tech_context: [String],
    struggle_score: Number,
    is_milestone: Boolean,
    tools_used: [String],
  },
});
ArchiveSchema.index({ sessionId: 1, sequenceIndex: 1 }, { unique: true });
const NeuralArchive = mongoose.model("NeuralArchive", ArchiveSchema);

// UTILS
function cleanInput(text) {
  if (!text) return "";
  return text
    .replace(/\[object Object\]/g, "")
    .replace(
      /```(pnpm-lock\.yaml|yarn\.lock)[\s\S]*?```/g,
      "[Lockfile Removed]"
    )
    .trim();
}

function extractFileNames(text) {
  const matches = text.match(/[\w\-\/]+\.(js|jsx|ts|tsx|css|html|json|py|go)/g);
  return [...new Set(matches || [])].slice(0, 5);
}

// AI ANALYST
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
    return null;
  }
}

// MAIN
async function main() {
  // Increase memory limit for this process just in case, though streaming fixes the root cause
  if (global.gc) {
    global.gc();
  }

  const targetProjectName = process.argv[2];
  if (!targetProjectName) {
    console.error('❌ Usage: node script.js "PROJECT NAME"');
    process.exit(1);
  }

  await mongoose.connect(CONFIG.MONGO_URI);
  console.log(`📖 BIOGRAPHER: Streaming "${targetProjectName}"`);

  // 1. STREAM RAW FILES (Don't load all at once)
  // We sort by importedAt to try and maintain some file-system order
  const cursor = RawConversation.find({
    projectName: targetProjectName,
    part: { $lte: 1 },
  })
    .sort({ importedAt: 1 })
    .cursor();

  let runningContext = { intent: "Start", struggle_score: 0 };
  let processed = 0;
  let skipped = 0;
  let rawCount = 0;

  console.log("🌊 Stream opened. Processing events...");

  // 2. Process Stream
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    rawCount++;

    // DEBUG: Force print first 3 docs
    if (rawCount <= 3) {
        console.log(`[DEBUG] Doc #${rawCount}: Source=${doc.source}, File=${doc.filePath}`);
        if (doc.content) {
             console.log(`[DEBUG] Content Type: ${typeof doc.content}, IsArray: ${Array.isArray(doc.content)}`);
             if (!Array.isArray(doc.content)) {
                 console.log(`[DEBUG] Content Keys: ${Object.keys(doc.content)}`);
                 if (doc.content.chat) {
                     console.log(`[DEBUG] Has .chat: IsArray=${Array.isArray(doc.content.chat)}, Length=${doc.content.chat.length}`);
                 }
             }
        }
    }

    // Reconstruct Exchanges from this SINGLE document
    let localExchanges = [];

    // Handle Kiro / File Format
    if (doc.source === "file" || doc.source === "kiro") {
      let messages = [];
      
      // Case 1: Content is the array of messages directly (Legacy/Generic JSON)
      if (Array.isArray(doc.content)) {
          messages = doc.content;
      } 
      // Case 2: Kiro Structure (Content is object, messages in .chat)
      else if (doc.content && Array.isArray(doc.content.chat)) {
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
    // Handle VS Code Format
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

    // 3. Analyze local exchanges immediately
    for (const ex of localExchanges) {
      if (!ex.prompt || ex.prompt.length < CONFIG.MIN_CONTENT_LENGTH) continue;

      // Idempotency Check (Fast)
      // We assume sequenceIndex based on timestamp isn't perfect across files,
      // so we use a composite of sessionId + timestamp to check existence
      const exists = await NeuralArchive.exists({
        sessionId: ex.sessionId,
        timestamp: ex.timestamp,
      });

      if (exists) {
        skipped++;
        continue;
      }

      // AI Analysis
      const analysis = await analyzeWithPhi(ex.prompt, ex.response, runningContext);
      
      if (analysis) {
        runningContext = analysis; // Update context for next turn

        await NeuralArchive.create({
          originalId: ex.id,
          projectName: targetProjectName,
          sessionId: ex.sessionId,
          sequenceIndex: processed, // Global sequence for this project
          timestamp: ex.timestamp,
          raw: {
            prompt: ex.prompt,
            response_summary: ex.response.substring(0, 200) + "...",
            code_files_involved: extractFileNames(ex.prompt + ex.response),
          },
          analysis: analysis,
        });

        processed++;
        process.stdout.write(`\r✅ Analyzed: ${processed} | Skipped: ${skipped} | Raw Files: ${rawCount}`);
      }
    }
  }

  console.log(`\n\n✅ BIOGRAPHY COMPLETE.`);
  console.log(`   Files Streamed: ${rawCount}`);
  console.log(`   Events Analyzed: ${processed}`);
  console.log(`   Already Existed: ${skipped}`);

  process.exit(0);
}

main();
