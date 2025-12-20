import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
await mongoose.connect('mongodb://localhost:27017/secondbrain');

// Get all processed workspace IDs
const Conversation = mongoose.model('Conversation', new mongoose.Schema({
  workspaceId: String,
  projectName: String
}));

const processedWorkspaces = await Conversation.find({}, { workspaceId: 1, projectName: 1 });
const processedIds = new Set(processedWorkspaces.map(w => w.workspaceId));

console.log(`✅ Found ${processedIds.size} processed workspaces in MongoDB\n`);

// Get all workspace folders
const workspaceStoragePath = path.join(__dirname, '../../../workspace-storage');
const allFolders = fs.readdirSync(workspaceStoragePath)
  .filter(f => {
    const fullPath = path.join(workspaceStoragePath, f);
    return fs.statSync(fullPath).isDirectory();
  });

console.log(`📂 Total workspace folders: ${allFolders.length}\n`);

// Function to get project path from workspace.json
const getProjectPath = (workspacePath) => {
  try {
    const workspaceJsonPath = path.join(workspacePath, 'workspace.json');
    if (!fs.existsSync(workspaceJsonPath)) return null;
    
    const workspaceData = JSON.parse(fs.readFileSync(workspaceJsonPath, 'utf8'));
    if (workspaceData.folder) {
      const uri = decodeURIComponent(workspaceData.folder);
      return uri.replace(/^file:\/\/\//, '').replace(/\//g, '\\');
    }
  } catch (error) {
    return null;
  }
  return null;
};

// Identify unprocessed folders
const unprocessedFolders = [];

for (const folderId of allFolders) {
  if (!processedIds.has(folderId)) {
    const fullPath = path.join(workspaceStoragePath, folderId);
    const projectPath = getProjectPath(fullPath);
    const projectName = projectPath ? path.basename(projectPath) : 'Unknown';
    
    // Check if it has chat sessions
    const chatSessionsPath = path.join(fullPath, 'chatSessions');
    const hasChatSessions = fs.existsSync(chatSessionsPath) && 
                           fs.readdirSync(chatSessionsPath).filter(f => f.endsWith('.json')).length > 0;
    
    unprocessedFolders.push({
      folderId,
      projectName,
      projectPath: projectPath || 'Unknown',
      hasChatSessions
    });
  }
}

console.log('📋 UNPROCESSED FOLDERS:\n');
console.log('═'.repeat(80));

const withChat = unprocessedFolders.filter(f => f.hasChatSessions);
const withoutChat = unprocessedFolders.filter(f => !f.hasChatSessions);

console.log(`\n🔴 WITH CHAT SESSIONS (${withChat.length} folders - NEED PROCESSING):\n`);
withChat.forEach(f => {
  console.log(`  ${f.projectName}`);
  console.log(`    Workspace ID: ${f.folderId}`);
  console.log(`    Path: ${f.projectPath}`);
  console.log('');
});

console.log(`\n⚪ WITHOUT CHAT SESSIONS (${withoutChat.length} folders - CAN SKIP):\n`);
withoutChat.forEach(f => {
  console.log(`  ${f.projectName} (${f.folderId})`);
});

console.log('\n' + '═'.repeat(80));
console.log(`\n📊 SUMMARY:`);
console.log(`   Total folders: ${allFolders.length}`);
console.log(`   Processed: ${processedIds.size}`);
console.log(`   Unprocessed with chat: ${withChat.length}`);
console.log(`   Unprocessed without chat: ${withoutChat.length}`);
console.log(`   Total unprocessed: ${unprocessedFolders.length}\n`);

await mongoose.disconnect();
