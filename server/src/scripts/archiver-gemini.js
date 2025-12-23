/**
 * NEURAL BIOGRAPHER (Gemini Edition)
 * - Streams raw conversations from MongoDB
 * - Extracts exchanges (KIRO/.chat + VS Code formats)
 * - Analyzes each exchange with Gemini (gemini-1.5-flash)
 * - Writes structured biographies to neuralarchives
 *
 * Run:
 *   node server/src/scripts/archiver-gemini.js "globalStorage"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import pLimit from 'p-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ============================================================================
// CONFIG
// ============================================================================

const CONFIG = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  MODEL: 'gemini-1.5-flash',
  CONCURRENCY: 15,

  // Safety limits (to reduce token blow-ups on giant logs)
  MIN_CONTENT_LENGTH: 10,
  MAX_PROMPT_CHARS: 12000,
  MAX_RESPONSE_CHARS: 12000,

  // Retry
  MAX_RETRIES: 6,
  BASE_BACKOFF_MS: 800,
  MAX_BACKOFF_MS: 20000,

  // Cursor batch size (streaming)
  CURSOR_BATCH_SIZE: 50,
};

// ============================================================================
// SCHEMAS / MODELS
// ============================================================================

// Source: rawconversations
const RawConversation = mongoose.models.RawConversation
  || mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }));

// Target: neuralarchives (EXACT schema as requested)
const NeuralArchiveSchema = new mongoose.Schema(
  {
    originalId: mongoose.Schema.Types.ObjectId, // Link to raw doc
    projectName: String,
    sessionId: String,
    sequenceIndex: Number, // Order of the chat
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
      soft_skills: [String],
    },
  },
  { timestamps: false }
);

// Idempotency: unique per session+timestamp (stable across re-runs even if ordering changes)
NeuralArchiveSchema.index({ sessionId: 1, timestamp: 1 }, { unique: true });

const NeuralArchive = mongoose.models.NeuralArchive
  || mongoose.model('NeuralArchive', NeuralArchiveSchema);

// ============================================================================
// UTILS
// ============================================================================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function clampText(s, maxChars) {
  if (!s) return '';
  const str = typeof s === 'string' ? s : JSON.stringify(s);
  return str.length > maxChars ? str.slice(0, maxChars) : str;
}

function cleanInput(text) {
  if (!text) return '';
  return String(text)
    .replace(/\[object Object\]/g, '')
    .replace(/```(pnpm-lock\.yaml|yarn\.lock)[\s\S]*?```/g, '[Lockfile Removed]')
    .trim();
}

function extractFileNames(text) {
  const matches = String(text || '').match(/[\w\-./]+\.(js|jsx|ts|tsx|css|html|json|py|go|java|cs|rs|rb|php|sql|yml|yaml|md)/g);
  return [...new Set(matches || [])].slice(0, 10);
}

function looksLikeRateLimit(err) {
  const msg = (err?.message || '').toLowerCase();
  const status = err?.status || err?.statusCode;
  return status === 429 || msg.includes('429') || msg.includes('rate') || msg.includes('resource_exhausted');
}

function looksTransient(err) {
  const status = err?.status || err?.statusCode;
  if (!status) return false;
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
}

function extractFirstJsonObject(text) {
  if (!text) return null;

  // If it's already valid JSON
  try {
    return JSON.parse(text);
  } catch {
    // continue
  }

  // Try to locate first {...} block
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function normalizeAnalysis(obj) {
  const a = obj && typeof obj === 'object' ? obj : {};

  const tech = Array.isArray(a.tech_context) ? a.tech_context : (Array.isArray(a.tech_stack) ? a.tech_stack : []);
  const tools = Array.isArray(a.tools_used) ? a.tools_used : (Array.isArray(a.tools_called) ? a.tools_called : []);
  const soft = Array.isArray(a.soft_skills) ? a.soft_skills : [];

  let struggle = a.struggle_score;
  if (typeof struggle !== 'number') {
    // common alternates
    if (typeof a.difficulty_score === 'number') struggle = a.difficulty_score;
    else struggle = 5;
  }
  struggle = Math.max(1, Math.min(10, Math.round(struggle)));

  const isMilestone =
    typeof a.is_milestone === 'boolean'
      ? a.is_milestone
      : (typeof a.milestone === 'boolean' ? a.milestone : false);

  return {
    intent: typeof a.intent === 'string' && a.intent.trim() ? a.intent.trim() : 'unknown',
    scenario: typeof a.scenario === 'string' && a.scenario.trim() ? a.scenario.trim() : 'unknown',
    thought_process: typeof a.thought_process === 'string' ? a.thought_process.trim() : '',
    tech_context: tech.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()).slice(0, 20),
    struggle_score: struggle,
    is_milestone: isMilestone,
    tools_used: tools.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()).slice(0, 20),
    soft_skills: soft.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()).slice(0, 20),
  };
}

// ============================================================================
// PARSING LOGIC (Critical) - as requested
// ============================================================================

function extractExchangesFromDoc(doc) {
  let exchanges = [];

  // 1. Handle Kiro / File Format (.chat JSON)
  if ((doc.source === 'file' || doc.source === 'kiro') && Array.isArray(doc.content)) {
    let lastUserMsg = null;
    doc.content.forEach((msg) => {
      if (msg.role === 'user') lastUserMsg = msg;
      else if (msg.role === 'assistant' && lastUserMsg) {
        exchanges.push({
          sessionId: doc.filePath,
          timestamp: new Date(msg.timestamp || doc.importedAt),
          prompt: lastUserMsg.content,
          response: msg.content,
        });
        lastUserMsg = null;
      }
    });
  }
  // 2. Handle VS Code Format
  else if (doc.source === 'vscode' && Array.isArray(doc.content)) {
    doc.content.forEach((session) => {
      if (session.requests) {
        session.requests.forEach((req) => {
          exchanges.push({
            sessionId: session.sessionId,
            timestamp: new Date(req.timestamp || doc.importedAt),
            prompt: req.message,
            response: req.response,
          });
        });
      }
    });
  }

  // Robustness: tolerate known variants observed elsewhere in this repo
  // - VS Code JSON export where doc.content is an object with .requests
  // - KIRO structure where doc.content is an object with .chat
  if (exchanges.length === 0) {
    // VS Code: { requests: [...] }
    if ((doc.source === 'file' || doc.source === 'vscode') && doc.content && Array.isArray(doc.content.requests)) {
      const session = doc.content;
      session.requests.forEach((req) => {
        let promptText = '';
        if (typeof req.message === 'string') promptText = req.message;
        else if (req.message && typeof req.message.text === 'string') promptText = req.message.text;

        let responseText = '';
        if (typeof req.response === 'string') responseText = req.response;
        else if (Array.isArray(req.response)) {
          responseText = req.response
            .map((r) => {
              if (typeof r === 'string') return r;
              if (r?.value) return r.value;
              if (r?.invocationMessage?.value) return `[Tool: ${r.invocationMessage.value}]`;
              return '';
            })
            .filter(Boolean)
            .join('\n');
        }

        if (promptText) {
          exchanges.push({
            sessionId: session.sessionId || doc.filePath || 'vscode',
            timestamp: new Date(req.timestamp || doc.importedAt),
            prompt: promptText,
            response: responseText,
          });
        }
      });
    }

    // KIRO: { chat: [...] }
    if ((doc.source === 'file' || doc.source === 'kiro') && doc.content && Array.isArray(doc.content.chat)) {
      let lastUserMsg = null;
      doc.content.chat.forEach((msg) => {
        if (msg.role === 'user' || msg.role === 'human') lastUserMsg = msg;
        else if ((msg.role === 'assistant' || msg.role === 'bot') && lastUserMsg) {
          exchanges.push({
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

  // Cleanup / normalization
  exchanges = exchanges
    .map((ex) => ({
      sessionId: ex.sessionId || doc.filePath || 'unknown-session',
      timestamp: ex.timestamp instanceof Date ? ex.timestamp : new Date(ex.timestamp || doc.importedAt || Date.now()),
      prompt: typeof ex.prompt === 'string' ? ex.prompt : (ex.prompt?.text || JSON.stringify(ex.prompt || '')),
      response: typeof ex.response === 'string' ? ex.response : JSON.stringify(ex.response || ''),
    }))
    .filter((ex) => ex.prompt && ex.prompt.trim().length >= CONFIG.MIN_CONTENT_LENGTH);

  return exchanges;
}

// ============================================================================
// GEMINI ANALYSIS
// ============================================================================

function buildSystemPrompt() {
  return [
    'You are a Technical Biographer analyzing developer + AI chat interactions.',
    '',
    'Task: Given USER PROMPT and AI RESPONSE, infer:',
    '- developer intent',
    '- scenario (debugging/building/refactoring/etc.)',
    "- developer mental state / thought process (brief, concrete, non-judgmental)",
    '- technology context (stack/tools mentioned or implied)',
    '- struggle_score 1-10 (1=flow, 10=stuck)',
    '- is_milestone (true if they solved a hard blocker or reached a key breakthrough)',
    '- tools_used (Terminal/VS Code/Git/GitHub Actions/Docker/etc. if evident)',
    '- soft_skills (e.g., Persistence, Problem Solving, Attention to Detail)',
    '',
    'Output rules:',
    '1) Return JSON ONLY. No markdown. No backticks.',
    '2) Must match this exact schema (all keys present):',
    '{',
    '  "intent": "string",',
    '  "scenario": "string",',
    '  "thought_process": "string",',
    '  "tech_context": ["string"],',
    '  "struggle_score": 1,',
    '  "is_milestone": false,',
    '  "tools_used": ["string"],',
    '  "soft_skills": ["string"]',
    '}',
    '3) If unclear: intent="unknown", scenario="unknown", thought_process="", tech_context=[], struggle_score=5, is_milestone=false, tools_used=[], soft_skills=[]',
  ].join('\n');
}

async function analyzeWithGemini(model, prompt, response) {
  const cleanPrompt = clampText(cleanInput(prompt), CONFIG.MAX_PROMPT_CHARS);
  const cleanResponse = clampText(cleanInput(response), CONFIG.MAX_RESPONSE_CHARS);

  const userPayload = [
    'USER PROMPT:',
    cleanPrompt,
    '',
    'AI RESPONSE:',
    cleanResponse,
  ].join('\n');

  let attempt = 0;
  while (true) {
    try {
      const result = await model.generateContent(userPayload);
      const text = result?.response?.text?.() ?? '';
      const parsed = extractFirstJsonObject(text);

      if (!parsed) {
        // Hard fallback: treat as unknown
        return normalizeAnalysis(null);
      }

      return normalizeAnalysis(parsed);
    } catch (err) {
      attempt++;

      const retryable = looksTransient(err) || looksLikeRateLimit(err);
      if (!retryable || attempt > CONFIG.MAX_RETRIES) {
        throw err;
      }

      // Exponential backoff + jitter
      const base = Math.min(CONFIG.MAX_BACKOFF_MS, CONFIG.BASE_BACKOFF_MS * Math.pow(2, attempt - 1));
      const jitter = Math.floor(Math.random() * 250);
      const waitMs = base + jitter;

      const tag = looksLikeRateLimit(err) ? '429 Rate Limit' : 'Transient';
      console.warn(`   ⚠️  Gemini ${tag}. Retry ${attempt}/${CONFIG.MAX_RETRIES} in ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
}

// ============================================================================
// PIPELINE
// ============================================================================

async function main() {
  const targetProjectName = process.argv[2];
  if (!targetProjectName) {
    console.error('❌ Usage: node server/src/scripts/archiver-gemini.js "PROJECT NAME"');
    process.exit(1);
  }

  if (!CONFIG.GOOGLE_API_KEY) {
    console.error('❌ Missing GOOGLE_API_KEY in environment (.env)');
    process.exit(1);
  }

  console.log('═'.repeat(80));
  console.log('🧠 NEURAL BIOGRAPHER (Gemini)');
  console.log('═'.repeat(80));
  console.log(`📦 Model: ${CONFIG.MODEL}`);
  console.log(`🗄️  Mongo: ${CONFIG.MONGO_URI}`);
  console.log(`⚙️  Concurrency: ${CONFIG.CONCURRENCY}`);
  console.log(`🎯 Project: "${targetProjectName}"`);
  console.log('═'.repeat(80));

  await mongoose.connect(CONFIG.MONGO_URI);
  console.log('✅ MongoDB: Connected');

  // Ensure indexes (idempotency)
  await NeuralArchive.init();

  const genAI = new GoogleGenerativeAI(CONFIG.GOOGLE_API_KEY);

  const systemPrompt = buildSystemPrompt();
  const model = genAI.getGenerativeModel({
    model: CONFIG.MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
      // If supported by the runtime/model, this helps enforce JSON output.
      responseMimeType: 'application/json',
    },
  });

  // Stream raw files (avoid OOM)
  const cursor = RawConversation.find({
    projectName: targetProjectName,
    // Mirror existing pipeline behavior: only first part/un-chunked (safe default)
    part: { $lte: 1 },
  })
    .sort({ importedAt: 1 })
    .cursor({ batchSize: CONFIG.CURSOR_BATCH_SIZE });

  const limit = pLimit(CONFIG.CONCURRENCY);

  // sequenceIndex per session (stable within this run)
  const sessionSeq = new Map();

  // track in-flight promises to keep memory bounded
  const inFlight = new Set();

  let rawDocs = 0;
  let extracted = 0;
  let analyzed = 0;
  let skipped = 0;
  let failed = 0;

  function nextSequenceIndex(sessionId) {
    const cur = sessionSeq.get(sessionId) || 0;
    sessionSeq.set(sessionId, cur + 1);
    return cur;
  }

  async function processExchange(ex, doc) {
    // Idempotency (fast)
    const exists = await NeuralArchive.exists({ sessionId: ex.sessionId, timestamp: ex.timestamp });
    if (exists) {
      skipped++;
      return;
    }

    const analysis = await analyzeWithGemini(model, ex.prompt, ex.response);

    const rawPrompt = cleanInput(ex.prompt);
    const rawResponse = cleanInput(ex.response);

    const sequenceIndex = nextSequenceIndex(ex.sessionId);

    try {
      await NeuralArchive.create({
        originalId: doc._id,
        projectName: targetProjectName,
        sessionId: ex.sessionId,
        sequenceIndex,
        timestamp: ex.timestamp,
        raw: {
          prompt: clampText(rawPrompt, 20000),
          response_summary: clampText(rawResponse, 400),
          code_files_involved: extractFileNames(rawPrompt + '\n' + rawResponse),
        },
        analysis,
      });
      analyzed++;
    } catch (err) {
      // If another worker inserted first, treat as skip
      if (err?.code === 11000) {
        skipped++;
        return;
      }
      throw err;
    }
  }

  console.log('\n🌊 Streaming rawconversations…');

  try {
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      rawDocs++;

      const exchanges = extractExchangesFromDoc(doc);
      extracted += exchanges.length;

      // Process exchanges in timestamp order (better sequenceIndex semantics)
      exchanges.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      for (const ex of exchanges) {
        const task = limit(async () => {
          try {
            await processExchange(ex, doc);
          } catch (err) {
            failed++;
            const msg = err?.message || String(err);
            console.error(`   ❌ Failed exchange (session=${ex.sessionId}): ${msg}`);
          }
        });

        inFlight.add(task);
        task.finally(() => inFlight.delete(task));

        // Keep memory bounded
        if (inFlight.size >= CONFIG.CONCURRENCY * 5) {
          await Promise.race(inFlight);
        }
      }

      // lightweight progress
      if (rawDocs % 25 === 0) {
        process.stdout.write(
          `\r📦 RawDocs: ${rawDocs} | Exchanges: ${extracted} | ✅ Saved: ${analyzed} | ⏭️ Skipped: ${skipped} | ❌ Failed: ${failed}`
        );
      }
    }

    // Drain remaining tasks
    await Promise.allSettled([...inFlight]);

    console.log('\n\n✅ ARCHIVE COMPLETE');
    console.log(`   Raw docs streamed: ${rawDocs}`);
    console.log(`   Exchanges extracted: ${extracted}`);
    console.log(`   Exchanges saved: ${analyzed}`);
    console.log(`   Skipped (idempotent): ${skipped}`);
    console.log(`   Failed: ${failed}`);
  } catch (err) {
    console.error('\n💥 Pipeline error:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB: Disconnected');
  }
}

// Handle Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Interrupted. Disconnecting…');
  try {
    await mongoose.disconnect();
  } finally {
    process.exit(0);
  }
});

main();