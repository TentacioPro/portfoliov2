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
        
        // NEW Collection for Archives
        const archivesTotal = await db.collection('neuralarchivedash').countDocuments();
        
        // Vectors (Assuming you will vector this new collection)
        // If vector collection hasn't been created yet, this might be 0
        const archivesVectorized = await db.collection('neuralarchivedash').countDocuments({ vectorized: true });
        
        await mongoose.disconnect();
        
        console.log('║                                                              ║');
        console.log('║  📥 PHASE 1: INGESTION (Loader)                              ║');
        console.log(`║     Raw Documents:        ${String(rawTotal).padStart(6)}                         ║`);
        console.log('║                                                              ║');
        console.log('║  📚 PHASE 3: NEURAL ARCHIVES (neuralarchivedash)             ║');
        console.log(`║     Archives Imported:    ${String(archivesTotal).padStart(6)}                         ║`);
        console.log('║                                                              ║');
        console.log('║  🎯 PHASE 4: VECTORIZATION                                   ║');
        console.log(`║     Vectorized:           ${String(archivesVectorized).padStart(6)} / ${String(archivesTotal).padEnd(6)}               ║`);
        console.log('║                                                              ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        if (rawTotal === 0) {
            console.log('   → Run: node fleet-commander.js --phase=ingest');
        } else if (archivesTotal === 0) {
            console.log('   → Run: node fleet-commander.js --phase=import');
        } else if (archivesTotal > 0 && archivesVectorized < archivesTotal) {
            console.log('   → Run: node fleet-commander.js --phase=vectorize');
        }
        console.log('');
        
    } catch (err) {
        console.log('║  ⚠️  Could not connect to MongoDB                            ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log(`\n   Error: ${err.message}`);
    }
}

function runScript(scriptName, scriptArgs = []) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Starting Phase: ${scriptName}`);
        const scriptPath = path.resolve(__dirname, scriptName);
        
        const child = spawn('node', [scriptPath, ...scriptArgs], { stdio: 'inherit' });

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
        
        if (phase === 'transform') {
            await runScript('archiver-gemini.js');
        }

        if (phase === 'batch') {
            await runScript('trigger_batch_processing.js');
        }
        
        if (phase === 'import') {
            // Updated to run the local import
            await runScript('import-batch-results.js', ['--local']);
        }
        
        if (phase === 'vectorize' || phase === 'all') {
            await runScript('vectorize-archives.js');
        }
        
        console.log("\n🏁 All requested phases complete.");
        
        // Show final status
        await showStatusDashboard();
        
    } catch (error) {
        console.error("\n💥 Orchestration failed:", error.message);
        process.exit(1);
    }
}

// Print usage help
console.log('\n📋 FLEET COMMANDER - ELT Pipeline Orchestrator');
console.log('─'.repeat(50));
console.log('Usage:');
console.log('  node fleet-commander.js --status       Show pipeline status');
console.log('  node fleet-commander.js --phase=import    Import batch results (Local File)');
console.log('  node fleet-commander.js --phase=vectorize Qdrant vectorization');
console.log('');

main();