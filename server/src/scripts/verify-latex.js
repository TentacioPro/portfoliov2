import { compileToPdf } from '../services/latex.js';
import { promises as fs } from 'fs';
import path from 'path';

const MINIMAL_LATEX = `\\documentclass{article}
\\begin{document}
Hello World from Eno Reyes
\\end{document}`;

async function verify() {
  console.log('🧪 Starting LaTeX Verification...');

  try {
    const start = Date.now();
    const pdfBuffer = await compileToPdf(MINIMAL_LATEX);
    const duration = Date.now() - start;

    // Check if it's a valid PDF (starts with %PDF magic bytes)
    const header = pdfBuffer.toString('utf8', 0, 4);
    
    if (header === '%PDF') {
      console.log(`✅ PDF Generated (Size: ${pdfBuffer.length} bytes) in ${duration}ms`);
      
      // Optionally write to file for manual inspection
      const outputPath = path.join(process.cwd(), 'output.pdf');
      await fs.writeFile(outputPath, pdfBuffer);
      console.log(`📄 PDF written to: ${outputPath}`);
      
      console.log('SUCCESS: LaTeX engine is operational.');
      process.exit(0);
    } else {
      console.error(`❌ FAILURE: Output does not appear to be a PDF. Header: ${header}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    if (error.message.includes('ENOENT')) {
      console.error('💡 Hint: Ensure tectonic is installed and in PATH');
    }
    process.exit(1);
  }
}

verify();
