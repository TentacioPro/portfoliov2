import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

// --- CONFIGURATION ---
const WORKSPACE_STORAGE_ROOT = '../workspace-storage';
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

// Unprocessed folders with chat data
const UNPROCESSED_FOLDERS = [
    '0aa98ee4948aaf19b665bb27df23ac06', // app
    '2eebbcb9d63029a4a237eb78c8e4bf2e', // N8N
    '3a44503d7896fd314219fa752e428aa0', // qubic-core-lite
    '5cd184996884c91c8597f9ce94053554', // ATS August 26 10-55AM Before ATS Refactor
    '67bcaf86d8e6146df30f9d6f266c0e79', // Raw
    '6ecc1923150295821dd80ce886ceb5b3', // maaxify-v4.0 (1)
    'aa3443689d70a09d1f1ce98c422e07d1', // zed-main
    'ae957c73455631ff8bccfe8df4c7ae3f', // amazon-kiro.kiro-agent-source-code-analysis-main
    'b63198d0c9dafe6f67af7a80b39aa47a', // abishek
    'bbbf166ecc78a4e8bda60b386dd79c53', // amazon-kiro.kiro-agent-source-code-analysis-main (2)
    'bd3461ad94fc7b99cd947e97ce01953e', // agents-from-scratch-main
    'ce8a0d191c69000343608e9d21c140f6', // Maaxly Aug 16
    'dd2ceb82e5ae705c65081bef09d53d1c', // Maaxly Aug 30
    'f3ae1c58fd5d02eafbfed1b312e0a926'  // ai-services
];

await mongoose.connect(MONGO_URI);
console.log('🔗 Connected to MongoDB\n');

// --- HELPER FUNCTIONS ---

function getProjectPath(workspacePath) {
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
}

function detectTechStack(projectPath, chatContent = '') {
    const techStack = new Set();
    const lowerPath = projectPath.toLowerCase();
    const lowerContent = chatContent.toLowerCase();
    
    // Check path and content
    const combined = lowerPath + ' ' + lowerContent;
    
    if (combined.includes('react')) techStack.add('React');
    if (combined.includes('express')) techStack.add('Express');
    if (combined.includes('mongodb') || combined.includes('mongoose')) techStack.add('MongoDB');
    if (combined.includes('postgresql') || combined.includes('postgres')) techStack.add('PostgreSQL');
    if (combined.includes('tailwind')) techStack.add('Tailwind CSS');
    if (combined.includes('typescript')) techStack.add('TypeScript');
    if (combined.includes('vite')) techStack.add('Vite');
    if (combined.includes('docker')) techStack.add('Docker');
    if (combined.includes('python')) techStack.add('Python');
    if (combined.includes('django')) techStack.add('Django');
    if (combined.includes('flask')) techStack.add('Flask');
    if (combined.includes('next')) techStack.add('Next.js');
    if (combined.includes('node')) techStack.add('Node.js');
    if (combined.includes('angular')) techStack.add('Angular');
    if (combined.includes('vue')) techStack.add('Vue.js');
    
    return Array.from(techStack);
}

async function extractChatSessions(workspaceFolder) {
    try {
        const chatSessionsPath = path.join(workspaceFolder, 'chatSessions');
        
        if (!fs.existsSync(chatSessionsPath)) {
            return null;
        }
        
        const sessionFiles = fs.readdirSync(chatSessionsPath).filter(f => f.endsWith('.json'));
        if (sessionFiles.length === 0) return null;
        
        const conversations = [];
        
        for (const sessionFile of sessionFiles) {
            const sessionPath = path.join(chatSessionsPath, sessionFile);
            const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            
            if (!sessionData.requests || sessionData.requests.length === 0) continue;
            
            const exchanges = [];
            
            for (const req of sessionData.requests) {
                // Extract prompt
                const prompt = req.message?.text || req.message?.value || '';
                if (!prompt) continue;
                
                // Extract response - FIXED: prioritize 'value' field
                const textParts = req.response
                    ?.map(r => r.value || r.content || r.text)
                    .filter(Boolean) || [];
                
                const response = textParts.join('\n\n').trim();
                
                // Extract tools used
                const toolsUsed = req.response
                    ?.filter(r => r.kind === 'toolInvocationSerialized')
                    .map(r => r.value?.name)
                    .filter(Boolean) || [];
                
                // Count files edited
                const filesEditedCount = req.response
                    ?.filter(r => r.kind === 'textEditGroup')
                    .length || 0;
                
                exchanges.push({
                    prompt,
                    response,
                    timestamp: new Date(req.timestamp || Date.now()),
                    toolsUsed,
                    filesEditedCount,
                    modelUsed: req.modelId || 'Unknown'
                });
            }
            
            if (exchanges.length > 0) {
                conversations.push({
                    sessionId: path.basename(sessionFile, '.json'),
                    timestamp: new Date(sessionData.creationDate || Date.now()),
                    exchanges
                });
            }
        }
        
        return conversations.length > 0 ? conversations : null;
    } catch (error) {
        console.error(`   ❌ Error extracting chat sessions: ${error.message}`);
        return null;
    }
}

// --- PROCESS FOLDERS ---

console.log(`📋 Processing ${UNPROCESSED_FOLDERS.length} unprocessed folders...\n`);
console.log('═'.repeat(80) + '\n');

let processed = 0;
let skipped = 0;
let errors = 0;

for (const folderId of UNPROCESSED_FOLDERS) {
    const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folderId);
    const projectPath = getProjectPath(fullPath);
    const projectName = projectPath ? path.basename(projectPath) : 'Unknown';
    
    console.log(`📂 Processing: ${projectName}`);
    console.log(`   Workspace ID: ${folderId}`);
    
    try {
        // Check if already exists
        const existing = await Conversation.findOne({ workspaceId: folderId });
        if (existing) {
            console.log(`   ⚠️  Already in database - skipping\n`);
            skipped++;
            continue;
        }
        
        // Extract chat sessions
        const conversations = await extractChatSessions(fullPath);
        
        if (!conversations) {
            console.log(`   ❌ No valid chat data found\n`);
            skipped++;
            continue;
        }
        
        // Calculate stats
        const totalExchanges = conversations.reduce((sum, conv) => sum + conv.exchanges.length, 0);
        const allTimestamps = conversations.flatMap(c => c.exchanges.map(e => e.timestamp));
        const firstChatDate = new Date(Math.min(...allTimestamps.map(d => d.getTime())));
        const lastChatDate = new Date(Math.max(...allTimestamps.map(d => d.getTime())));
        
        // Detect tech stack
        const chatContent = conversations
            .flatMap(c => c.exchanges.map(e => e.prompt + ' ' + e.response))
            .join(' ');
        const techStack = detectTechStack(projectPath || '', chatContent);
        
        // Save to conversations collection
        const conversationDoc = new Conversation({
            projectName,
            projectPath: projectPath || 'Unknown',
            workspaceId: folderId,
            techStack,
            conversations,
            totalExchanges,
            firstChatDate,
            lastChatDate,
            extractedAt: new Date()
        });
        
        await conversationDoc.save();
        
        // Save to projects list collection
        const projectDoc = new ProjectsList({
            projectName,
            workspaceId: folderId,
            projectPath: projectPath || 'Unknown',
            techStack,
            totalExchanges,
            firstChatDate,
            lastChatDate,
            status: 'active'
        });
        
        await projectDoc.save();
        
        console.log(`   ✅ Processed: ${totalExchanges} exchanges`);
        console.log(`   📊 Tech: [${techStack.join(', ')}]`);
        console.log(`   📅 ${firstChatDate.toLocaleDateString()} - ${lastChatDate.toLocaleDateString()}\n`);
        
        processed++;
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
    }
}

console.log('═'.repeat(80));
console.log(`\n📊 FINAL SUMMARY:`);
console.log(`   ✅ Successfully processed: ${processed}`);
console.log(`   ⚠️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📝 Total attempted: ${UNPROCESSED_FOLDERS.length}\n`);

// Show updated totals
const totalConversations = await Conversation.countDocuments();
const totalProjects = await ProjectsList.countDocuments();

console.log(`🎯 UPDATED DATABASE:`);
console.log(`   Conversations: ${totalConversations}`);
console.log(`   Projects List: ${totalProjects}\n`);

await mongoose.disconnect();
console.log('✨ Done!');
