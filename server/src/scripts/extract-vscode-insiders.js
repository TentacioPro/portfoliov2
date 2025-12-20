import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

const WORKSPACE_STORAGE_ROOT = '../workspace-storage/VSCODE INSIDERS NIGHTLY';
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';

await mongoose.connect(MONGO_URI);
console.log('🔗 Connected to MongoDB\n');
console.log('📂 Processing VS Code Insiders Nightly workspaces...\n');
console.log('═'.repeat(80) + '\n');

// Helper functions (same as main forensic script)
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
    if (combined.includes('ollama')) techStack.add('Ollama');
    if (combined.includes('kiro')) techStack.add('KIRO Agent');
    if (combined.includes('extension')) techStack.add('VS Code Extension');
    
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
                const prompt = req.message?.text || req.message?.value || '';
                if (!prompt) continue;
                
                const textParts = req.response
                    ?.map(r => r.value || r.content || r.text)
                    .filter(Boolean) || [];
                
                const response = textParts.join('\n\n').trim();
                if (!response) continue;
                
                const toolsUsed = req.response
                    ?.filter(r => r.kind === 'toolInvocationSerialized')
                    .map(r => r.value?.name)
                    .filter(Boolean) || [];
                
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

// Get all folders
const allFolders = fs.readdirSync(WORKSPACE_STORAGE_ROOT)
    .filter(f => {
        const fullPath = path.join(WORKSPACE_STORAGE_ROOT, f);
        return fs.statSync(fullPath).isDirectory();
    });

console.log(`📊 Found ${allFolders.length} workspace folders\n`);

let processed = 0;
let skipped = 0;
let errors = 0;

for (const folderId of allFolders) {
    const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folderId);
    const projectPath = getProjectPath(fullPath);
    const projectName = projectPath ? path.basename(projectPath) : 'Unknown';
    
    console.log(`📂 Processing: ${projectName} (Insiders)`);
    console.log(`   Workspace ID: ${folderId}`);
    
    try {
        // Check if already exists
        const existing = await Conversation.findOne({ workspaceId: folderId, projectName: { $regex: /Insiders/i } });
        if (existing) {
            console.log(`   ⚠️  Already in database - skipping\n`);
            skipped++;
            continue;
        }
        
        // Extract chat sessions
        const conversations = await extractChatSessions(fullPath);
        
        if (!conversations) {
            console.log(`   ⚠️  No valid chat data\n`);
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
            .join(' ')
            .substring(0, 10000);
        const techStack = detectTechStack(projectPath || '', chatContent);
        
        // Add "VS Code Insiders" identifier to project name
        const enhancedProjectName = `${projectName} (VS Code Insiders)`;
        
        // Save to conversations collection
        const conversationDoc = new Conversation({
            projectName: enhancedProjectName,
            projectPath: projectPath || 'Unknown',
            workspaceId: `insiders-${folderId}`,
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
            workspaceId: `insiders-${folderId}`,
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
console.log(`\n📊 VS CODE INSIDERS SUMMARY:`);
console.log(`   ✅ Successfully processed: ${processed}`);
console.log(`   ⚠️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📝 Total attempted: ${allFolders.length}\n`);

// Show updated totals
const totalConversations = await Conversation.countDocuments();
const totalProjects = await ProjectsList.countDocuments();

console.log(`🎯 UPDATED DATABASE:`);
console.log(`   Conversations: ${totalConversations}`);
console.log(`   Projects List: ${totalProjects}\n`);

await mongoose.disconnect();
console.log('✨ Done!');
