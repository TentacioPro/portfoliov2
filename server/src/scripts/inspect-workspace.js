import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

const WORKSPACE_STORAGE_ROOT = '../workspace-storage';

async function inspectDatabase() {
    // Find first database with data
    const folders = fs.readdirSync(WORKSPACE_STORAGE_ROOT);
    
    for (const folder of folders.slice(0, 5)) { // Check first 5
        const dbPath = path.join(WORKSPACE_STORAGE_ROOT, folder, 'state.vscdb');
        
        if (fs.existsSync(dbPath)) {
            console.log(`\n📂 Inspecting: ${folder}`);
            console.log(`   DB Path: ${dbPath}\n`);
            
            try {
                const db = await open({ filename: dbPath, driver: sqlite3.Database });
                
                // Get all keys
                const keys = await db.all("SELECT key FROM ItemTable LIMIT 30");
                console.log(`   Found ${keys.length} keys:`);
                keys.forEach(k => console.log(`      - ${k.key}`));
                
                // Check for chat-related keys
                const chatKeys = await db.all("SELECT key, length(value) as len FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%copilot%' OR key LIKE '%conversation%'");
                if (chatKeys.length > 0) {
                    console.log(`\n   🎯 Chat-related keys:`);
                    for (const k of chatKeys) {
                        console.log(`      - ${k.key} (${k.len} bytes)`);
                        const row = await db.get("SELECT value FROM ItemTable WHERE key = ?", k.key);
                        if (row && row.value) {
                            try {
                                const parsed = JSON.parse(row.value);
                                console.log(`        Type: ${typeof parsed}, Keys: ${Object.keys(parsed).slice(0, 5).join(', ')}`);
                            } catch {
                                console.log(`        Raw value preview: ${row.value.substring(0, 100)}...`);
                            }
                        }
                    }
                }
                
                await db.close();
                break; // Only inspect first one with data
            } catch (e) {
                console.error(`   ❌ Error: ${e.message}`);
            }
        }
    }
}

inspectDatabase();
