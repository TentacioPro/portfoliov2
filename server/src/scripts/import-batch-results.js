/**
 * BATCH RESULTS IMPORTER (Target: neuralarchivedash)
 * * Features:
 * 1. Reads specific local JSONL file.
 * 2. Restores 'raw.prompt' and 'originalId' from instance data.
 * 3. Idempotent: Uses upsert to prevent duplicates on re-runs.
 * 4. Verbose Logging: Logs every 10 processed records.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CONFIG = {
    // Exact path to your 4.75GB predicted file
    LOCAL_PATH: 'data/predicted_batch/predictions_prediction-model-2025-12-26T08_59_36.339820Z_predictions.jsonl',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain',
    BATCH_SIZE: 1000, // DB write batch size (efficient)
    LOG_INTERVAL: 10   // Console log frequency (user requested 10)
};

// SCHEMAS
const NeuralArchiveSchema = new mongoose.Schema({
    originalId: mongoose.Schema.Types.ObjectId,
    projectName: String,
    sessionId: String,
    timestamp: { type: Date, default: Date.now },
    analysis: {
        intent: String,
        struggle_score: Number,
        tech_context: String, 
        is_milestone: Boolean,
    },
    raw: { 
        prompt: String, 
        response_summary: String 
    },
    source: { type: String, default: 'vertex_batch_v2' }
}, { timestamps: true });

// Index for Idempotency
NeuralArchiveSchema.index({ originalId: 1 }, { unique: true });
NeuralArchiveSchema.index({ 'analysis.intent': 1 }); // Fallback index

// TARGETING NEW COLLECTION: 'neuralarchivedash'
const NeuralArchive = mongoose.models.NeuralArchive || mongoose.model('NeuralArchive', NeuralArchiveSchema, 'neuralarchivedash');

async function main() {
    console.log('\n🧠 NEURAL IMPORTER (neuralarchivedash)');
    console.log('───────────────────────────────────────');
    
    await mongoose.connect(CONFIG.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 1. Verify File
    const filePath = path.resolve(process.cwd(), CONFIG.LOCAL_PATH);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Local file not found: ${filePath}`);
        process.exit(1);
    }
    
    const stats = fs.statSync(filePath);
    console.log(`📂 Reading File: ${filePath}`);
    console.log(`📦 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    const inputStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: inputStream, crlfDelay: Infinity });

    let imported = 0;
    let failed = 0;
    let skipped = 0;
    let bulkOps = [];

    console.log('🔄 Starting Import Stream...\n');

    for await (const line of rl) {
        try {
            if (!line.trim()) continue;
            
            const record = JSON.parse(line);
            
            // ---------------------------------------------------------
            // 1. Extract Analysis (Wisdom)
            // ---------------------------------------------------------
            let analysis = null;
            // Vertex response shapes vary
            const candidates = record.prediction?.candidates || record.response?.candidates;
            
            if (candidates && candidates[0]?.content?.parts?.[0]?.text) {
                const text = candidates[0].content.parts[0].text;
                // Clean markdown wrappers
                const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
                try { 
                    analysis = JSON.parse(cleanJson); 
                } catch (e) {
                    // Sometimes model returns partial JSON or raw text
                }
            }

            // ---------------------------------------------------------
            // 2. Extract Context (Memory)
            // ---------------------------------------------------------
            // We need 'instance' to link back to the source
            const originalPrompt = record.instance?.content || record.instance?.prompt || "Context missing";
            
            // Recover ID: If you sent 'originalId' in the batch input, it will be here.
            // If not, we might generate a new one, but we prefer linking.
            let recoveredId = record.instance?.originalId 
                ? new mongoose.Types.ObjectId(record.instance.originalId) 
                : undefined;

            if (analysis) {
                // Idempotency Logic:
                // Filter by ID if we have it, otherwise fallback to exact intent match
                const filter = recoveredId 
                    ? { originalId: recoveredId } 
                    : { 'analysis.intent': analysis.intent };

                bulkOps.push({
                    updateOne: {
                        filter: filter,
                        update: {
                            $set: {
                                originalId: recoveredId, 
                                analysis: {
                                    intent: analysis.intent,
                                    struggle_score: parseInt(analysis.struggle_score) || 5,
                                    tech_context: analysis.tech_context,
                                    is_milestone: !!analysis.is_milestone
                                },
                                raw: {
                                    prompt: originalPrompt.substring(0, 5000), // Truncate huge prompts
                                    response_summary: "Batch Processed"
                                },
                                source: 'vertex_batch_v2'
                            }
                        },
                        upsert: true // <--- The Key to Idempotency
                    }
                });
                imported++;
            } else {
                failed++;
            }

            // ---------------------------------------------------------
            // 3. Execution & Logging
            // ---------------------------------------------------------
            
            // Log every 10 docs (as requested)
            if ((imported + failed) % CONFIG.LOG_INTERVAL === 0) {
                const percent = (imported / (imported + failed + skipped) * 100).toFixed(1);
                console.log(`   [${new Date().toISOString().split('T')[1].split('.')[0]}] Processed: ${imported.toLocaleString()} | Errors: ${failed} | Success Rate: ${percent}%`);
                
                // Show a sample of what we just parsed (sanity check)
                if (analysis && (imported + failed) % 100 === 0) {
                     console.log(`    ↳ Sample Intent: "${analysis.intent.substring(0, 60)}..."`);
                }
            }

            // Flush DB Write Buffer (every 1000 for performance)
            if (bulkOps.length >= CONFIG.BATCH_SIZE) {
                await NeuralArchive.bulkWrite(bulkOps, { ordered: false });
                bulkOps = [];
            }

        } catch (e) {
            failed++;
        }
    }

    // Flush remaining
    if (bulkOps.length > 0) {
        await NeuralArchive.bulkWrite(bulkOps, { ordered: false });
    }

    console.log(`\n\n✅ IMPORT COMPLETE.`);
    console.log(`   Target Collection: neuralarchivedash`);
    console.log(`   Total Processed:   ${imported}`);
    console.log(`   Total Failed:      ${failed}`);
    process.exit(0);
}

main().catch(err => {
    console.error('\n💥 CRITICAL FAILURE:', err.message);
    process.exit(1);
});