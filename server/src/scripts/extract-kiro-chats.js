import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

const KIRO_ROOT = '../workspace-storage/KIRO/globalStorage/kiro.kiroagent';
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

await mongoose.connect(MONGO_URI);
console.log('🔗 Connected to MongoDB\n');
console.log('📂 Processing KIRO Agent conversations...\n');
console.log('═'.repeat(80) + '\n');

function detectTechStack(projectPath, chatContent = '') {
    const techStack = new Set();
    const combined = (projectPath + ' ' + chatContent).toLowerCase();
    
    if (combined.includes('react')) techStack.add('React');
    if (combined.includes('express')) techStack.add('Express');
    if (combined.includes('mongodb') || combined.includes('mongoose')) techStack.add('MongoDB');
    if (combined.includes('postgresql') || combined.includes('postgres')) techStack.add('PostgreSQL');
    if (combined.includes('tailwind')) techStack.add('Tailwind CSS');
    if (combined.includes('typescript')) techStack.add('TypeScript');
    if (combined.includes('vite')) techStack.add('Vite');
    if (combined.includes('docker')) techStack.add('Docker');
    if (combined.includes('python')) techStack.add('Python');
    if (combined.includes('ollama')) techStack.add('Ollama');
    if (combined.includes('kiro')) techStack.add('KIRO Agent');
    if (combined.includes('extension')) techStack.add('VS Code Extension');
    if (combined.includes('lancedb')) techStack.add('LanceDB');
    
    return Array.from(techStack);
}

// Get all workspace folders
const workspaceFolders = fs.readdirSync(KIRO_ROOT)
    .filter(f => {
        const fullPath = path.join(KIRO_ROOT, f);
        return fs.statSync(fullPath).isDirectory();
    });

console.log(`📊 Found ${workspaceFolders.length} KIRO workspace folders\n`);

let processed = 0;
let skipped = 0;
let errors = 0;
let totalChatFiles = 0;

for (const workspaceId of workspaceFolders) {
    const workspacePath = path.join(KIRO_ROOT, workspaceId);
    
    // Find all .chat files in this workspace
    const chatFiles = fs.readdirSync(workspacePath)
        .filter(f => f.endsWith('.chat'));
    
    if (chatFiles.length === 0) {
        console.log(`📂 ${workspaceId}: No chat files\n`);
        skipped++;
        continue;
    }
    
    totalChatFiles += chatFiles.length;
    console.log(`📂 Workspace: ${workspaceId}`);
    console.log(`   Chat files: ${chatFiles.length}`);
    
    try {
        const conversations = [];
        let projectName = 'KIRO Agent Project';
        let projectPath = workspaceId;
        
        for (const chatFileName of chatFiles) {
            const chatFilePath = path.join(workspacePath, chatFileName);
            const chatData = JSON.parse(fs.readFileSync(chatFilePath, 'utf8'));
            
            // Extract chat messages
            if (!chatData.chat || !Array.isArray(chatData.chat) || chatData.chat.length === 0) {
                continue;
            }
            
            // Extract project context from metadata or context
            if (chatData.context && chatData.context.workspaceFolder) {
                projectPath = chatData.context.workspaceFolder;
                projectName = path.basename(projectPath);
            } else if (chatData.metadata && chatData.metadata.projectName) {
                projectName = chatData.metadata.projectName;
            }
            
            // Parse chat exchanges
            const exchanges = [];
            let currentPrompt = '';
            
            for (let i = 0; i < chatData.chat.length; i++) {
                const message = chatData.chat[i];
                
                if (message.role === 'human') {
                    currentPrompt = message.content || '';
                } else if (message.role === 'bot' && currentPrompt) {
                    const response = message.content || '';
                    
                    if (response && !response.startsWith('# Identity')) { // Skip system prompts
                        exchanges.push({
                            prompt: currentPrompt.substring(0, 5000), // Limit size
                            response: response.substring(0, 10000), // Limit size
                            timestamp: new Date(chatData.metadata?.createdAt || Date.now()),
                            toolsUsed: message.tool?.length > 0 ? ['KIRO Tool'] : [],
                            filesEditedCount: 0,
                            modelUsed: chatData.metadata?.modelId || 'KIRO Agent'
                        });
                    }
                    
                    currentPrompt = '';
                } else if (message.role === 'tool') {
                    // Tool execution results - could be parsed for file edits
                    if (exchanges.length > 0) {
                        exchanges[exchanges.length - 1].toolsUsed.push(message.content?.name || 'Tool');
                    }
                }
            }
            
            if (exchanges.length > 0) {
                conversations.push({
                    sessionId: path.basename(chatFileName, '.chat'),
                    timestamp: new Date(chatData.metadata?.createdAt || Date.now()),
                    exchanges
                });
            }
        }
        
        if (conversations.length === 0) {
            console.log(`   ⚠️  No valid conversations extracted\n`);
            skipped++;
            continue;
        }
        
        // Calculate stats
        const totalExchanges = conversations.reduce((sum, conv) => sum + conv.exchanges.length, 0);
        const allTimestamps = conversations.flatMap(c => c.exchanges.map(e => e.timestamp));
        const firstChatDate = new Date(Math.min(...allTimestamps.map(d => d.getTime())));
        const lastChatDate = new Date(Math.max(...allTimestamps.map(d => d.getTime())));
        
        // Detect tech stack from chat content
        const chatContent = conversations
            .flatMap(c => c.exchanges.map(e => e.prompt + ' ' + e.response))
            .join(' ')
            .substring(0, 10000);
        const techStack = detectTechStack(projectPath, chatContent);
        
        // Add "KIRO Agent" identifier
        const enhancedProjectName = `${projectName} (KIRO Agent)`;
        
        // Check if already exists
        const existing = await Conversation.findOne({ workspaceId: `kiro-${workspaceId}` });
        if (existing) {
            console.log(`   ⚠️  Already in database - skipping\n`);
            skipped++;
            continue;
        }
        
        // Save to conversations collection
        const conversationDoc = new Conversation({
            projectName: enhancedProjectName,
            projectPath,
            workspaceId: `kiro-${workspaceId}`,
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
            projectName: enhancedProjectName,
            workspaceId: `kiro-${workspaceId}`,
            projectPath,
            techStack,
            totalExchanges,
            firstChatDate,
            lastChatDate,
            status: 'active'
        });
        
        await projectDoc.save();
        
        console.log(`   ✅ Processed: ${totalExchanges} exchanges from ${conversations.length} sessions`);
        console.log(`   📊 Tech: [${techStack.join(', ')}]`);
        console.log(`   📅 ${firstChatDate.toLocaleDateString()} - ${lastChatDate.toLocaleDateString()}\n`);
        
        processed++;
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
    }
}

console.log('═'.repeat(80));
console.log(`\n📊 KIRO AGENT SUMMARY:`);
console.log(`   ✅ Successfully processed: ${processed} workspaces`);
console.log(`   📁 Total chat files: ${totalChatFiles}`);
console.log(`   ⚠️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📝 Total attempted: ${workspaceFolders.length}\n`);

// Show updated totals
const totalConversations = await Conversation.countDocuments();
const totalProjects = await ProjectsList.countDocuments();
const totalExchangesResult = await Conversation.aggregate([
    { $group: { _id: null, total: { $sum: '$totalExchanges' } } }
]);
const totalExchanges = totalExchangesResult[0]?.total || 0;

console.log(`🎯 FINAL DATABASE STATE:`);
console.log(`   Conversations: ${totalConversations}`);
console.log(`   Projects List: ${totalProjects}`);
console.log(`   Total Exchanges: ${totalExchanges}\n`);

await mongoose.disconnect();
console.log('✨ Done!');
