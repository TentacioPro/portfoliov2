import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const phaseArg = args.find(a => a.startsWith('--phase='));
const phase = phaseArg ? phaseArg.split('=')[1] : 'all';

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
    try {
        if (phase === 'ingest' || phase === 'all') {
            await runScript('ingest-raw-workspace.js');
        }
        
        if (phase === 'transform' || phase === 'all') {
            await runScript('archiver-gemini.js');
        }
        
        if (phase === 'vectorize' || phase === 'all') {
            await runScript('vectorize-archives.js');
        }
        
        console.log("\n🏁 All requested phases complete.");
    } catch (error) {
        console.error("\n💥 Orchestration failed:", error.message);
        process.exit(1);
    }
}

main();
