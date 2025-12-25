# Second Brain - Issue Tracker
*Last Updated: December 25, 2025*

---

## 📋 Overview

This document tracks all known issues, bugs, enhancements, and tasks for the Second Brain project. Issues are organized by priority and status.

---

## 🔴 Critical Issues (Blocking Production)

| ID | Issue | Status | Priority | Impact | Assigned | Due |
|----|-------|--------|----------|--------|----------|-----|
| C-001 | Thermal protection needed for long-running LLM analysis | ✅ RESOLVED | HIGH | GPU overheating during Neural Biographer pipeline | — | Dec 21 |
| C-002 | Buffer overflow on large KIRO workspaces | ✅ RESOLVED | HIGH | 10,825 chat files were not extractable | — | Dec 21 |
| C-003 | MongoDB 16MB document size limit exceeded | ✅ RESOLVED | HIGH | Large sessions couldn't be stored | — | Dec 21 |

---

## 🟠 High Priority Issues (Should Fix Soon)

| ID | Issue | Status | Priority | Impact | Assigned | Next Steps |
|----|-------|--------|----------|--------|----------|------------|
| H-001 | No semantic search API endpoint | 🔄 IN PROGRESS | HIGH | Users can't query vectors from REST API | — | Build `/api/search/code` endpoint |
| H-002 | Frontend UI not yet created | 🔄 IN PROGRESS | HIGH | No way to browse data visually | — | Build React component library |
| H-003 | RAG pipeline not implemented | 🔄 IN PROGRESS | HIGH | Can't combine chat history with semantic search | — | Design RAG architecture |
| H-004 | No authentication/authorization | 🔄 IN PROGRESS | HIGH | Anyone can access all data if exposed | — | Add Clerk or similar auth |
| H-005 | Missing database indexes | ❌ TODO | MEDIUM-HIGH | Slow queries on large collections | — | Run `db.collection.createIndex()` |
| H-006 | Vertex AI Batch Model 404 | ✅ RESOLVED | HIGH | `gemini-1.5-flash-001` not found in batch | — | Use full resource path |
| H-007 | GCS Bucket 404 | ✅ RESOLVED | HIGH | Batch upload fails if bucket missing | — | Auto-create bucket in script |

---

## 🟡 Medium Priority Issues

| ID | Issue | Status | Priority | Impact | Notes |
|----|-------|--------|----------|--------|-------|
| M-001 | Code chunks (272K) not extracted | ❌ TODO | MEDIUM | Optional - vectors already provide search | Can implement if needed for RAG |
| M-002 | Code snippets (7.3K) not imported | ❌ TODO | MEDIUM | Optional - structured code catalog | Can implement as enhancement |
| M-003 | LanceDB .lance files not analyzed | ❌ TODO | MEDIUM | Optional - may be redundant with SQLite | Verify if additional vectors exist |
| M-004 | No incremental update strategy | ❌ TODO | MEDIUM | Must re-extract all data for updates | Design append-only changelog |
| M-005 | Ollama pipeline not fully tested | ❌ TODO | MEDIUM | Neural biographer needs validation | Run sample analysis on subset |
| M-006 | No error recovery/retry logic | ✅ RESOLVED | MEDIUM | Failed jobs are lost forever | Implemented idempotency in Batch Pipeline |
| M-007 | Documentation links may be broken | 🔄 IN PROGRESS | MEDIUM | Moved .md files to /docs | Need to verify all cross-references |

---

## 🟢 Low Priority Issues (Nice to Have)

| ID | Issue | Status | Priority | Notes |
|----|-------|--------|----------|-------|
| L-001 | Export to CSV/JSON functionality | ❌ TODO | LOW | For data analysis in Excel/Tableau |
| L-002 | Time-series analysis of conversation patterns | ❌ TODO | LOW | Visualize coding activity over time |
| L-003 | Duplicate detection in chat sessions | ❌ TODO | LOW | Some projects may have redundant exports |
| L-004 | Performance optimization for 125K vectors | ❌ TODO | LOW | Current search is fast, optimization later |
| L-005 | Dark mode for frontend | ❌ TODO | LOW | UX enhancement |
| L-006 | Mobile responsive design | ❌ TODO | LOW | UX enhancement |
| L-007 | Multi-language support | ❌ TODO | LOW | Internationalization |

---

## 🟤 Unsorted / Backlog Issues

These are ideas and potential improvements that haven't been formally scoped yet.

### Data Enhancements
- [ ] Extract Ollama model outputs for additional insights
- [ ] Link conversations to GitHub commit history (if available)
- [ ] Correlate "struggle score" with code commits (intent analysis)
- [ ] Create "developer journey" visualization (emotional arc)
- [ ] Tag conversations by emotion/intent (automated classification)
- [ ] Build "common patterns" library (detected across projects)

### API Enhancements
- [ ] `/api/search/by-intent` - Find conversations where developer struggled
- [ ] `/api/projects/:id/timeline` - Chat history chronologically
- [ ] `/api/analytics/tech-stack` - Distribution of technologies
- [ ] `/api/analytics/productivity` - Activity patterns over time
- [ ] `/api/chat/similar` - Find similar chat patterns across projects
- [ ] `/api/recommendations` - Suggest relevant past conversations

### Frontend Enhancements
- [ ] Real-time chat interface (talk to Second Brain)
- [ ] Conversation browser with filters
- [ ] Code snippet viewer with syntax highlighting
- [ ] Vector similarity visualization (t-SNE/UMAP)
- [ ] Technology dependency graph
- [ ] Project timeline (when each tech was used)
- [ ] Developer struggle heatmap
- [ ] Search history and saved queries

### Infrastructure
- [ ] Database sharding for 100M+ documents
- [ ] Caching layer optimization (Redis TTL strategy)
- [ ] Backup/restore automation (daily snapshots)
- [ ] Monitoring dashboard (uptime, query performance)
- [ ] Alert system (when imports fail, etc.)
- [ ] Logging/audit trail for API access
- [ ] Rate limiting to prevent abuse
- [ ] CI/CD pipeline for automated testing

### Testing
- [ ] Unit tests for extraction scripts
- [ ] Integration tests for MongoDB/Qdrant
- [ ] Load testing (1M concurrent vectors)
- [ ] Backup/restore verification tests
- [ ] API endpoint tests
- [ ] Semantic search quality tests

### Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Architecture decision records (ADRs)
- [ ] Troubleshooting guide
- [ ] Contributing guidelines
- [ ] Deployment runbook
- [ ] Data retention policy

---

## 📊 Issue Statistics

| Category | Count | Status |
|----------|-------|--------|
| Critical (Resolved) | 3 | ✅ CLOSED |
| High Priority | 5 | 🔄 IN PROGRESS |
| Medium Priority | 7 | Mixed |
| Low Priority | 7 | ❌ BACKLOG |
| Unsorted/Ideas | 30+ | 📋 BRAINSTORM |
| **TOTAL** | **52+** | — |

---

## 🔄 Recent Changes

### Dec 25, 2025
- ✅ Resolved buffer overflow (streaming extraction)
- ✅ Resolved 16MB document limit (chunking)
- ✅ Resolved thermal protection (Ollama pipeline)
- 📝 Created issue tracker (this document)
- 🔄 In progress: Semantic search API endpoint

### Dec 21, 2025
- ✅ KIRO extraction complete (51,160 exchanges)
- ✅ Vector extraction to Qdrant (125,413 embeddings)
- ✅ MongoDB import via Docker (16,116 documents)

---

## 🎯 Next Milestone

**Goal**: Build semantic search API endpoint

**Issues to resolve**:
- H-001: Create `/api/search/code` endpoint
- H-004: Add authentication
- M-006: Implement error recovery

**Estimated time**: 4-6 hours

**Owner**: @Assistant

**Target date**: Dec 26, 2025

---

## 📝 How to Report New Issues

1. Check if issue already exists (search by keywords)
2. Determine priority (Critical > High > Medium > Low)
3. Create entry in appropriate section
4. Link related issues
5. Assign owner if known
6. Add to next milestone if blocking

---

## 🔗 Related Documents

- [DEC25_MONGODB_IMPORT_SESSION.md](DEC25_MONGODB_IMPORT_SESSION.md) - Import methodology & resolution of critical issues
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Phase-by-phase setup & troubleshooting
- [WORK_SUMMARY_DEC21.md](WORK_SUMMARY_DEC21.md) - Timeline of issue resolutions
- [KIRO_EXTRACTION_FINAL_REPORT.md](KIRO_EXTRACTION_FINAL_REPORT.md) - Technical achievements & workarounds

---

**Status**: 🟢 PRODUCTION READY (with known limitations)  
**Last Review**: December 25, 2025  
**Next Review**: December 26, 2025
