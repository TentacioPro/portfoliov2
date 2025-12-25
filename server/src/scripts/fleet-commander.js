import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase='));
const phase = phaseArg ? phaseArg.split('=')[1] : 'all';
const statusOnly = args.includes('--status');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain';

// ============================================================================
// IDEMPOTENCY: Status Dashboard
// ============================================================================
async function showStatusDashboard() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║            🧠 SECOND BRAIN PIPELINE STATUS                   ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        
        // Raw Conversations
        const rawTotal = await db.collection('rawconversations').countDocuments();
        const rawProcessed = await db.collection('rawconversations').countDocuments({ processed: true });
        const rawBatched = await db.collection('rawconversations').countDocuments({ batch_submitted: true });
        
        // Neural Archives
        const archivesTotal = await db.collection('neuralarchives').countDocuments();
        const archivesVectorized = await db.collection('neuralarchives').countDocuments({ vectorized: true });
        
        await mongoose.disconnect();
        
        console.log('║                                                              ║');
        console.log('║  📥 PHASE 1: INGESTION (Loader)                              ║');
        console.log(`║     Raw Documents:        ${String(rawTotal).padStart(6)}                         ║`);
        console.log('║                                                              ║');
        console.log('║  🤖 PHASE 2a: TRANSFORMATION (Online API)                    ║');
        console.log(`║     Processed (Online):   ${String(rawProcessed).padStart(6)} / ${String(rawTotal).padEnd(6)}               ║`);
        console.log('║                                                              ║');
        console.log('║  ☁️  PHASE 2b: TRANSFORMATION (Batch API)                     ║');
        console.log(`║     Submitted to Batch:   ${String(rawBatched).padStart(6)} / ${String(rawTotal).padEnd(6)}               ║`);
        console.log('║                                                              ║');
        console.log('║  📚 PHASE 3: NEURAL ARCHIVES                                 ║');
        console.log(`║     Archives Created:     ${String(archivesTotal).padStart(6)}                         ║`);
        console.log('║                                                              ║');
        console.log('║  🎯 PHASE 4: VECTORIZATION                                   ║');
        console.log(`║     Vectorized:           ${String(archivesVectorized).padStart(6)} / ${String(archivesTotal).padEnd(6)}               ║`);
        console.log('║                                                              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (rawTotal === 0) {
            console.log('   → Run: node fleet-commander.js --phase=ingest');
        } else if (rawProcessed < rawTotal && rawBatched < rawTotal) {
            console.log('   → For small batches: node fleet-commander.js --phase=transform');
            console.log('   → For large datasets: node fleet-commander.js --phase=batch');
        } else if (archivesTotal > 0 && archivesVectorized < archivesTotal) {
            console.log('   → Run: node fleet-commander.js --phase=vectorize');
        } else if (archivesVectorized === archivesTotal && archivesTotal > 0) {
            console.log('   ✅ All phases complete! Your Second Brain is ready.');
        }
        console.log('');
        
    } catch (err) {
        console.log('║  ⚠️  Could not connect to MongoDB                            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`\n   Error: ${err.message}`);
    }
}

function runScript(scriptName) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Starting Phase: ${scriptName}`);
        const scriptPath = path.resolve(__dirname, scriptName);
        const child = spawn('node', [scriptPath], { stdio: 'inherit' });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Phase ${scriptName} completed successfully.`);
                resolve();
            } else {
                console.error(`❌ Phase ${scriptName} failed with code ${code}.`);
                reject(new Error(`Script ${scriptName} failed`));
            }
        });
    });
}

async function main() {
    // Always show status first
    await showStatusDashboard();
    
    if (statusOnly) {
        process.exit(0);
    }
    
    try {
        if (phase === 'ingest' || phase === 'all') {
            await runScript('ingest-raw-workspace.js');
        }
        
        if (phase === 'transform' || phase === 'all') {
            await runScript('archiver-gemini.js');
        }

        if (phase === 'batch') {
            await runScript('trigger_batch_processing.js');
        }
        
        if (phase === 'vectorize' || phase === 'all') {
            await runScript('vectorize-archives.js');
        }
        
        console.log("\n🏁 All requested phases complete.");
        
        // Show final status
        if (phase !== 'all') {
            await showStatusDashboard();
        }
        
    } catch (error) {
        console.error("\n💥 Orchestration failed:", error.message);
        process.exit(1);
    }
}

main();
