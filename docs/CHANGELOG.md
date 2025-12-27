# Second Brain OS - v2 Changelog

## Version 2.0 - Complete Rewrite (Branch: v2)

### Architecture Overview
Complete transformation from single React app to full-stack AI-native system with Docker orchestration.

### Latest Changes

#### Vertex AI Batch Processing - Production Run (Dec 26, 2025)
- **CURRENT SESSION** `feat: Vertex AI Batch Prediction with Gemini 2.5 Flash`
  - **Batch Submission**: 13,520 documents (4.32 GB) submitted to Vertex AI
  - **Model Fix**: Corrected model ID from `gemini-2.5-flash-001` to `gemini-2.5-flash-preview-05-20`
  - **Scripts Created**:
    * `trigger_batch_processing.js` - Upload to GCS + Submit batch job
    * `import-batch-results.js` - Download results + Import to MongoDB
  - **Idempotency**: 3-layer verification (file hash, GCS size, job state)
  - **GCS Bucket**: `gs://maaxly-brain-batch-storage/`
  - **Status**: Batch job running, awaiting completion

#### Idempotent Scripts Revamp (Dec 25, 2025)
- **eb0a10b** `docs: update existing documentation`
  - All 6 pipeline scripts now fully idempotent
  - Added `--status` flag to fleet-commander for pipeline dashboard
  - Created `docs/IDEMPOTENT_SCRIPTS.md` with verification patterns
  - Metadata tracking via `.export_meta.json` and `.import_meta.json`

#### Code Analysis Ideology Upgrade (Dec 17, 2024)
- **e884659** `feat: upgrade code analysis with Senior Software Architect ideology`
  - **New LLM Prompt**: "Focus on INTENT over syntax" with reverse engineering capability
  - **New Fields Added**:
    * `oneLiner`: Simple English explanation of project purpose
    * `techStack`: Array of detected libraries/frameworks
    * `engineersLogic`: Inferred problem the developer was solving
    * `promptReconstruction`: Reverse-engineered AI prompt that likely generated the code
  - **Schema Updates**: Enhanced MongoDB ProjectSchema with 4 new fields
  - **API**: Created `/api/projects` endpoint for enriched metadata queries
  - **Storage**: Updated Qdrant payload structure with architectural insights
  - **Tokens**: Increased max_tokens from 1000 to 1500 for detailed analysis
  - Rollback: `git checkout e884659`

#### ELT Pipeline & Vertex AI Batch Integration (Dec 25, 2025)
- **68ce43f** `feat: implement ELT pipeline with Gemini 3 Transformer and Qdrant Vectorizer`
  - **Consolidation**: Moved 19 legacy/test scripts to `server/src/scripts/legacy/`.
  - **Transformer**: Implemented `archiver-gemini.js` with Token Bucket rate limiting (15 RPM).
  - **Vectorizer**: Implemented `vectorize-archives.js` using local Ollama (`nomic-embed-text`) and Qdrant.
  - **Orchestrator**: Updated `fleet-commander.js` for phase-based execution (`--phase=transform`, `--phase=vectorize`).
- **Current** `feat: Vertex AI Batch Prediction Pipeline`
  - **Batch Processor**: Created `batch-processor-vertex.js` for high-volume processing (4.5GB+).
  - **Streaming**: Implemented Node.js streams for memory-efficient JSONL export.
  - **GCS Integration**: Automated bucket creation and idempotent file uploads with size verification.
  - **Vertex AI**: Integrated `JobServiceClient` for batch prediction job submission.
  - **Idempotency**: Added progress-aware checks across all pipeline phases.

### Commit Structure (Rollback Points)

#### Infrastructure Layer
- **f408e53** `chore: add comprehensive .gitignore for monorepo`
  - Rollback: Clean slate, just gitignore rules
  
- **8ba46f0** `feat: Docker orchestration with 4 services`
  - Rollback: Docker Compose with 4 services (mongo, redis, qdrant, brain)
  - Revert: `git checkout 8ba46f0`

- **7cebc1b** `feat: backend foundation - Express ESM server`
  - Rollback: Node v20 ESM server with Express 5
  - Revert: `git checkout 7cebc1b`

#### Data Services Layer
- **e4f3acf** `feat: database services - MongoDB and Redis clients`
  - Rollback: Database connections (MongoDB + Redis)
  - Revert: `git checkout e4f3acf`

- **0457760** `feat: Zod validation schemas for data pipeline`
  - Rollback: Type safety with Zod schemas
  - Revert: `git checkout 0457760`

#### AI/ML Pipeline
- **f9f272d** `feat: embedding and vector services`
  - Rollback: Embeddings (@xenova/transformers) + Qdrant client
  - Revert: `git checkout f9f272d`

- **d9dc7d5** `feat: BullMQ ingestion worker for data pipeline`
  - Rollback: Queue-based async processing
  - Revert: `git checkout d9dc7d5`

- **b01bcc2** `feat: ingest API for text content submission`
  - Rollback: API endpoint for text ingestion
  - Revert: `git checkout b01bcc2`

#### RAG System
- **7786c59** `feat: RAG retrieval with Groq LLM integration`
  - Rollback: Semantic search + LLM answer generation
  - Revert: `git checkout 7786c59`

- **1bec3ef** `feat: chat API endpoint for conversational queries`
  - Rollback: Chat API with RAG integration
  - Revert: `git checkout 1bec3ef`

#### LaTeX Engine
- **de28e85** `feat: LaTeX service with Tectonic compiler`
  - Rollback: PDF generation with LaTeX
  - Revert: `git checkout de28e85`

- **e3ee2ab** `feat: resume generation API`
  - Rollback: Resume API endpoint
  - Revert: `git checkout e3ee2ab`

#### Testing & Scripts
- **96ff633** `feat: verification and seed scripts`
  - Rollback: Verification scripts + PDF batch seeder
  - Revert: `git checkout 96ff633`

#### Frontend Layer
- **6ba3457** `feat: React frontend with Vite setup`
  - Rollback: React + Vite + Tailwind foundation
  - Revert: `git checkout 6ba3457`

- **d496310** `feat: API client for backend communication`
  - Rollback: API client utilities
  - Revert: `git checkout d496310`

- **c9f0eb0** `feat: resume builder UI component`
  - Rollback: Resume builder with PDF preview
  - Revert: `git checkout c9f0eb0`

- **441e994** `feat: ChatGPT-style chat interface`
  - Rollback: Chat UI with conversation history
  - Revert: `git checkout 441e994`

- **635adf2** `feat: complete portfolio UI with all components`
  - Rollback: Full portfolio with all pages/components
  - Revert: `git checkout 635adf2`

#### Advanced Features & Deployment
- **35e5d50** `docs: add sample resume PDF for testing`
  - Rollback: System with test data
  - Revert: `git checkout 35e5d50`

- **ed8453a** `feat: fix batch ingestion (UUID + Docker volume mount)`
  - Rollback: Production-ready with 33+ projects ingested (HEAD)
  - Changes:
    - Fixed Qdrant UUID format (randomUUID vs timestamp)
    - Fixed array serialization (patterns/keyComponents)
    - Added Docker volume `../:/projects:ro` for external access
    - Limited payload to 5000 chars to prevent errors
    - Enhanced error logging with status codes
  - Result: 33 projects in MongoDB, 58 nodes in Qdrant
  - Known Issue: Groq rate limit (100k tokens/day) blocked final 4 projects
  - Current state: `git checkout v2`

---

## Rollback Instructions

### To specific feature:
```bash
git checkout <commit-hash>
docker compose down
docker compose up --build
```

### To continue development:
```bash
git checkout v2
```

### To test a stage without losing work:
```bash
git stash                    # Save current work
git checkout <commit-hash>   # Go to specific stage
# Test the system...
git checkout v2              # Return to latest
git stash pop                # Restore work
```

---

## Tech Stack Summary

**Backend:**
- Node.js v20 (ESM)
- Express 5.2.1
- BullMQ 5.66.0 + Redis
- MongoDB (Mongoose 8.10.6)
- Qdrant (vector DB)

**AI/ML:**
- @xenova/transformers (embeddings)
- Groq SDK (llama-3.3-70b)
- 384-dimensional vectors

**Frontend:**
- React 18
- Vite
- Tailwind CSS v4
- Framer Motion

**Document Processing:**
- Tectonic (LaTeX → PDF)
- pdf-parse (PDF → text)

**Deployment:**
- Docker Compose
- 4 services orchestration
- Persistent volumes in ./data/

---

## Key Features by Commit

| Feature | Commit | Status |
|---------|--------|--------|
| Docker Setup | 8ba46f0 | ✅ |
| Backend API | 7cebc1b | ✅ |
| Database Clients | e4f3acf | ✅ |
| Validation Schemas | 0457760 | ✅ |
| Embeddings | f9f272d | ✅ |
| Queue Worker | d9dc7d5 | ✅ |
| Ingest API | b01bcc2 | ✅ |
| RAG System | 7786c59 | ✅ |
| Chat API | 1bec3ef | ✅ |
| LaTeX Engine | de28e85 | ✅ |
| Resume API | e3ee2ab | ✅ |
| Scripts | 96ff633 | ✅ |
| React Setup | 6ba3457 | ✅ |
| API Client | d496310 | ✅ |
| Resume UI | c9f0eb0 | ✅ |
| Chat UI | 441e994 | ✅ |
| Portfolio | 635adf2 | ✅ |
| Test Data | 35e5d50 | ✅ |
| Batch Ingestion | ed8453a | ✅ (33/41 projects) |

---

## Development Workflow

1. **Feature Branch:** Always work on feature branches from `v2`
2. **Testing:** Test at each commit stage before proceeding
3. **Rollback:** Use commit hashes to revert to stable states
4. **Documentation:** Update this CHANGELOG for new features

---

## Next Steps (Post-v2)

- [ ] Authentication system
- [ ] Multi-user support
- [ ] Advanced RAG with reranking
- [ ] Custom embedding models
- [ ] Performance optimization
- [ ] Production deployment config
