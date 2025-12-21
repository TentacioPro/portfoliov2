/**
 * Extract Large KIRO Workspaces with Streaming
 * 
 * Fixes buffer overflow by processing chat files in small batches
 * Handles the 2 failed workspaces: 7281ebd028e3cd673114e7354cbcbf6e (5,949 files)
 *                                  8856313c3aa3201dde31fdf9bdad594e (4,876 files)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KIRO_BASE = path.resolve(__dirname, '../../../workspace-storage/KIRO/globalStorage/kiro.kiroagent');
const BATCH_SIZE = 50; // Process 50 files at a time to avoid memory issues
const FAILED_WORKSPACES = [
  '7281ebd028e3cd673114e7354cbcbf6e', // 5,949 files
  '8856313c3aa3201dde31fdf9bdad594e'  // 4,876 files
];

function detectTechStack(content) {
  const techPatterns = {
    'React': /import.*from ['"]react['"]/i,
    'Express': /express\(\)|app\.use|app\.get|app\.post/i,
    'MongoDB': /mongoose|mongodb|MongoClient/i,
    'TypeScript': /interface |type |enum |\.tsx?$/i,
    'Tailwind CSS': /tailwind|@apply|className.*['"](flex|grid|p-|m-|bg-)/i,
    'Docker': /FROM |docker-compose|Dockerfile/i,
    'Python': /def |import |from.*import|\.py$/i,
    'Vite': /vite|import\.meta/i,
    'KIRO Agent': /kiro|agent/i,
    'Ollama': /ollama/i
  };

  const detected = new Set();
  for (const [tech, pattern] of Object.entries(techPatterns)) {
    if (pattern.test(content)) {
      detected.add(tech);
    }
  }
  return Array.from(detected);
}

async function processWorkspace(workspaceId) {
  const workspaceDir = path.join(KIRO_BASE, workspaceId);
  
  console.log(`\n📂 Workspace: ${workspaceId}`);
  
  // Get all chat files
  const chatFiles = fs.readdirSync(workspaceDir)
    .filter(f => f.endsWith('.chat'))
    .map(f => path.join(workspaceDir, f));
  
  console.log(`   Chat files: ${chatFiles.length}`);
  
  if (chatFiles.length === 0) {
    console.log(`   ⚠️  No chat files`);
    return null;
  }
  
  const exchanges = [];
  const sessions = new Map();
  const techStackSet = new Set();
  let processed = 0;
  let failed = 0;
  
  // Process in batches
  for (let i = 0; i < chatFiles.length; i += BATCH_SIZE) {
    const batchFiles = chatFiles.slice(i, i + BATCH_SIZE);
    
    for (const chatFile of batchFiles) {
      try {
        const content = fs.readFileSync(chatFile, 'utf8');
        
        // Detect tech stack from file path and content
        const fileContent = `${chatFile} ${content.substring(0, 1000)}`;
        const techs = detectTechStack(fileContent);
        techs.forEach(t => techStackSet.add(t));
        
        const chatData = JSON.parse(content);
        const sessionId = path.basename(chatFile, '.chat');
        
        if (!chatData.chat || !Array.isArray(chatData.chat)) {
          continue;
        }
        
        // Parse role-based messages (human -> bot pairs)
        let currentPrompt = '';
        const sessionExchanges = [];
        
        for (let j = 0; j < chatData.chat.length; j++) {
          const message = chatData.chat[j];
          
          if (message.role === 'human') {
            currentPrompt = message.content || '';
          } else if (message.role === 'bot' && currentPrompt) {
            const response = message.content || '';
            
            // Skip system prompts
            if (response && !response.startsWith('# Identity')) {
              const exchange = {
                prompt: currentPrompt.substring(0, 5000),
                response: response.substring(0, 10000),
                timestamp: chatData.metadata?.createdAt || new Date().toISOString(),
                toolsUsed: [],
                filesEditedCount: 0,
                modelUsed: chatData.metadata?.modelId || 'unknown'
              };
              
              sessionExchanges.push(exchange);
              exchanges.push(exchange);
            }
            currentPrompt = '';
          } else if (message.role === 'tool' && sessionExchanges.length > 0) {
            // Add tool to last exchange
            const lastExchange = sessionExchanges[sessionExchanges.length - 1];
            lastExchange.toolsUsed.push(message.content?.substring(0, 100) || 'tool');
          }
        }
        
        if (sessionExchanges.length > 0) {
          sessions.set(sessionId, {
            sessionId,
            timestamp: chatData.metadata?.createdAt || new Date().toISOString(),
            exchanges: sessionExchanges
          });
        }
        
        processed++;
      } catch (error) {
        failed++;
        // Silently skip malformed files
      }
    }
    
    // Clear memory after each batch
    if (i % (BATCH_SIZE * 10) === 0 && i > 0) {
      console.log(`   Progress: ${processed}/${chatFiles.length} files (${failed} failed)`);
      if (global.gc) global.gc(); // Force garbage collection if available
    }
  }
  
  if (exchanges.length === 0) {
    console.log(`   ⚠️  No valid exchanges extracted`);
    return null;
  }
  
  const techStack = Array.from(techStackSet);
  const conversationsArray = Array.from(sessions.values());
  
  // Get workspace metadata
  const projectPath = 'KIRO Agent Large Workspace';
  const projectName = `KIRO Agent Project (Large - ${workspaceId.substring(0, 8)})`;
  const workspaceIdPrefixed = `kiro-${workspaceId}`;
  
  const timestamps = exchanges.map(e => new Date(e.timestamp)).sort((a, b) => a - b);
  const firstChatDate = timestamps[0];
  const lastChatDate = timestamps[timestamps.length - 1];
  
  console.log(`   ✅ Processed: ${exchanges.length} exchanges from ${sessions.size} sessions`);
  console.log(`   📊 Tech: [${techStack.join(', ')}]`);
  console.log(`   📅 ${firstChatDate.toLocaleDateString()} - ${lastChatDate.toLocaleDateString()}`);
  console.log(`   ⚠️  Failed: ${failed} files`);
  
  // Split into chunks of 500 sessions each to avoid 16MB MongoDB limit
  const SESSION_CHUNK_SIZE = 500;
  const chunks = [];
  
  for (let i = 0; i < conversationsArray.length; i += SESSION_CHUNK_SIZE) {
    const chunkSessions = conversationsArray.slice(i, i + SESSION_CHUNK_SIZE);
    const chunkExchanges = chunkSessions.reduce((sum, s) => sum + s.exchanges.length, 0);
    
    chunks.push({
      projectName: `${projectName} (Part ${Math.floor(i / SESSION_CHUNK_SIZE) + 1})`,
      projectPath,
      workspaceId: `${workspaceIdPrefixed}-part${Math.floor(i / SESSION_CHUNK_SIZE) + 1}`,
      techStack,
      conversations: chunkSessions,
      totalExchanges: chunkExchanges,
      firstChatDate,
      lastChatDate,
      extractedAt: new Date()
    });
  }
  
  console.log(`   📦 Split into ${chunks.length} chunks (${SESSION_CHUNK_SIZE} sessions each)`);
  
  return chunks;
}

async function main() {
  console.log('🔗 Connecting to MongoDB...\n');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/secondbrain');
  
  console.log('📂 Processing Large KIRO Workspaces (Streaming Mode)...');
  console.log(`   Batch Size: ${BATCH_SIZE} files per iteration\n`);
  console.log('═'.repeat(80));
  
  let successCount = 0;
  let failCount = 0;
  
  for (const workspaceId of FAILED_WORKSPACES) {
    try {
      const chunks = await processWorkspace(workspaceId);
      
      if (chunks && chunks.length > 0) {
        // Insert each chunk separately
        for (const chunk of chunks) {
          await Conversation.findOneAndUpdate(
            { workspaceId: chunk.workspaceId },
            chunk,
            { upsert: true, new: true }
          );
          
          await ProjectsList.findOneAndUpdate(
            { projectName: chunk.projectName, workspaceId: chunk.workspaceId },
            {
              projectName: chunk.projectName,
              workspaceId: chunk.workspaceId,
              projectPath: chunk.projectPath,
              techStack: chunk.techStack,
              totalExchanges: chunk.totalExchanges,
              firstChatDate: chunk.firstChatDate,
              lastChatDate: chunk.lastChatDate,
              status: 'active'
            },
            { upsert: true, new: true }
          );
        }
        
        console.log(`   ✅ Saved ${chunks.length} chunks to MongoDB\n`);
        successCount += chunks.length;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
      failCount++;
    }
  }
  
  console.log('\n═'.repeat(80));
  console.log('\n📊 LARGE WORKSPACE SUMMARY:');
  console.log(`   ✅ Successfully processed: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  
  // Get final database state
  const totalConversations = await Conversation.countDocuments();
  const totalProjects = await ProjectsList.countDocuments();
  const totalExchangesResult = await Conversation.aggregate([
    { $group: { _id: null, total: { $sum: '$totalExchanges' } } }
  ]);
  const totalExchanges = totalExchangesResult[0]?.total || 0;
  
  console.log('\n🎯 FINAL DATABASE STATE:');
  console.log(`   Conversations: ${totalConversations}`);
  console.log(`   Projects List: ${totalProjects}`);
  console.log(`   Total Exchanges: ${totalExchanges}`);
  
  await mongoose.disconnect();
  console.log('\n✨ Done!');
}

// Run with --expose-gc for better memory management
// node --expose-gc src/scripts/extract-large-kiro-workspaces.js
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
