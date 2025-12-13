import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const TEMP_DIR = path.join(process.cwd(), 'temp');

/**
 * Ensure temp directory exists
 */
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Compile LaTeX string to PDF Buffer
 * @param {string} latexString - The LaTeX source code
 * @returns {Promise<Buffer>} - The compiled PDF as a Buffer
 */
export async function compileToPdf(latexString) {
  await ensureTempDir();

  const sessionId = crypto.randomUUID();
  const inputFile = path.join(TEMP_DIR, `${sessionId}.tex`);
  const outputFile = path.join(TEMP_DIR, `${sessionId}.pdf`);

  try {
    // 1. Write LaTeX to temp file
    await fs.writeFile(inputFile, latexString, 'utf8');

    // 2. Compile with Tectonic
    const stderr = await new Promise((resolve, reject) => {
      const process = spawn('tectonic', [inputFile, '--outdir', TEMP_DIR]);

      let stderrData = '';

      process.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stderrData);
        } else {
          reject(new Error(`Tectonic compilation failed (exit code ${code}):\n${stderrData}`));
        }
      });

      process.on('error', (err) => {
        reject(new Error(`Failed to spawn tectonic: ${err.message}`));
      });
    });

    // 3. Read generated PDF
    const pdfBuffer = await fs.readFile(outputFile);

    // 4. Cleanup temp files
    await Promise.all([
      fs.unlink(inputFile).catch(() => {}),
      fs.unlink(outputFile).catch(() => {}),
    ]);

    console.log(`[LaTeX] Compiled PDF for session ${sessionId} (${pdfBuffer.length} bytes)`);
    return pdfBuffer;

  } catch (error) {
    // Cleanup on error
    await Promise.all([
      fs.unlink(inputFile).catch(() => {}),
      fs.unlink(outputFile).catch(() => {}),
    ]);

    console.error(`[LaTeX] Compilation failed for session ${sessionId}:`, error.message);
    throw error;
  }
}
