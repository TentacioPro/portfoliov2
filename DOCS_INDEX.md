# 📚 Documentation Index

**All project documentation has been consolidated in the [`docs/`](docs/) directory for better organization.**

---

## 🚀 Getting Started (5 minutes)

1. **First time?** Start here: [`docs/README.md`](docs/README.md)
2. **Need to set up?** Follow: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)
3. **Check your status?** See: [`docs/ISSUES.md`](docs/ISSUES.md)

---

## 📖 Documentation Map

### Core Documentation
| File | Purpose | Read Time |
|------|---------|-----------|
| [`docs/README.md`](docs/README.md) | Full project overview, features, architecture | 5 min |
| [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md) | Installation, extraction, verification | 15 min |
| [`docs/ISSUES.md`](docs/ISSUES.md) | Known issues, bugs, enhancements, backlog | 10 min |

### Project Timeline
| File | Content | Date |
|------|---------|------|
| [`docs/BATCH_PROCESSING_SESSION_DEC26.md`](docs/BATCH_PROCESSING_SESSION_DEC26.md) | Vertex AI batch production run | Dec 26 |
| [`docs/WORK_SUMMARY_DEC21.md`](docs/WORK_SUMMARY_DEC21.md) | Complete 8-phase timeline | Dec 21-25 |
| [`docs/DEC25_MONGODB_IMPORT_SESSION.md`](docs/DEC25_MONGODB_IMPORT_SESSION.md) | Docker mongoimport methodology | Dec 25 |
| [`docs/dec21-experiment with chatdata extraction.md`](docs/dec21-experiment%20with%20chatdata%20extraction.md) | Full extraction journey | Dec 21 |

### Technical Deep Dives
| File | Topic | Audience |
|------|-------|----------|
| [`docs/IDEMPOTENT_SCRIPTS.md`](docs/IDEMPOTENT_SCRIPTS.md) | Idempotent script architecture & patterns | Engineers |
| [`docs/VERTEX_AI_BATCH_PIPELINE.md`](docs/VERTEX_AI_BATCH_PIPELINE.md) | Vertex AI Batch Prediction workflow | Cloud Engineers |
| [`docs/GENAI_ELT_RESEARCH_DEC2025.md`](docs/GENAI_ELT_RESEARCH_DEC2025.md) | GenAI-Augmented ELT research | Data Engineers |
| [`docs/NODEJS_VERTEX_BATCH_GUIDE.md`](docs/NODEJS_VERTEX_BATCH_GUIDE.md) | Node.js Vertex AI implementation guide | Backend Engineers |
| [`docs/KIRO_EXTRACTION_FINAL_REPORT.md`](docs/KIRO_EXTRACTION_FINAL_REPORT.md) | Vector & conversation extraction results | Engineers |
| [`docs/KIRO_ANALYSIS_REPORT.md`](docs/KIRO_ANALYSIS_REPORT.md) | Deep dive into KIRO architecture | Data Scientists |
| [`docs/CODE_ANALYSIS_IDEOLOGY.md`](docs/CODE_ANALYSIS_IDEOLOGY.md) | Intent-over-syntax analysis framework | Architects |
| [`docs/WORKSPACE_EXTRACTION_COMPLETE.md`](docs/WORKSPACE_EXTRACTION_COMPLETE.md) | Extraction statistics & methodology | Data Engineers |

### Deep Research
| File | Topic |
|------|-------|
| [`docs/deep research/GEMINI_MODEL_ID_RESEARCH.md`](docs/deep%20research/GEMINI_MODEL_ID_RESEARCH.md) | Gemini model ID format for Vertex AI |
| [`docs/deep research/Node.js Implementation Guide_ Cost-Optimized Generative ELT on Vertex AI.md`](docs/deep%20research/Node.js%20Implementation%20Guide_%20Cost-Optimized%20Generative%20ELT%20on%20Vertex%20AI.md) | Cost optimization strategies |
| [`docs/deep research/Vertex AI Batch GenAI ELT Guide.md`](docs/deep%20research/Vertex%20AI%20Batch%20GenAI%20ELT%20Guide.md) | Batch API implementation guide |

### Reference
| File | Content |
|------|---------|
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Version history & releases |
| [`docs/BATCH_INGESTION_REPORT.md`](docs/BATCH_INGESTION_REPORT.md) | Batch processing details |

---

## 🎯 Quick Links by Role

### 👨‍💻 Developer
1. Install: [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md#project-setup)
2. Run tests: `npm test` in `/server`
3. Check issues: [`docs/ISSUES.md`](docs/ISSUES.md#-high-priority-issues)
4. Deploy: `docker-compose up -d`

### 📊 Data Engineer
1. Understand extraction: [`docs/KIRO_EXTRACTION_FINAL_REPORT.md`](docs/KIRO_EXTRACTION_FINAL_REPORT.md)
2. Learn methodology: [`docs/DEC25_MONGODB_IMPORT_SESSION.md`](docs/DEC25_MONGODB_IMPORT_SESSION.md)
3. Check schema: [`docs/README.md#-architecture`](docs/README.md#-architecture)

### 🔬 Researcher
1. Analysis framework: [`docs/CODE_ANALYSIS_IDEOLOGY.md`](docs/CODE_ANALYSIS_IDEOLOGY.md)
2. Data available: [`docs/WORKSPACE_EXTRACTION_COMPLETE.md`](docs/WORKSPACE_EXTRACTION_COMPLETE.md#-final-database-state-updated-dec-25-2025)
3. Queries: `GET /api/conversations`, `/api/projects/list`

### 📋 Project Manager
1. Status: [`docs/WORK_SUMMARY_DEC21.md`](docs/WORK_SUMMARY_DEC21.md#-final-statistics-dec-25-2025)
2. Issues: [`docs/ISSUES.md`](docs/ISSUES.md#-recent-changes)
3. Timeline: [`docs/dec21-experiment with chatdata extraction.md`](docs/dec21-experiment%20with%20chatdata%20extraction.md)

---

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Database** | ✅ 16,116 documents | MongoDB + Qdrant |
| **Vectors** | ✅ 125,413 embeddings | 384-dimensional |
| **API** | 🔄 In Progress | Missing semantic search endpoint |
| **Frontend** | ❌ Not Started | React components needed |
| **Documentation** | ✅ Complete | 12 files, issue tracker |

See [`docs/ISSUES.md`](docs/ISSUES.md) for full breakdown.

---

## 🔍 Search by Topic

**Looking for...?**

- **How to install** → [`docs/SETUP_GUIDE.md`](docs/SETUP_GUIDE.md)
- **Idempotent scripts** → [`docs/IDEMPOTENT_SCRIPTS.md`](docs/IDEMPOTENT_SCRIPTS.md)
- **Batch processing** → [`docs/VERTEX_AI_BATCH_PIPELINE.md`](docs/VERTEX_AI_BATCH_PIPELINE.md)
- **What's done** → [`docs/WORK_SUMMARY_DEC21.md`](docs/WORK_SUMMARY_DEC21.md)
- **What's broken** → [`docs/ISSUES.md`](docs/ISSUES.md)
- **Architecture** → [`docs/README.md`](docs/README.md#-architecture)
- **Data sources** → [`docs/WORKSPACE_EXTRACTION_COMPLETE.md`](docs/WORKSPACE_EXTRACTION_COMPLETE.md)
- **Extraction details** → [`docs/DEC25_MONGODB_IMPORT_SESSION.md`](docs/DEC25_MONGODB_IMPORT_SESSION.md)
- **API endpoints** → [`docs/README.md`](docs/README.md#api-endpoints)
- **Technology stack** → [`docs/WORKSPACE_EXTRACTION_COMPLETE.md`](docs/WORKSPACE_EXTRACTION_COMPLETE.md#-technology-distribution)

---

## 📞 Need Help?

1. **Setup issues?** → Check [`docs/SETUP_GUIDE.md#troubleshooting`](docs/SETUP_GUIDE.md#troubleshooting)
2. **API questions?** → See [`docs/README.md#api-endpoints`](docs/README.md#api-endpoints)
3. **Found a bug?** → Report in [`docs/ISSUES.md`](docs/ISSUES.md)
4. **How do I...?** → Search above or check [`docs/README.md`](docs/README.md)

---

**Last Updated**: December 25, 2025  
**Version**: 1.0 (Post-Import)  
**Maintainer**: Second Brain Team
