import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import mongoose from 'mongoose';
import { QdrantClient } from '@qdrant/js-client-rest';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
const WORKSPACE_STORAGE_ROOT = '../workspace-storage'; // VS Code workspace storage location
const MONGO_URI = 'mongodb://localhost:27017/secondbrain';
const QDRANT_URL = 'http://localhost:6333';

// --- DATABASE SETUP ---
const qdrant = new QdrantClient({ url: QDRANT_URL });

const ProjectSchema = new mongoose.Schema({
    name: String,
    originalPath: String,
    workspaceId: String,
    chatHistory: [Object], // Store raw chat sessions here
    extractedPrompts: [String], // We will populate this later
    techStack: [String],
    complexity: Number,
    lastModified: Date
});
const Project = mongoose.model('Project', ProjectSchema);

// --- HELPER: Extract Chat from Chat Sessions ---
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
        
        const allSessions = [];
        
        for (const file of sessionFiles) {
            const filePath = path.join(chatSessionsPath, file);
            const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            
            // Extract key information
            if (sessionData.requests && sessionData.requests.length > 0) {
                const session = {
                    sessionId: sessionData.sessionId,
                    creationDate: new Date(sessionData.creationDate),
                    lastMessageDate: new Date(sessionData.lastMessageDate),
                    exchangeCount: sessionData.requests.length,
                    exchanges: sessionData.requests.map(req => ({
                        prompt: req.message?.text || '',
                        timestamp: new Date(req.timestamp),
                        agent: req.agent?.fullName || 'GitHub Copilot',
                        modelId: req.modelId || '',
                        tools: req.response?.filter(r => r.kind === 'toolInvocationSerialized').map(t => t.toolId) || [],
                        hasEdits: req.editedFileEvents?.length > 0 || false
                    }))
                };
                allSessions.push(session);
            }
        }
        
        return allSessions.length > 0 ? allSessions : null;
    } catch (e) {
        console.error(`   ⚠️  Chat extraction error: ${e.message}`);
    }
    return null;
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

// --- MAIN EXECUTION ---
async function main() {
    await mongoose.connect(MONGO_URI);
    console.log("🔌 Connected to MongoDB");

    const folders = fs.readdirSync(WORKSPACE_STORAGE_ROOT);
    console.log(`📂 Scanning ${folders.length} workspace folders...`);

    let count = 0;

    for (const folder of folders) {
        const fullPath = path.join(WORKSPACE_STORAGE_ROOT, folder);
        const dbPath = path.join(fullPath, 'state.vscdb');

        if (fs.existsSync(dbPath)) {
            const realPath = getProjectPath(fullPath);
            const projectName = path.basename(realPath);

            // Skip empty/unknown projects
            if (projectName === "Unknown Project" || projectName === "") continue;

            console.log(`   🔍 Analyzing: ${projectName} (${folder})`);

            // 1. Extract Chat Sessions
            const chatSessions = await extractChatSessions(fullPath);
            
            if (chatSessions && chatSessions.length > 0) {
                const totalExchanges = chatSessions.reduce((sum, s) => sum + s.exchangeCount, 0);
                console.log(`      ✅ Found ${chatSessions.length} chat sessions with ${totalExchanges} exchanges!`);
                
                // Extract prompts for analysis
                const prompts = chatSessions.flatMap(s => s.exchanges.map(e => e.prompt)).filter(p => p.length > 10);
                
                // 2. Save to MongoDB
                await Project.findOneAndUpdate(
                    { workspaceId: folder },
                    {
                        name: projectName,
                        originalPath: realPath,
                        workspaceId: folder,
                        chatHistory: chatSessions, // Store sessions with full metadata
                        extractedPrompts: prompts, // Just the prompts for easy searching
                        lastModified: new Date()
                    },
                    { upsert: true }
                );
                count++;
            }
        }
    }

    console.log(`\n✨ Done! Imported chat history for ${count} projects.`);
    process.exit(0);
}

main();