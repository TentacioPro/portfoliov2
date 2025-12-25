# Second Brain - AI Knowledge Extraction System

A self-hosted system that extracts, indexes, and queries AI chat history from GitHub Copilot and KIRO Agent. Built with Node.js, MongoDB, Qdrant, and React.

## What It Does

- **Extracts** 51,160+ AI conversations from VS Code extensions
- **Indexes** 125,413 code embeddings for semantic search
- **Analyzes** developer intent and struggle patterns using local LLMs (Ollama) and Cloud LLMs (Vertex AI Batch)
- **Imports** 16,116+ documents from existing MongoDB exports via Docker
- **Serves** a REST API + React frontend to explore the knowledge base

## Quick Start

```powershell
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
cd server && npm install

# 3. Run extraction scripts (see SETUP_GUIDE.md for details)
node src/scripts/ingest-raw-workspace.js

# 4. Run the ELT pipeline (Vertex AI Batch)
node src/scripts/fleet-commander.js --phase=batch

# 5. Start server
node index.js
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Second Brain System                      │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   MongoDB   │   Qdrant    │    Redis    │     Vertex AI    │
│  (Metadata) │  (Vectors)  │   (Cache)   │   (Batch ETL)    │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                    Node.js API Server                       │
├─────────────────────────────────────────────────────────────┤
│                    React + Vite Frontend                    │
└─────────────────────────────────────────────────────────────┘
```

## Data Sources & Import Status

| Source | Documents | Status | Method |
|--------|-----------|--------|--------|
| GitHub Copilot | 1,385 | ✅ Extracted | Forensic ingest (Dec 21) |
| KIRO Agent (Small) | 12,077 | ✅ Extracted | .chat parser (Dec 21) |
| KIRO Agent (Large) | 37,698 | ✅ Extracted | Streaming ingest (Dec 21) |
| Laptop MongoDB Exports | 16,116 | ✅ Imported | Docker mongoimport (Dec 25) |
| **Total** | **67,276** | ✅ Complete | — |

## Key Features

### Chat Extraction
- Parses multiple AI chat formats (Copilot JSON, KIRO role-based)
- Handles large workspaces with streaming to avoid memory issues
- Detects tech stack from conversation context

### Vertex AI Batch Pipeline
- Processes 13,000+ documents (4.5GB+) using Gemini 1.5 Flash
- Bypasses online API rate limits via Batch Prediction API
- Extracts structured metadata: intent, struggle score, milestones

### Semantic Search
- 125K pre-computed code embeddings (384-dim, MiniLM-L6-v2)
- Instant code search via Qdrant vector database
- Query: "authentication implementation" → ranked code snippets

### Neural Biographer (Optional)
- Uses Ollama (Phi-3.5) or Gemini 1.5 Flash to analyze every exchange
- Extracts: intent, scenario, struggle score (1-10)
- Identifies high-frustration debugging sessions

## API Endpoints

```
GET  /api/chat/sessions          # List chat sessions
POST /api/chat                   # Send message to RAG pipeline
GET  /api/conversations          # All extracted conversations
GET  /api/projects/list          # Project metadata
```

## Project Structure

```
├── server/
│   ├── src/
│   │   ├── scripts/        # Extraction & analysis scripts
│   │   ├── services/       # MongoDB, Qdrant, Redis, LLM
│   │   ├── routes/         # API endpoints
│   │   └── models/         # Mongoose schemas
│   └── index.js
├── client/                 # React + Vite frontend
├── data/                   # Docker volumes (mongo, qdrant, redis)
├── workspace-storage/      # Source data (copied from AppData)
├── docker-compose.yaml
├── SETUP_GUIDE.md          # Detailed setup instructions
└── README.md
```

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `forensic-ingest.js` | Extract GitHub Copilot chats |
| `extract-kiro-chats.js` | Extract KIRO Agent chats |
| `extract-large-kiro-workspaces.js` | Handle large KIRO workspaces |
| `extract-kiro-vectors.js` | Import code vectors to Qdrant |
| `export-mongo.js` | Export all collections to JSON |
| `import-mongo.js` | Restore JSON to MongoDB collection |
| `run-biography-pipeline.js` | Analyze exchanges with Ollama |

## Database Backup & Restore

```powershell
# Export all collections
node src/scripts/export-mongo.js

# Restore a collection
node src/scripts/import-mongo.js rawconversations.json neuralarchiveRaw
```

## Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/secondbrain
REDIS_HOST=localhost
QDRANT_URL=http://localhost:6333
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
```

## Requirements

- Node.js v20+
- Docker Desktop (MongoDB, Qdrant, Redis containers)
- (Optional) Ollama for local LLM analysis
- (Optional) SQLite3 tools for KIRO vector extraction

## Documentation Timeline

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete installation & extraction steps
- **[DEC25_MONGODB_IMPORT_SESSION.md](DEC25_MONGODB_IMPORT_SESSION.md)** - Docker mongoimport methodology (NEW - Dec 25)
- [WORK_SUMMARY_DEC21.md](WORK_SUMMARY_DEC21.md) - Full project timeline
- [KIRO_EXTRACTION_FINAL_REPORT.md](KIRO_EXTRACTION_FINAL_REPORT.md) - Vector & conversation extraction results
- [dec21-experiment with chatdata extraction.md](dec21-experiment%20with%20chatdata%20extraction.md) - Complete extraction journey
- [CODE_ANALYSIS_IDEOLOGY.md](CODE_ANALYSIS_IDEOLOGY.md) - Intent-over-syntax analysis framework
- **[ISSUES.md](ISSUES.md)** - Issue tracker with known issues & backlog

## License

ISC
