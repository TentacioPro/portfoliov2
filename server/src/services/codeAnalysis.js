import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate a file tree string from a directory
 * @param {string} dirPath - Root directory path
 * @param {string} prefix - Indentation prefix
 * @param {Set} ignoreSet - Directories to ignore
 * @returns {Promise<string>} File tree string
 */
async function generateFileTree(dirPath, prefix = '', ignoreSet = new Set([
  'node_modules', '.git', 'dist', 'build', '__pycache__', 'venv', '.venv', 'env'
])) {
  let tree = '';
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (ignoreSet.has(entry.name)) continue;
      
      const fullPath = path.join(dirPath, entry.name);
      tree += `${prefix}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}\n`;
      
      if (entry.isDirectory()) {
        tree += await generateFileTree(fullPath, prefix + '  ', ignoreSet);
      }
    }
  } catch (error) {
    console.error(`[CodeAnalysis] Error reading directory ${dirPath}:`, error.message);
  }
  
  return tree;
}

/**
 * Identify tech stack from config files
 * @param {string} dirPath - Project directory
 * @returns {Promise<Object>} Stack information
 */
async function identifyStack(dirPath) {
  const stack = {
    language: 'unknown',
    framework: 'unknown',
    dependencies: []
  };

  try {
    // Check for Node.js project
    const packageJsonPath = path.join(dirPath, 'package.json');
    try {
      const packageData = await fs.readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(packageData);
      stack.language = 'JavaScript/Node.js';
      stack.framework = pkg.dependencies?.react ? 'React' : 
                       pkg.dependencies?.express ? 'Express' :
                       pkg.dependencies?.next ? 'Next.js' : 'Unknown';
      stack.dependencies = Object.keys(pkg.dependencies || {}).slice(0, 10);
      return stack;
    } catch {}

    // Check for Python project
    const requirementsPath = path.join(dirPath, 'requirements.txt');
    try {
      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      stack.language = 'Python';
      const deps = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      stack.framework = deps.some(d => d.includes('django')) ? 'Django' :
                       deps.some(d => d.includes('flask')) ? 'Flask' :
                       deps.some(d => d.includes('fastapi')) ? 'FastAPI' : 'Unknown';
      stack.dependencies = deps.slice(0, 10);
      return stack;
    } catch {}

    // Check for Python with pyproject.toml
    const pyprojectPath = path.join(dirPath, 'pyproject.toml');
    try {
      await fs.access(pyprojectPath);
      stack.language = 'Python';
      return stack;
    } catch {}

  } catch (error) {
    console.error(`[CodeAnalysis] Error identifying stack:`, error.message);
  }

  return stack;
}

/**
 * Read key files from the project
 * @param {string} dirPath - Project directory
 * @returns {Promise<Object>} Key file contents
 */
async function readKeyFiles(dirPath) {
  const keyFiles = {
    readme: '',
    entryPoint: ''
  };

  // Try to read README
  const readmePatterns = ['README.md', 'README.txt', 'README', 'readme.md'];
  for (const pattern of readmePatterns) {
    try {
      const readmePath = path.join(dirPath, pattern);
      keyFiles.readme = await fs.readFile(readmePath, 'utf-8');
      break;
    } catch {}
  }

  // Try to read entry point
  const entryPatterns = ['index.js', 'main.py', 'app.py', 'server.js', '__init__.py', 'index.ts'];
  for (const pattern of entryPatterns) {
    try {
      const entryPath = path.join(dirPath, pattern);
      const content = await fs.readFile(entryPath, 'utf-8');
      // Limit to first 500 lines to avoid token overflow
      keyFiles.entryPoint = content.split('\n').slice(0, 500).join('\n');
      break;
    } catch {}
  }

  return keyFiles;
}

/**
 * Analyze a project directory using LLM
 * @param {string} dirPath - Project directory path
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeProject(dirPath) {
  console.log(`[CodeAnalysis] Analyzing project: ${dirPath}`);

  try {
    // 1. Generate file tree
    const tree = await generateFileTree(dirPath);
    
    // 2. Identify stack
    const stack = await identifyStack(dirPath);
    
    // 3. Read key files
    const keyFiles = await readKeyFiles(dirPath);

    // 4. Construct LLM prompt with new Senior Software Architect ideology
    const analysisPrompt = `You are a Senior Software Architect analyzing a legacy codebase.

FILE TREE:
${tree.slice(0, 2000)} ${tree.length > 2000 ? '...(truncated)' : ''}

TECH STACK:
Language: ${stack.language}
Framework: ${stack.framework}
Dependencies: ${stack.dependencies.join(', ')}

README:
${keyFiles.readme.slice(0, 1500)} ${keyFiles.readme.length > 1500 ? '...(truncated)' : ''}

ENTRY POINT CODE:
${keyFiles.entryPoint.slice(0, 1500)} ${keyFiles.entryPoint.length > 1500 ? '...(truncated)' : ''}

TASK:
Analyze the provided code files. You must ignore syntax errors and focus on INTENT.

OUTPUT: Return a JSON object with:

1. "oneLiner": A simple English sentence explaining what this project actually does (e.g., "A real-time chat app using WebSockets").

2. "techStack": List libraries/frameworks detected as an array of strings (e.g., ["React", "Pandas", "Socket.io"]).

3. "engineersLogic": Infer what problem the developer was trying to solve (2-3 sentences).

4. "promptReconstruction": Reverse engineer the likely prompt the user gave to an AI to generate this (e.g., "Write a Python script that scrapes X and saves to CSV").

5. "complexity": Rate complexity from 1-10 where:
   - 1-3: Simple script/utility
   - 4-6: Standard application
   - 7-9: Complex system with multiple integrations
   - 10: Highly sophisticated distributed system

6. "patterns": Array of architectural patterns detected (e.g., ["MVC", "Event-Driven"]).

7. "keyComponents": Array of main technical components (e.g., ["Database Layer", "API Gateway"]).

Output Format:
{
  "oneLiner": "...",
  "techStack": ["...", "..."],
  "engineersLogic": "...",
  "promptReconstruction": "...",
  "complexity": 7,
  "patterns": ["...", "..."],
  "keyComponents": ["...", "..."]
}`;

    // 5. Call Groq API
    console.log('[CodeAnalysis] Calling Groq for analysis...');
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a Senior Software Architect analyzing legacy codebases. Focus on INTENT over syntax. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    // 6. Return comprehensive result with new fields
    return {
      summary: analysis.oneLiner || 'No summary generated',
      oneLiner: analysis.oneLiner || 'Unknown project',
      techStack: analysis.techStack || [],
      engineersLogic: analysis.engineersLogic || 'Logic unclear',
      promptReconstruction: analysis.promptReconstruction || 'Unable to reconstruct',
      stack: {
        language: stack.language,
        framework: stack.framework,
        dependencies: stack.dependencies
      },
      complexity: analysis.complexity || 5,
      patterns: analysis.patterns || [],
      keyComponents: analysis.keyComponents || [],
      tree: tree.slice(0, 1000), // Truncate for storage
      readme: keyFiles.readme.slice(0, 500)
    };

  } catch (error) {
    console.error(`[CodeAnalysis] Error analyzing project ${dirPath}:`, error);
    throw error;
  }
}

/**
 * Extract text from PowerPoint file
 * @param {string} pptxPath - Path to .pptx file
 * @returns {Promise<string>} Extracted text
 */
export async function analyzePowerPoint(pptxPath) {
  console.log(`[CodeAnalysis] Analyzing PowerPoint: ${pptxPath}`);

  try {
    // For now, return a placeholder - full implementation would require
    // a library like 'officegen' or 'office-text-extractor'
    // This is a simplified version that just reads the file name and metadata
    
    const fileName = path.basename(pptxPath);
    const stats = await fs.stat(pptxPath);
    
    // Use Groq to generate insights based on file name
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are analyzing a presentation file. Based on the filename, infer likely content and generate a brief summary.'
        },
        {
          role: 'user',
          content: `PowerPoint file: "${fileName}"\nFile size: ${Math.round(stats.size / 1024)}KB\n\nWhat topics might this presentation cover? Generate a brief analysis.`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    const summary = response.choices[0].message.content;

    return {
      summary,
      source: fileName,
      type: 'presentation',
      size: stats.size,
      note: 'Full PPT text extraction requires additional library integration'
    };

  } catch (error) {
    console.error(`[CodeAnalysis] Error analyzing PowerPoint:`, error);
    throw error;
  }
}

/**
 * Rate limiting helper
 * @param {number} ms - Milliseconds to wait
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
