# Second Brain Setup Guide
*Complete step-by-step guide to extract AI chat data and populate databases*

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Configuration](#database-configuration)
4. [Data Extraction Paths](#data-extraction-paths)
5. [Running Extraction Scripts](#running-extraction-scripts)
6. [Verification](#verification)
7. [Viewing the Data](#viewing-the-data)
8. [Database Backup & Restore](#database-backup--restore)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js v20+** - JavaScript runtime
- **Docker Desktop** - For MongoDB, Redis, Qdrant containers
- **Git** - Version control
- **SQLite3** - For KIRO database access (optional, included in `/sqlite` folder)

### Check Installations
```powershell
node --version        # Should show v20.x.x or higher
docker --version      # Should show Docker version
git --version         # Should show git version
```

---

## Project Setup

### 1. Clone and Install Dependencies

```powershell
# Navigate to project directory
cd "D:\My Projects\ExperimentalPortfolio"

# Install server dependencies
cd server
npm install

# Install client dependencies (optional - for frontend)
cd ../client
npm install
cd ..
```

### 2. Start Docker Services

```powershell
# From project root
docker-compose up -d

# Verify services are running
docker ps

# Expected output:
# - experimentalportfolio-mongo-1    (port 27017)
# - experimentalportfolio-vector-1   (port 6333 - Qdrant)
# - experimentalportfolio-cache-1    (port 6379 - Redis)
```

### 3. Verify Docker Services

```powershell
# Test MongoDB connection
docker exec experimentalportfolio-mongo-1 mongosh --eval "db.version()"

# Test Qdrant connection
curl http://localhost:6333
```

---

## Database Configuration

### Environment Variables
Create `.env` file in `/server` directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/secondbrain

# Qdrant
QDRANT_URL=http://localhost:6333

# Node.js
NODE_ENV=development
```

### MongoDB Collections
The scripts will automatically create these collections:
- `conversations` - AI chat history with exchanges
- `projectslists` - Project metadata and statistics

---

## Data Extraction Paths

### Configure Paths in Scripts

The data extraction scripts need to know where your AI chat data is stored:

**Your Source Data Locations:**
```
GitHub Copilot (VS Code):
C:\Users\Abishek\AppData\Roaming\Code\User\workspaceStorage

KIRO Agent:
C:\Users\Abishek\AppData\Roaming\Kiro\User\globalStorage\kiro.kiroagent
```

### Option 1: Copy Data to Project (Recommended)

```powershell
# From project root
mkdir workspace-storage

# Copy VS Code workspace data
xcopy "C:\Users\Abishek\AppData\Roaming\Code\User\workspaceStorage" "workspace-storage\VSCODE\" /E /I /H

# Copy KIRO data
xcopy "C:\Users\Abishek\AppData\Roaming\Kiro\User\globalStorage\kiro.kiroagent" "workspace-storage\KIRO\globalStorage\kiro.kiroagent\" /E /I /H
```

### Option 2: Update Script Paths (Alternative)

If you prefer to read directly from AppData, update these constants in the scripts:

**In `server/src/scripts/forensic-ingest.js`:**
```javascript
const BASE_STORAGE_PATH = 'C:\\Users\\Abishek\\AppData\\Roaming\\Code\\User\\workspaceStorage';
```

**In `server/src/scripts/extract-kiro-chats.js`:**
```javascript
const KIRO_BASE = 'C:\\Users\\Abishek\\AppData\\Roaming\\Kiro\\User\\globalStorage\\kiro.kiroagent';
```

**In `server/src/scripts/extract-kiro-vectors.js`:**
```javascript
const SQLITE_PATH = 'C:\\Users\\Abishek\\AppData\\Roaming\\Kiro\\User\\globalStorage\\kiro.kiroagent\\index\\index.sqlite';
```

**In `server/src/scripts/extract-large-kiro-workspaces.js`:**
```javascript
const KIRO_BASE = 'C:\\Users\\Abishek\\AppData\\Roaming\\Kiro\\User\\globalStorage\\kiro.kiroagent';
```

---

## Running Extraction Scripts

### Execution Order (Important!)

Run the scripts in this exact order from the `/server` directory:

```powershell
cd server
```

### Step 1: Extract GitHub Copilot Data
**Time: ~1-2 minutes**

```powershell
node src/scripts/forensic-ingest.js
```

**Expected Output:**
```
🔗 Connected to MongoDB
📊 Found X workspace folders
✅ Successfully processed: Y projects
🎯 UPDATED DATABASE: Conversations: Y, Projects List: Y
```

**What it does:**
- Scans VS Code workspace storage
- Extracts chat sessions from `chatSessions/*.json` files
- Detects technology stack (React, Express, MongoDB, etc.)
- Stores in MongoDB collections

### Step 2: Extract KIRO Chat Conversations (Small Workspaces)
**Time: ~3-5 minutes**

```powershell
node src/scripts/extract-kiro-chats.js
```

**Expected Output:**
```
📂 Processing KIRO Agent conversations...
✅ Successfully processed: 16 workspaces
📁 Total chat files: 13,222
❌ Errors: 2 (buffer overflow - will fix in next step)
🎯 FINAL DATABASE STATE: Conversations: 79
```

**What it does:**
- Parses KIRO .chat files (role-based format)
- Extracts human/bot/tool message exchanges
- Filters system prompts
- Saves to MongoDB

### Step 3: Extract KIRO Large Workspaces (Buffer Overflow Fix)
**Time: ~10-15 minutes**

```powershell
node --expose-gc src/scripts/extract-large-kiro-workspaces.js
```

**Expected Output:**
```
📂 Workspace: 7281ebd028e3cd673114e7354cbcbf6e
   Progress: 550/5949 files...
   ✅ Processed: 16,675 exchanges

📂 Workspace: 8856313c3aa3201dde31fdf9bdad594e
   ✅ Processed: 21,023 exchanges

📊 LARGE WORKSPACE SUMMARY:
   ✅ Successfully processed: 22
🎯 FINAL DATABASE STATE: Conversations: 101
```

**What it does:**
- Handles large workspaces (5,000+ files each)
- Streaming processing to avoid memory issues
- Splits into 500-session chunks for MongoDB
- Extracts remaining ~37,698 exchanges

### Step 4: Extract Code Vectors to Qdrant
**Time: ~2-3 minutes**

```powershell
node src/scripts/extract-kiro-vectors.js
```

**Expected Output:**
```
📊 Found 125,413 vectors in KIRO database
📤 Starting full extraction to Qdrant...
   Processed: 100/125413 (0.1%) | Rate: 1000 vectors/sec
   ...
✅ Extraction complete!
   Processed: 125,413 vectors
   Average Rate: 908 vectors/sec
📊 Qdrant Collection Info:
   Points: 125,413
```

**What it does:**
- Reads pre-computed embeddings from KIRO's SQLite database
- Parses 384-dimensional vectors (all-MiniLM-L6-v2)
- Uploads to Qdrant in batches of 100
- Enables semantic code search

### Step 5: Verify Semantic Search (Optional)
**Time: ~30 seconds**

```powershell
node src/scripts/test-semantic-search.js
```

**Expected Output:**
```
🔍 Running semantic search tests...

📝 Query: "authentication login user credentials"
1. Score: 0.5535
   File: d:\Projects\...\credentials.py
   Lines: 20-21
   Content: class CredentialsImpl...
```

**What it does:**
- Tests semantic search on extracted vectors
- Runs sample queries
- Verifies Qdrant integration works

### Step 6: Generate Statistics Report (Optional)
**Time: ~5 seconds**

```powershell
node src/scripts/generate-report.js
```

**Expected Output:**
```
📊 Second Brain Database Report
Total Projects: 101
Total Exchanges: 51,160
Technology Distribution:
  - Tailwind CSS: 20 projects
  - Express: 19 projects
  ...
```

---

## Verification

### Check MongoDB Data

```powershell
# Connect to MongoDB
docker exec -it experimentalportfolio-mongo-1 mongosh secondbrain

# Check conversation count
db.conversations.countDocuments()
# Expected: 101

# Check total exchanges
db.conversations.aggregate([{$group: {_id: null, total: {$sum: "$totalExchanges"}}}])
# Expected: 51,160

# View sample project
db.conversations.findOne({}, {projectName: 1, totalExchanges: 1, techStack: 1})

# List top projects
db.conversations.find({}, {projectName: 1, totalExchanges: 1}).sort({totalExchanges: -1}).limit(10)

# Exit
exit
```

### Check Qdrant Vectors

```powershell
# Check collection info
curl http://localhost:6333/collections/kiro-code-vectors

# Expected JSON response with:
# "points_count": 125413
# "vectors_count": 125413
```

### Expected Final State

| Metric | Value |
|--------|-------|
| **MongoDB Conversations** | 101 documents |
| **MongoDB Projects** | 101 |
| **Total Exchanges** | 51,160 |
| **Qdrant Vectors** | 125,413 |
| **Vector Dimensions** | 384 |
| **Collection Name** | kiro-code-vectors |

---

## Viewing the Data

### Start the Server

```powershell
cd server
node index.js
```

**Expected Output:**
```
🚀 Server running on http://localhost:3000
📊 MongoDB connected
```

### API Endpoints

**View all conversations:**
```
GET http://localhost:3000/api/conversations
```

**View specific conversation:**
```
GET http://localhost:3000/api/conversations/:id
```

**List all projects:**
```
GET http://localhost:3000/api/projects/list
```

**Project statistics:**
```
GET http://localhost:3000/api/projects/list/stats
```

### Test with cURL

```powershell
# Get conversation count
curl http://localhost:3000/api/conversations | ConvertFrom-Json | Select-Object -ExpandProperty length

# Get project names
curl http://localhost:3000/api/projects/list/names
```

### Start Frontend (Optional)

```powershell
cd client
npm run dev
```

Visit: `http://localhost:5173`

---

## Database Backup & Restore

### Export All Collections

Exports all MongoDB collections to JSON files in `data/exports/`:

```powershell
cd server
node src/scripts/export-mongo.js
```

**Output:**
```
📁 Created exports directory: d:\My Projects\ExperimentalPortfolio\data\exports
💾 Exported: projectslists (101 documents)
💾 Exported: neuralarchives (2 documents)
💾 Exported: rawconversations (13520 documents)
💾 Exported: conversations (101 documents)
✅ Export complete: 4 collections
```

### Restore a Collection

Import a JSON file into a new or existing collection:

```powershell
# Basic usage
node src/scripts/import-mongo.js <json-file> <collection-name>

# Example: Restore rawconversations to a new collection
node src/scripts/import-mongo.js ../data/exports/rawconversations.json neuralarchiveRaw

# Force overwrite existing collection
node src/scripts/import-mongo.js ../data/exports/rawconversations.json neuralarchiveRaw --force
```

**Options:**
- `--force` - Drop existing collection before import

---

## Troubleshooting

### Issue: "Cannot find module 'mongoose'"

**Solution:**
```powershell
cd server
npm install
```

### Issue: "MongoDB connection failed"

**Solution:**
```powershell
# Restart Docker containers
docker-compose down
docker-compose up -d

# Wait 10 seconds, then check
docker ps
```

### Issue: "buffer overflow" or "offset out of range"

**Solution:**
This is expected for large KIRO workspaces. Use the dedicated script:
```powershell
node --expose-gc src/scripts/extract-large-kiro-workspaces.js
```

### Issue: "SQLite database locked"

**Solution:**
Close any SQLite browser tools, then:
```powershell
# Kill node processes
Get-Process node | Stop-Process

# Retry extraction
node src/scripts/extract-kiro-vectors.js
```

### Issue: "Qdrant connection refused"

**Solution:**
```powershell
# Check if Qdrant is running
docker ps | Select-String "qdrant"

# Restart if needed
docker restart experimentalportfolio-vector-1

# Test connection
curl http://localhost:6333
```

### Issue: Script hangs or runs very slowly

**Solution:**
- Close other applications to free memory
- Use `--expose-gc` flag for large extractions
- Process in smaller batches by modifying `BATCH_SIZE` constant

---

## Script Execution Summary

### Quick Reference Table

| Order | Script | Time | Purpose | Output |
|-------|--------|------|---------|--------|
| 1 | `forensic-ingest.js` | 1-2 min | Extract GitHub Copilot | ~1,385 exchanges |
| 2 | `extract-kiro-chats.js` | 3-5 min | Extract KIRO small | ~12,077 exchanges |
| 3 | `extract-large-kiro-workspaces.js` | 10-15 min | Extract KIRO large | ~37,698 exchanges |
| 4 | `extract-kiro-vectors.js` | 2-3 min | Extract code vectors | 125,413 vectors |
| 5 | `test-semantic-search.js` | 30 sec | Verify search | Test results |
| 6 | `generate-report.js` | 5 sec | Statistics | Report |

**Total Time:** ~20-30 minutes

---

## File Structure After Setup

```
ExperimentalPortfolio/
├── workspace-storage/          # Source data (copied from AppData)
│   ├── VSCODE/                 # GitHub Copilot data
│   └── KIRO/                   # KIRO Agent data
├── server/
│   ├── src/
│   │   ├── scripts/            # Extraction scripts
│   │   ├── models/             # MongoDB schemas
│   │   └── routes/             # API endpoints
│   └── package.json
├── client/                     # Frontend (optional)
├── data/                       # Docker volumes
│   ├── mongo/                  # MongoDB data
│   └── qdrant/                 # Vector database
├── docker-compose.yaml
└── README.md
```

### 6. Run Neural Biographer (Deep Analysis)
*Requires Ollama installed and running locally with `phi3.5` model*

This step uses a local LLM to analyze the "intent" and "struggle" behind every chat message.

1.  **Install Ollama**: [https://ollama.com/](https://ollama.com/)
2.  **Pull the Model**:
    ```powershell
    ollama pull phi3.5
    ```
3.  **Run the Pipeline**:
    ```powershell
    node server/src/scripts/run-biography-pipeline.js
    ```
    *Note: This process is long-running (~26 hours for full dataset). It includes thermal protection sleeps to prevent GPU overheating.*

---

## Next Steps After Setup

1. **Explore the Data:**
   - Query MongoDB for conversation insights
   - Test semantic search with your own queries
   - Analyze technology distribution

2. **Build Features:**
   - Create API endpoint for semantic code search
   - Build frontend UI to browse conversations
   - Link vector search with chat history

3. **Optimize:**
   - Add indexes for faster queries
   - Implement caching with Redis
   - Schedule incremental updates

---

## Summary

You now have a complete Second Brain system with:
- ✅ **51,160 AI conversations** from GitHub Copilot and KIRO Agent (extracted)
- ✅ **16,116 documents** imported from MongoDB exports via Docker mongoimport (Dec 25)
- ✅ **125,413 code embeddings** for semantic search
- ✅ **101 projects** indexed with metadata
- ✅ **RESTful API** to access all data
- ✅ **Vector search** for code discovery

The entire dataset is ready for querying, analysis, and building AI-powered development tools!

---

## Phase 7: Import Existing MongoDB Exports (Dec 25, 2025)

If you have existing MongoDB exports (JSON files) from another machine, you can quickly import them using Docker's native `mongoimport` tool.

### Prerequisites
- MongoDB Docker container running (`portfoliov2-mongo-1`)
- JSON export files in `/data/exports/` directory

### Quick Import (5 minutes)

```powershell
# Copy exports into container
docker cp ./data/exports/conversations.json portfoliov2-mongo-1:/tmp/conversations.json
docker cp ./data/exports/deepdivelogs.json portfoliov2-mongo-1:/tmp/deepdivelogs.json
docker cp ./data/exports/neuralarchives.json portfoliov2-mongo-1:/tmp/neuralarchives.json
docker cp ./data/exports/projectslists.json portfoliov2-mongo-1:/tmp/projectslists.json
docker cp ./data/exports/rawconversations.json portfoliov2-mongo-1:/tmp/rawconversations.json

# Import each collection
docker exec portfoliov2-mongo-1 mongoimport \
  --uri "mongodb://localhost:27017/secondbrain" \
  --collection conversations \
  --file /tmp/conversations.json \
  --jsonArray

docker exec portfoliov2-mongo-1 mongoimport \
  --uri "mongodb://localhost:27017/secondbrain" \
  --collection deepdivelogs \
  --file /tmp/deepdivelogs.json \
  --jsonArray

# ... repeat for other collections

# Verify import
docker exec portfoliov2-mongo-1 mongosh secondbrain \
  --eval "db.conversations.countDocuments()"
```

### Reusable PowerShell Function

```powershell
function Import-MongoExports {
  param(
    [string]$ExportDir = "./data/exports",
    [string]$Container = "portfoliov2-mongo-1",
    [string]$Database = "secondbrain"
  )
  
  Get-ChildItem "$ExportDir/*.json" | Where-Object { $_.Name -ne "projects.json" } | ForEach-Object {
    $collection = $_.BaseName
    Write-Host "📥 Importing $collection..." -ForegroundColor Cyan
    docker cp $_.FullName "$Container`:/tmp/$($_.Name)"
    docker exec $Container mongoimport --uri "mongodb://localhost:27017/$Database" \
      --collection $collection --file "/tmp/$($_.Name)" --jsonArray
    Write-Host "✅ $collection imported" -ForegroundColor Green
  }
}

# Usage
Import-MongoExports
```

### Results (from Dec 25 session)
| Collection | Documents | Time | Status |
|---|---|---|---|
| conversations | 99 | ~4s | ✅ |
| deepdivelogs | 2,394 | ~0.4s | ✅ |
| neuralarchives | 2 | ~0.2s | ✅ |
| projectslists | 101 | ~0.2s | ✅ |
| rawconversations | 13,520 | ~60s | ✅ |
| **TOTAL** | **16,116** | **~65s** | ✅ |

**Full Details**: See [DEC25_MONGODB_IMPORT_SESSION.md](DEC25_MONGODB_IMPORT_SESSION.md)

---

## Git Authentication & Multi-Account Setup

### Using Personal Access Token (PAT) with Git Credential Manager

If you need to push/pull from GitHub and have multiple accounts (personal + organization), use PAT-based authentication with Git Credential Manager (GCM) for clean credential isolation.

#### Prerequisites
- Git for Windows (includes Git Credential Manager)
- GitHub Personal Access Token with `repo` scope

#### Generate PAT (GitHub)
1. Navigate to: https://github.com/settings/tokens
2. Click "Generate new token" → "Tokens (classic)"
3. Select scopes: `repo` (full control of private repositories)
4. Copy token immediately (won't be shown again)
5. Store securely: `GITHUB PAT local-dev-pc-dec25-TENTACIOPRO.txt`

#### Authenticate with PAT

```powershell
# Read PAT from file
$token = Get-Content "E:\2025\portfoliov2\GITHUB PAT local-dev-pc-dec25-TENTACIOPRO.txt"

# Authenticate via Git Credential Manager (stores credentials securely)
git credential-manager github login `
  --pat $token `
  --username TentacioPro `
  --no-ui `
  --force

# Verify authentication
git ls-remote https://github.com/TentacioPro/portfoliov2.git
```

#### Push to Remote Branch

```powershell
# Push to specific branch with upstream tracking
git push -u https://github.com/TentacioPro/portfoliov2.git v2

# Or if origin is already set correctly
git push -u origin v2
```

#### Multi-Account Configuration (Optional)

If you work with multiple GitHub accounts (e.g., personal + organization), use SSH with host aliases:

**Generate SSH Keys (separate per account)**
```powershell
# Personal account key
ssh-keygen -t ed25519 -C "your_email@example.com" `
  -f "$HOME\.ssh\id_ed25519_TentacioPro"

# Organization account key
ssh-keygen -t ed25519 -C "org_email@example.com" `
  -f "$HOME\.ssh\id_ed25519_Clubits"
```

**Create SSH Config** (`~/.ssh/config`):
```
Host github.com-TentacioPro
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_TentacioPro
  IdentitiesOnly yes

Host github.com-Clubits
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_Clubits
  IdentitiesOnly yes
```

**Add Keys to ssh-agent** (run in elevated PowerShell):
```powershell
# Enable and start ssh-agent
Get-Service -Name ssh-agent | Set-Service -StartupType Manual
Start-Service ssh-agent

# Add keys (in non-elevated terminal)
ssh-add "$HOME\.ssh\id_ed25519_TentacioPro"
ssh-add "$HOME\.ssh\id_ed25519_Clubits"
```

**Set Remote per Account**:
```powershell
# Personal repo (TentacioPro)
git remote set-url origin git@github.com-TentacioPro:TentacioPro/portfoliov2.git

# Organization repo (Clubits)
git remote set-url origin git@github.com-Clubits:OrgName/repo.git
```

**Test SSH Connection**:
```powershell
ssh -T git@github.com-TentacioPro
# Expected: Hi TentacioPro! You've successfully authenticated...

ssh -T git@github.com-Clubits
# Expected: Hi abishekMClubits! You've successfully authenticated...
```

#### Credential Storage
- **PAT via GCM**: Stored in Windows Credential Manager (`Control Panel → Credential Manager → Windows Credentials`)
- **SSH Keys**: Stored in `~/.ssh/` directory; agent caches passphrases for session
- **Security**: Never commit PAT files to git; ensure `.gitignore` includes `*.txt` patterns for sensitive tokens

---

## Troubleshooting

For help with setup issues, see:
- **[ISSUES.md](ISSUES.md)** - Known issues and workarounds
- **[README.md](README.md)** - Features and API endpoints overview
