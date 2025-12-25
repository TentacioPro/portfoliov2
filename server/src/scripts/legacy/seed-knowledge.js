import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3001/api';

/**
 * Clean extracted text by removing excessive whitespace and newlines
 */
function cleanText(text) {
  return text
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/[ \t]{2,}/g, ' ')   // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/gm, '')   // Trim lines
    .trim();
}

/**
 * Find all PDF files in a directory (recursive)
 */
async function findPdfFiles(dir, pdfFiles = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, data folders
        if (!['node_modules', '.git', 'data', 'temp'].includes(entry.name)) {
          await findPdfFiles(fullPath, pdfFiles);
        }
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push(fullPath);
      }
    }
    
    return pdfFiles;
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
    return pdfFiles;
  }
}

/**
 * Extract text from a PDF file
 */
async function extractPdfText(pdfPath) {
  try {
    // Use CommonJS require for pdf-parse (it exports a PDFParse class)
    const { PDFParse } = require('pdf-parse');
    
    const dataBuffer = await fs.readFile(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Ingest text into the knowledge base
 */
async function ingestText(text, source) {
  try {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        metadata: {
          type: 'pdf',
          ingestedAt: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Ingestion failed: ${error.message}`);
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Knowledge Seeder: Starting...\n');

  // Project root is /app in Docker (where package.json is)
  const projectRoot = '/app';
  console.log(`📂 Scanning for PDFs in: ${projectRoot}\n`);

  // Find all PDFs
  const pdfFiles = await findPdfFiles(projectRoot);

  if (pdfFiles.length === 0) {
    console.log('⚠️  No PDF files found.');
    console.log('💡 Tip: Place PDF files in the project directory to seed the knowledge base.');
    process.exit(0);
  }

  console.log(`📚 Found ${pdfFiles.length} PDF file(s):\n`);
  pdfFiles.forEach((file, idx) => {
    const relativePath = path.relative(projectRoot, file);
    console.log(`  ${idx + 1}. ${relativePath}`);
  });
  console.log('');

  // Process each PDF
  let successCount = 0;
  let failCount = 0;

  for (const pdfPath of pdfFiles) {
    const fileName = path.basename(pdfPath);
    const relativePath = path.relative(projectRoot, pdfPath);
    
    try {
      console.log(`🌱 Seeding [${fileName}]...`);
      
      // Extract text
      const rawText = await extractPdfText(pdfPath);
      const cleanedText = cleanText(rawText);
      
      if (cleanedText.length < 50) {
        console.log(`  ⚠️  Skipped (text too short: ${cleanedText.length} chars)\n`);
        failCount++;
        continue;
      }

      // Ingest
      const result = await ingestText(cleanedText, relativePath);
      
      console.log(`  ✅ Queued (Job ID: ${result.jobId}, ${cleanedText.length} chars)\n`);
      successCount++;

      // Small delay to avoid overwhelming the queue
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log(`✅ Successfully queued: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log('='.repeat(60));
  console.log('\n💡 Tip: Run verify-rag.js to test retrieval after the queue processes.');
  
  process.exit(successCount > 0 ? 0 : 1);
}

// Run
seed().catch((error) => {
  console.error('❌ Seeder crashed:', error);
  process.exit(1);
});
