# Second Brain - AI Knowledge Extraction System

A self-hosted system that extracts, indexes, and queries AI chat history from GitHub Copilot and KIRO Agent. Built with Node.js, MongoDB, Qdrant, and React.

**Status**: 🟢 Production Ready | **Database**: 16,116 documents | **Vectors**: 125,413 embeddings

---

## 🚀 Quick Start

```powershell
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
cd server && npm install

# 3. Start server
node index.js

# 4. Access API
curl http://localhost:3001/health
```

---

## 📚 Documentation

All documentation has been consolidated in the [`docs/`](docs/) directory for easier navigation.

### Getting Started
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Complete installation & extraction steps
- **[README](docs/README.md)** - Full project overview & features

### Development Timeline
- **[Work Summary (Dec 21-25)](docs/WORK_SUMMARY_DEC21.md)** - Phase-by-phase achievements
- **[MongoDB Import Session (Dec 25)](docs/DEC25_MONGODB_IMPORT_SESSION.md)** - Docker mongoimport methodology
- **[Extraction Journey](docs/dec21-experiment%20with%20chatdata%20extraction.md)** - Complete data extraction story

### Technical Deep Dives
- **[KIRO Extraction Report](docs/KIRO_EXTRACTION_FINAL_REPORT.md)** - Vector & conversation extraction
- **[KIRO Analysis Report](docs/KIRO_ANALYSIS_REPORT.md)** - Deep dive into KIRO architecture
- **[Code Analysis Ideology](docs/CODE_ANALYSIS_IDEOLOGY.md)** - Intent-over-syntax analysis framework

### Project Management
- **[Issue Tracker](docs/ISSUES.md)** - Known issues, bugs, enhancements, and backlog
- **[Changelog](docs/CHANGELOG.md)** - Version history & releases

---

## 📊 Current Stats

| Metric | Value |
|--------|-------|
| **Total Documents** | 16,116 |
| **Extracted Exchanges** | 51,160+ |
| **Qdrant Vectors** | 125,413 (384-dim) |
| **Projects** | 99+ |
| **Collections** | 5 (conversations, deepdivelogs, neura larchives, projectslists, rawconversations) |
| **Data Size** | 4.7 GB |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Second Brain System                      │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   MongoDB   │   Qdrant    │    Redis    │     Ollama       │
│  (Metadata) │  (Vectors)  │   (Cache)   │   (Analysis)     │
├─────────────┴─────────────┴─────────────┴──────────────────┤
│                    Node.js API Server                       │
├─────────────────────────────────────────────────────────────┤
│                    React + Vite Frontend                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
portfoliov2/
├── docs/                    # 📚 All documentation
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   ├── ISSUES.md           # Issue tracker
│   ├── DEC25_MONGODB_IMPORT_SESSION.md
│   ├── WORK_SUMMARY_DEC21.md
│   └── ... (8 more docs)
├── server/                  # 🔧 Node.js backend
│   ├── src/
│   │   ├── scripts/        # Extraction & analysis scripts
│   │   ├── services/       # MongoDB, Qdrant, Redis, LLM
│   │   ├── routes/         # API endpoints
│   │   └── models/         # Mongoose schemas
│   └── index.js
├── client/                  # 🎨 React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── data/                    # 💾 Docker volumes
│   ├── mongo/              # MongoDB data
│   ├── qdrant/             # Vector DB data
│   ├── redis/              # Cache data
│   └── exports/            # JSON backups
├── workspace-storage/       # 📂 Source data (optional)
├── docker-compose.yaml
└── .env                     # Configuration
```

---

## 🔧 Key Features

### Data Extraction
- ✅ GitHub Copilot chat extraction (1,385 exchanges)
- ✅ KIRO Agent extraction (49,775 exchanges)
- ✅ Large workspace handling (streaming + chunking)
- ✅ Automatic tech stack detection

### Semantic Search
- ✅ 125,413 pre-computed code embeddings
- ✅ Instant Qdrant vector search
- ✅ Ranked results by relevance

### Analysis & Insights
- ✅ Developer intent extraction (Ollama pipeline)
- ✅ Struggle score classification (1-10)
- ✅ Debugging session detection
- ✅ Technology distribution analysis

### Data Management
- ✅ MongoDB persistence (16,116 documents)
- ✅ Docker mongoimport for rapid restoration
- ✅ Backup/restore scripts
- ✅ Redis caching layer

---

## 📋 Requirements

- **Node.js** v20+
- **Docker Desktop** (MongoDB, Qdrant, Redis, Ollama)
- **Git** v2.49+
- (Optional) **Ollama** for local LLM analysis

---

## 🚨 Known Issues

See **[ISSUES.md](docs/ISSUES.md)** for:
- Critical issues (resolved) ✅
- High priority items (in progress) 🔄
- Medium priority enhancements
- Low priority improvements
- Unsorted backlog

**Current Status**: 🟢 Production Ready  
**Next Milestone**: Semantic search API endpoint (H-001)

---

## 🤝 Contributing

1. Check [ISSUES.md](docs/ISSUES.md) for open issues
2. Follow [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) to get started
3. Submit changes with clear commit messages
4. Update relevant documentation

---

## 📞 Support

- **Setup Issues**: See [SETUP_GUIDE.md](docs/SETUP_GUIDE.md#troubleshooting)
- **API Questions**: Check [docs/README.md](docs/README.md#api-endpoints)
- **Bug Reports**: Create issue in [ISSUES.md](docs/ISSUES.md)

---

## 📄 License

ISC

---

**Last Updated**: December 25, 2025  
**Maintainer**: @Second Brain Team  
**Repository Status**: Active Development
