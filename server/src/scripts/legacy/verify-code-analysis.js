import { analyzeProject } from '../services/codeAnalysis.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verify() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  VERIFY CODE ANALYSIS SERVICE         ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Analyze the server directory itself
    const serverDir = path.resolve(__dirname, '../..');
    console.log(`📁 Analyzing: ${serverDir}\n`);

    const analysis = await analyzeProject(serverDir);

    console.log('✅ ANALYSIS COMPLETE\n');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 STACK:');
    console.log(`  Language: ${analysis.stack.language}`);
    console.log(`  Framework: ${analysis.stack.framework}`);
    console.log(`  Dependencies (top 5): ${analysis.stack.dependencies.slice(0, 5).join(', ')}\n`);
    
    console.log('🧩 COMPLEXITY:');
    console.log(`  Score: ${analysis.complexity}/10\n`);
    
    console.log('🏗️ PATTERNS:');
    analysis.patterns.forEach(pattern => console.log(`  • ${pattern}`));
    console.log();
    
    console.log('🔧 KEY COMPONENTS:');
    analysis.keyComponents.forEach(component => console.log(`  • ${component}`));
    console.log();
    
    console.log('📝 SUMMARY:');
    console.log(analysis.summary);
    console.log();
    
    console.log('🌲 FILE TREE (first 500 chars):');
    console.log(analysis.tree.slice(0, 500) + '...\n');

    console.log('✅ Verification successful!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verify();
