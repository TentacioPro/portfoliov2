import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { analyzeProject, analyzePowerPoint, sleep } from '../services/codeAnalysis.js';
import { embeddingService } from '../services/embedding.js';
import { client as qdrantClient } from '../services/vector.js';
import { connectDB } from '../services/db.js';

// MongoDB Schema for Project Metadata
const ProjectSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['project', 'presentation'] },
  summary: String,
  oneLiner: String,
  techStack: [String],
  engineersLogic: String,
  promptReconstruction: String,
  stack: {
    language: String,
    framework: String,
    dependencies: [String]
  },
  complexity: Number,
  patterns: [String],
  keyComponents: [String],
  analyzedAt: { type: Date, default: Date.now }
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

/**
 * Deep ingestion script for projects and presentations
 * @param {string} rootDir - Root directory containing projects
 */
async function ingestDeep(rootDir) {
  console.log('🧠 [IngestDeep] Starting semantic code analysis...');
  console.log(`📁 Root directory: ${rootDir}`);

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

    // Get all subdirectories (each is a project)
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    const projectDirs = entries
      .filter(entry => entry.isDirectory())
      .filter(entry => !['node_modules', '.git', 'data'].includes(entry.name))
      .map(entry => path.join(rootDir, entry.name));

    console.log(`📊 Found ${projectDirs.length} project directories`);

    // Process each project
    for (let i = 0; i < projectDirs.length; i++) {
      const projectDir = projectDirs[i];
      const projectName = path.basename(projectDir);

      console.log(`\n[${i + 1}/${projectDirs.length}] Processing: ${projectName}`);

      try {
        // Analyze the project
        const analysis = await analyzeProject(projectDir);
        
        console.log(`  ✓ Analysis complete (Complexity: ${analysis.complexity}/10)`);
        console.log(`  ✓ Stack: ${analysis.stack.language} - ${analysis.stack.framework}`);

        // Generate embedding from summary
        const embedding = await embeddingService.getEmbedding(analysis.summary);
        console.log(`  ✓ Generated embedding (${embedding.length} dimensions)`);

        // Store in Qdrant
        const vectorId = randomUUID();
        const payload = {
          text: analysis.summary?.substring(0, 5000) || 'No summary', // Limit to 5KB
          source: projectName,
          type: 'project-architecture',
          oneLiner: analysis.oneLiner || '',
          techStack: Array.isArray(analysis.techStack) ? analysis.techStack.join(', ') : '',
          engineersLogic: analysis.engineersLogic?.substring(0, 1000) || '',
          promptReconstruction: analysis.promptReconstruction?.substring(0, 1000) || '',
          stack: JSON.stringify(analysis.stack) || 'unknown',
          complexity: analysis.complexity || 0,
          patterns: Array.isArray(analysis.patterns) ? analysis.patterns.join(', ') : '',
          keyComponents: Array.isArray(analysis.keyComponents) ? analysis.keyComponents.join(', ') : ''
        };

        await qdrantClient.upsert('secondbrain', {
          points: [
            {
              id: vectorId,
              vector: embedding,
              payload
            }
          ]
        });
        console.log(`  ✓ Stored in Qdrant (ID: ${vectorId})`);

        // Store metadata in MongoDB
        await Project.findOneAndUpdate(
          { name: projectName },
          {
            name: projectName,
            type: 'project',
            summary: analysis.summary,
            oneLiner: analysis.oneLiner,
            techStack: analysis.techStack,
            engineersLogic: analysis.engineersLogic,
            promptReconstruction: analysis.promptReconstruction,
            stack: analysis.stack,
            complexity: analysis.complexity,
            patterns: analysis.patterns,
            keyComponents: analysis.keyComponents,
            analyzedAt: new Date()
          },
          { upsert: true, new: true }
        );
        console.log(`  ✓ Metadata saved to MongoDB`);

        // Rate limiting (avoid hitting Groq limits)
        if (i < projectDirs.length - 1) {
          console.log('  ⏳ Rate limiting (2s pause)...');
          await sleep(2000);
        }

      } catch (error) {
        console.error(`  ✗ Error processing ${projectName}:`, {
          message: error.message,
          status: error.status,
          name: error.name
        });
        continue; // Skip to next project
      }
    }

    // Process PowerPoint files
    console.log('\n📊 Searching for PowerPoint presentations...');
    const pptxFiles = await glob('**/*.pptx', {
      cwd: rootDir,
      ignore: ['**/node_modules/**', '**/.git/**'],
      absolute: true
    });

    console.log(`📊 Found ${pptxFiles.length} PowerPoint files`);

    for (let i = 0; i < pptxFiles.length; i++) {
      const pptxPath = pptxFiles[i];
      const fileName = path.basename(pptxPath);

      console.log(`\n[${i + 1}/${pptxFiles.length}] Processing: ${fileName}`);

      try {
        // Analyze PowerPoint
        const analysis = await analyzePowerPoint(pptxPath);
        console.log(`  ✓ Analysis complete`);

        // Generate embedding
        const embedding = await embeddingService.getEmbedding(analysis.summary);
        console.log(`  ✓ Generated embedding`);

        // Store in Qdrant
        const vectorId = randomUUID();
        await qdrantClient.upsert('secondbrain', {
          points: [
            {
              id: vectorId,
              vector: embedding,
              payload: {
                text: analysis.summary?.substring(0, 5000) || 'No content',
                source: fileName,
                type: 'presentation',
                size: analysis.size
              }
            }
          ]
        });
        console.log(`  ✓ Stored in Qdrant (ID: ${vectorId})`);

        // Store metadata in MongoDB
        await Project.findOneAndUpdate(
          { name: fileName },
          {
            name: fileName,
            type: 'presentation',
            summary: analysis.summary,
            analyzedAt: new Date()
          },
          { upsert: true, new: true }
        );
        console.log(`  ✓ Metadata saved to MongoDB`);

        // Rate limiting
        if (i < pptxFiles.length - 1) {
          await sleep(2000);
        }

      } catch (error) {
        console.error(`  ✗ Error processing ${fileName}:`, error.message);
        continue;
      }
    }

    console.log('\n✅ [IngestDeep] Deep ingestion complete!');
    console.log(`📊 Total projects analyzed: ${projectDirs.length}`);
    console.log(`📊 Total presentations analyzed: ${pptxFiles.length}`);

  } catch (error) {
    console.error('❌ [IngestDeep] Fatal error:', error);
    throw error;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const rootDir = process.argv[2] || process.cwd();
  
  console.log('╔════════════════════════════════════════╗');
  console.log('║  SECOND BRAIN - DEEP INGEST SCRIPT    ║');
  console.log('╚════════════════════════════════════════╝\n');

  ingestDeep(rootDir)
    .then(() => {
      console.log('\n🎉 Process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error);
      process.exit(1);
    });
}

export { ingestDeep };
