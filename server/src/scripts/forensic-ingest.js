import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mongoose from 'mongoose';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';

// --- CONFIGURATION ---
const WORKSPACE_STORAGE_ROOT = '../workspace-storage'; // VS Code workspace storage location
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';
const QDRANT_URL = 'http://localhost:6333';

// --- DATABASE SETUP ---
const qdrant = new QdrantClient({ url: QDRANT_URL });

// --- HELPER: Extract Chat from Chat Sessions (Chat-Friendly Format) ---
async function extractChatSessions(workspaceFolder) {
    try {
        const chatSessionsPath = path.join(workspaceFolder, 'chatSessions');
        
        if (!fs.existsSync(chatSessionsPath)) {
            return null;
        }
        
        const sessionFiles = fs.readdirSync(chatSessionsPath).filter(f => f.endsWith('.json'));
        
        if (sessionFiles.length === 0) {
            return null;
        }
        
        const conversations = [];
        
        for (const file of sessionFiles) {
            const filePath = path.join(chatSessionsPath, file);
            const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            
            // Extract exchanges in chat format
            if (sessionData.requests && sessionData.requests.length > 0) {
                const exchanges = [];
                
                for (const req of sessionData.requests) {
                    const prompt = req.message?.text || '';
                    
                    // Extract response text from Copilot (stored in 'value' field)
                    let response = '';
                    if (req.response && Array.isArray(req.response)) {
                        const textParts = req.response
                            .map(r => r.value || r.content || r.text)
                            .filter(Boolean);
                        response = textParts.join('\n\n');
                    }
                    
                    // Extract tools used
                    const toolsUsed = req.response
                        ?.filter(r => r.kind === 'toolInvocationSerialized')
                        .map(t => t.toolId) || [];
                    
                    // Count edited files (avoid parsing complexity)
                    const filesEditedCount = req.editedFileEvents ? 
                        (Array.isArray(req.editedFileEvents) ? req.editedFileEvents.length : 0) : 0;
                    
                    exchanges.push({
                        prompt,
                        response,
                        timestamp: new Date(req.timestamp),
                        toolsUsed,
                        filesEditedCount,
                        modelUsed: req.modelId || 'unknown'
                    });
                }
                
                if (exchanges.length > 0) {
                    conversations.push({
                        sessionId: sessionData.sessionId,
                        timestamp: new Date(sessionData.creationDate),
                        exchanges
                    });
                }
            }
        }
        
        return conversations.length > 0 ? conversations : null;
    } catch (e) {
        console.error(`   ⚠️  Chat extraction error: ${e.message}`);
        return null;
    }
}

// --- HELPER: Find Real Project Path ---
function getProjectPath(folderPath) {
    try {
        if (fs.existsSync(path.join(folderPath, 'workspace.json'))) {
            const data = JSON.parse(fs.readFileSync(path.join(folderPath, 'workspace.json')));
            // Handle "folder": "file:///D%3A/Projects/..." format
            let uri = data.folder || data.configuration;
            if (uri) {
                return decodeURIComponent(uri.replace('file:///', '')).replace(/\//g, '\\');
            }
        }
    } catch (e) {}
    return "Unknown Project";
}

// --- HELPER: Guess Tech Stack from Path ---
function guessTechStack(projectPath, chatSessions) {
    const techStack = new Set();
    const pathLower = projectPath.toLowerCase();
    
    // From path
    if (pathLower.includes('react')) techStack.add('React');
    if (pathLower.includes('nextjs') || pathLower.includes('next.js')) techStack.add('Next.js');
    if (pathLower.includes('node')) techStack.add('Node.js');
    if (pathLower.includes('python')) techStack.add('Python');
    if (pathLower.includes('django')) techStack.add('Django');
    if (pathLower.includes('flask')) techStack.add('Flask');
    if (pathLower.includes('vue')) techStack.add('Vue.js');
    if (pathLower.includes('angular')) techStack.add('Angular');
    
    // From chat content (look at prompts/responses)
    if (chatSessions) {
        const allText = chatSessions
            .flatMap(s => s.exchanges)
            .flatMap(e => [e.prompt, e.response])
            .join(' ')
            .toLowerCase();
        
        if (allText.includes('express')) techStack.add('Express');
        if (allText.includes('mongodb')) techStack.add('MongoDB');
        if (allText.includes('postgres')) techStack.add('PostgreSQL');
        if (allText.includes('tailwind')) techStack.add('Tailwind CSS');
        if (allText.includes('typescript')) techStack.add('TypeScript');
        if (allText.includes('vite')) techStack.add('Vite');
        if (allText.includes('docker')) techStack.add('Docker');
    }
    
    return Array.from(techStack);
}

// --- MAIN EXECUTION ---
async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Connected to MongoDB");
    
    // Clear existing conversations
    await Conversation.deleteMany({});
    console.log("🗑️  Cleared old conversations\n");

    const folders = fs.readdirSync(WORKSPACE_STORAGE_ROOT);
    console.log(`📂 Scanning ${folders.length} workspace folders...\n`);

    let count = 0;
    let skipped = 0;

    for (const folder of folders) {
        const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folder);

        // Extract project info
        const realPath = getProjectPath(fullPath);
        const projectName = path.basename(realPath);

        // Skip empty/unknown projects
        if (projectName === "Unknown Project" || projectName === "") {
            skipped++;
            continue;
        }

        console.log(`📁 [${count + 1}/${folders.length}] ${projectName}`);

        // Extract Chat Sessions
        const conversations = await extractChatSessions(fullPath);
        
        if (!conversations || conversations.length === 0) {
            console.log(`   ⚠️  No chat data found\n`);
            skipped++;
            continue;
        }

        // Calculate stats
        const totalExchanges = conversations.reduce((sum, c) => sum + c.exchanges.length, 0);
        const allDates = conversations.map(c => c.timestamp);
        const firstChat = new Date(Math.min(...allDates));
        const lastChat = new Date(Math.max(...allDates));
        
        // Guess tech stack
        const techStack = guessTechStack(realPath, conversations);
        
        console.log(`   ✅ ${conversations.length} sessions, ${totalExchanges} exchanges`);
        console.log(`   📅 ${firstChat.toLocaleDateString()} → ${lastChat.toLocaleDateString()}`);
        if (techStack.length > 0) {
            console.log(`   🛠️  ${techStack.join(', ')}`);
        }

        // Save to MongoDB
        await Conversation.create({
            projectName,
            projectPath: realPath,
            workspaceId: folder,
            techStack,
            conversations,
            totalExchanges,
            firstChatDate: firstChat,
            lastChatDate: lastChat,
            extractedAt: new Date()
        });

        count++;
        console.log('');
    }

    console.log(`\n✨ Done! Imported ${count} projects with chat history`);
    console.log(`⚠️  Skipped ${skipped} projects without chat data`);
    
    // List folders without data
    console.log('\n📋 Folders without chat data:');
    const allFolders = fs.readdirSync(WORKSPACE_STORAGE_ROOT);
    const foldersWithoutData = [];
    
    for (const folder of allFolders) {
        const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folder);
        const chatSessionsPath = path.join(fullPath, 'chatSessions');
        
        if (!fs.existsSync(chatSessionsPath) || fs.readdirSync(chatSessionsPath).filter(f => f.endsWith('.json')).length === 0) {
            const realPath = getProjectPath(fullPath);
            const projectName = path.basename(realPath);
            if (projectName !== 'Unknown Project' && projectName !== '') {
                foldersWithoutData.push(projectName);
            }
        }
    }
    
    console.log(foldersWithoutData.join('\n'));
    console.log(`\n📊 Total: ${foldersWithoutData.length} folders without chat history`);
    
    mongoose.disconnect();
}

main().catch(console.error);