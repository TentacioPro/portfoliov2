import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

const WORKSPACE_STORAGE_ROOT = '../workspace-storage';
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

await mongoose.connect(MONGO_URI);
console.log('🔗 Connected to MongoDB\n');

// Get all workspace folders
const allFolders = fs.readdirSync(WORKSPACE_STORAGE_ROOT)
    .filter(f => {
        const fullPath = path.join(WORKSPACE_STORAGE_ROOT, f);
        return fs.statSync(fullPath).isDirectory();
    });

console.log(`📂 Total workspace folders: ${allFolders.length}\n`);

// Get already processed workspace IDs
const processed = await Conversation.find({}, { workspaceId: 1 });
const processedIds = new Set(processed.map(p => p.workspaceId));

console.log(`✅ Already processed: ${processedIds.size}\n`);
console.log('═'.repeat(80) + '\n');

// Helper functions
function getProjectPath(workspacePath) {
    try {
        const workspaceJsonPath = path.join(workspacePath, 'workspace.json');
        if (!fs.existsSync(workspaceJsonPath)) return null;
        
        const workspaceData = JSON.parse(fs.readFileSync(workspaceJsonPath, 'utf8'));
        if (workspaceData.folder) {
            const uri = decodeURIComponent(workspaceData.folder);
            return uri.replace(/^file:\/\/\//, '').replace(/^vscode-remote:\\\\wsl\+[^\\]+/, 'wsl:');
        }
    } catch (error) {
        return null;
    }
    return null;
}

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
    if (combined.includes('django')) techStack.add('Django');
    if (combined.includes('flask')) techStack.add('Flask');
    if (combined.includes('next')) techStack.add('Next.js');
    if (combined.includes('node')) techStack.add('Node.js');
    if (combined.includes('angular')) techStack.add('Angular');
    if (combined.includes('vue')) techStack.add('Vue.js');
    if (combined.includes('n8n')) techStack.add('N8N');
    if (combined.includes('metabase')) techStack.add('Metabase');
    
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
                
                // Extract response - prioritize 'value' field
                const textParts = req.response
                    ?.map(r => r.value || r.content || r.text)
                    .filter(Boolean) || [];
                
                const response = textParts.join('\n\n').trim();
                if (!response) continue; // Skip if no response
                
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
        return null;
    }
}

// Process all unprocessed folders
let newlyProcessed = 0;
let skippedNoData = 0;
let skippedAlreadyProcessed = 0;
let errors = 0;

for (const folderId of allFolders) {
    const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folderId);
    
    // Skip if already processed
    if (processedIds.has(folderId)) {
        skippedAlreadyProcessed++;
        continue;
    }
    
    const projectPath = getProjectPath(fullPath);
    const projectName = projectPath ? path.basename(projectPath) : 'Unknown';
    
    console.log(`📂 Checking: ${projectName} (${folderId.substring(0, 8)}...)`);
    
    try {
        // Extract chat sessions
        const conversations = await extractChatSessions(fullPath);
        
        if (!conversations) {
            console.log(`   ⚠️  No valid chat data\n`);
            skippedNoData++;
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
            .join(' ')
            .substring(0, 10000); // Limit to avoid memory issues
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
        
        console.log(`   ✅ PROCESSED: ${totalExchanges} exchanges`);
        console.log(`   📊 Tech: [${techStack.join(', ') || 'None detected'}]`);
        console.log(`   📅 ${firstChatDate.toLocaleDateString()} - ${lastChatDate.toLocaleDateString()}\n`);
        
        newlyProcessed++;
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
        errors++;
    }
}

console.log('═'.repeat(80));
console.log(`\n📊 VERIFICATION COMPLETE:`);
console.log(`   ✅ Newly processed: ${newlyProcessed}`);
console.log(`   ⏭️  Already in DB: ${skippedAlreadyProcessed}`);
console.log(`   ⚠️  No chat data: ${skippedNoData}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📝 Total folders checked: ${allFolders.length}\n`);

// Show updated database stats
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

// Show top 10 projects
console.log(`🏆 TOP 10 PROJECTS BY ACTIVITY:`);
const topProjects = await ProjectsList.find({}, { projectName: 1, totalExchanges: 1, techStack: 1, _id: 0 })
    .sort({ totalExchanges: -1 })
    .limit(10);

topProjects.forEach((p, idx) => {
    console.log(`   ${idx + 1}. ${p.projectName} - ${p.totalExchanges} exchanges - [${(p.techStack || []).join(', ')}]`);
});

await mongoose.disconnect();
console.log('\n✨ Complete!');
