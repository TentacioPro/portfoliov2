import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

const WORKSPACE_STORAGE_ROOT = '../workspace-storage';

async function inspectChatStore() {
    const folders = fs.readdirSync(WORKSPACE_STORAGE_ROOT);
    
    for (const folder of folders.slice(0, 10)) {
        const dbPath = path.join(WORKSPACE_STORAGE_ROOT, folder, 'state.vscdb');
        
        if (fs.existsSync(dbPath)) {
            try {
                const db = await open({ filename: dbPath, driver: sqlite3.Database });
                
                // Get ChatSessionStore
                const row = await db.get("SELECT value FROM ItemTable WHERE key = 'chat.ChatSessionStore.index'");
                
                if (row && row.value) {
                    const data = JSON.parse(row.value);
                    console.log(`\n📂 ${folder}`);
                    console.log(`   Version: ${data.version}`);
                    console.log(`   Entries: ${data.entries?.length || 0}`);
                    
                    if (data.entries && data.entries.length > 0) {
                        const entry = data.entries[0];
                        console.log(`   Sample Entry Keys: ${Object.keys(entry).join(', ')}`);
                        console.log(`   Session ID: ${entry.sessionId}`);
                        console.log(`   Provider: ${entry.providerId}`);
                        console.log(`   Request Count: ${entry.requestCount || 0}`);
                        
                        // Try to load the actual session data
                        const sessionKey = `interactive-session-${entry.sessionId}`;
                        const sessionRow = await db.get("SELECT value FROM ItemTable WHERE key = ?", sessionKey);
                        
                        if (sessionRow) {
                            const session = JSON.parse(sessionRow.value);
                            console.log(`   ✅ Found session data!`);
                            console.log(`   Session Keys: ${Object.keys(session).join(', ')}`);
                            if (session.exchangeData && session.exchangeData.length > 0) {
                                console.log(`   Exchanges: ${session.exchangeData.length}`);
                                const exchange = session.exchangeData[0];
                                console.log(`   First Exchange Keys: ${Object.keys(exchange).join(', ')}`);
                                if (exchange.prompt) {
                                    console.log(`   Prompt preview: ${exchange.prompt.substring(0, 100)}...`);
                                }
                            }
                        }
                        
                        break; // Found one with data
                    }
                }
                
                await db.close();
            } catch (e) {
                // Skip errors silently
            }
        }
    }
}

inspectChatStore();
