# KIRO Agent Deep Dive Analysis Report
*Generated: December 21, 2025 (Analysis) → December 25, 2025 (Data Import Complete)*

## Executive Summary

KIRO Agent stores significantly more data than just chat conversations. Initial extraction only captured **chat files**, but missed the vast majority of indexed knowledge.

## Data Inventory

### File Types in KIRO GlobalStorage
```
.manifest files: 13,791  - LanceDB metadata
.txn files:      13,779  - LanceDB transaction logs  
.chat files:     13,222  - Chat conversations (EXTRACTED ✅)
.lance files:     6,078  - LanceDB vector tables
.js files:        4,084  - Code files
.tsx files:       1,965  - React TypeScript components
.ts files:        1,176  - TypeScript files
.json files:        846  - Configuration/data files
.md files:          678  - Documentation
.arrow files:       360  - Apache Arrow data format
```

### SQLite Databases Discovered

#### 1. index.sqlite (PRIMARY KNOWLEDGE BASE)
**Purpose:** Stores all indexed code, vectors, and metadata

**Tables:**
- `lance_db_cache`: **125,413 vectors** stored (384-dim embeddings from all-MiniLM-L6-v2)
- `chunks`: **272,497 code chunks** indexed
- `code_snippets`: **7,345 code snippets** extracted
- `fts`: Full-text search index (trigram tokenization)
- `chunk_tags`: Tags for semantic organization
- `global_cache`: Project-level cache keys

**Vector Schema:**
```sql
CREATE TABLE lance_db_cache (
    uuid TEXT PRIMARY KEY,
    cacheKey TEXT NOT NULL,        -- Project identifier
    path TEXT NOT NULL,             -- File path
    artifact_id TEXT NOT NULL,      -- Workspace/artifact ID
    vector TEXT NOT NULL,           -- 384-dim embedding (text blob)
    startLine INTEGER NOT NULL,
    endLine INTEGER NOT NULL,
    contents TEXT NOT NULL          -- Code snippet
);
```

**Top Projects by Vector Count:**
1. a288f4951bd0e442ade5cf354bf531fa93377079c0376d3482742936a2d76fde - 972 vectors
2. 52ed752f9e479bfb1d020f19902c24e961ed306b70bb5279108a7ce461773545 - 420 vectors
3. 5c35723d61bd85133ccebc693735039034864c574c708a8977b790145e6a2efb - 332 vectors

#### 2. docs.sqlite
**Purpose:** Documentation index (external docs)
**Status:** Empty (0 documents)

#### 3. autocompleteCache.sqlite  
**Purpose:** Autocomplete suggestions cache
**Status:** Not yet analyzed

### LanceDB Structure

**What are .txn files?**
Transaction logs for LanceDB. Each .txn file records a vector database operation:
- Adding new vectors
- Updating existing embeddings
- Schema versioning

**Sample .txn content:**
```
$e8129fda-7b0f-4d6b-9f21-439700f0e311
path, cachekey, uuid, vector (fixed_size_list:float:384), 
startLine, endLine, contents
```

**LanceDB Tables:**
Each `.lance` directory contains:
- `_transactions/` - Transaction logs (.txn files)
- `_versions/` - Version history
- `data/` - Apache Arrow formatted vector data
- `_latest.manifest` - Current schema and metadata

## What We EXTRACTED vs What We MISSED

### ✅ Successfully Extracted (Initial Pass)
- 13,222 .chat files processed
- 16 KIRO workspaces successfully imported to MongoDB
- 12,077 chat exchanges captured
- Tech stack detection from conversations

### ❌ NOT YET EXTRACTED (Critical Gap)

#### 1. Code Vectors (125,413 embeddings)
**Location:** `index.sqlite → lance_db_cache` table
**Content:** Pre-computed 384-dim vectors of code snippets
**Value:** Can be imported directly to Qdrant for semantic code search
**Use Case:** "Show me all authentication implementations across projects"

#### 2. Code Chunks (272,497 indexed segments)
**Location:** `index.sqlite → chunks` table  
**Content:** Code split into semantic chunks with line ranges
**Value:** Structured code knowledge, already chunked for RAG
**Use Case:** Context retrieval for AI responses

#### 3. Code Snippets (7,345 extracted functions/classes)
**Location:** `index.sqlite → code_snippets` table
**Content:** Function signatures, class definitions
**Value:** High-level code structure across all projects
**Use Case:** "What are all the Express route handlers I've written?"

#### 4. Full-Text Search Index
**Location:** `index.sqlite → fts` table (FTS5 with trigram)
**Content:** Indexed code content for fast text search
**Value:** Instant code search without re-indexing
**Use Case:** Find all files containing specific patterns

#### 5. LanceDB Vector Tables (6,078 .lance files)
**Location:** Individual `.lance` directories in globalStorage
**Content:** Raw Apache Arrow vector data + metadata
**Value:** Can verify SQLite cache or extract additional vectors
**Note:** May be redundant if lance_db_cache is complete

## Buffer Overflow Issue Analysis

### Failed Workspaces
```
7281ebd028e3cd673114e7354cbcbf6e - 5,949 chat files
8856313c3aa3201dde31fdf9bdad594e - 4,876 chat files
```

**Error:** `The value of "offset" is out of range. It must be >= 0 && <= 17825792. Received 17825794`

**Root Cause:** Node.js buffer size limit when concatenating large JSON files
- Each .chat file can be 348KB+
- 5,949 files × 350KB avg = ~2GB of JSON data
- fs.readFileSync hits V8 string length limit (~1GB or ~2^30 bytes)

**Solution Strategies:**
1. **Streaming approach:** Process files in batches of 100-500
2. **Per-file processing:** Read → Parse → Extract → Discard (don't accumulate)
3. **Worker threads:** Parallel processing with memory isolation
4. **Incremental commits:** Write to MongoDB after each batch

## Recommended Extraction Strategy

### Phase 1: Fix Chat Extraction (2 Failed Workspaces)
**Priority:** HIGH  
**Effort:** 1-2 hours  
**Impact:** +~5,000-10,000 more chat exchanges

**Approach:**
- Refactor `extract-kiro-chats.js` to use streaming
- Process files in batches of 100
- Clear memory between batches

### Phase 2: Extract Code Vectors to Qdrant  
**Priority:** CRITICAL  
**Effort:** 2-4 hours  
**Impact:** 125K vectors = instant semantic code search

**Approach:**
```javascript
// Read from index.sqlite
const vectors = db.prepare(`
  SELECT uuid, cacheKey, path, vector, 
         startLine, endLine, contents 
  FROM lance_db_cache
`).all();

// Parse text-encoded vectors
vectors.forEach(row => {
  const floatArray = parseVectorString(row.vector); // Convert to Float32Array
  
  // Upsert to Qdrant
  qdrantClient.upsert('code-knowledge', {
    id: row.uuid,
    vector: floatArray,
    payload: {
      cacheKey: row.cacheKey,
      path: row.path,
      content: row.contents,
      startLine: row.startLine,
      endLine: row.endLine,
      source: 'kiro-agent'
    }
  });
});
```

### Phase 3: Import Code Snippets to MongoDB
**Priority:** MEDIUM  
**Effort:** 1-2 hours  
**Impact:** Structured code catalog

**Approach:**
- Create new collection: `codeSnippets`
- Import from `code_snippets` table
- Link to parent project via `cacheKey`
- Enable queries like "Show all React hooks I've written"

### Phase 4: Import Code Chunks
**Priority:** LOW (redundant if vectors work)  
**Effort:** 1-2 hours  
**Impact:** Alternative to vector search

**Approach:**
- Store in MongoDB as backup/reference
- Useful if Qdrant unavailable
- Provides line-range context for results

## Technology Stack Insights

From vector paths, we can see KIRO was used on:
- **HRMS projects** (HR Management Systems)
- **Maaxly** (appears multiple times - likely main project)
- **React + Express + MongoDB** stack dominant
- **TypeScript/TSX** heavy usage
- Projects in `D:\cluBITS Solutions\AI Projects\`

## Next Steps

1. **IMMEDIATE:** Run fixed extraction for 2 failed workspaces
2. **HIGH PRIORITY:** Extract 125K vectors to Qdrant (enables semantic search)
3. **MEDIUM:** Import code snippets to MongoDB (structured knowledge)
4. **LOW:** Verify LanceDB .lance files aren't missing any vectors
5. **FUTURE:** Build UI to query vector database ("show me error handling patterns")

## Questions to Investigate

1. Why are there more .manifest (13,791) than .chat (13,222) files?
   - **Hypothesis:** Some vector operations without chat sessions
   
2. Are LanceDB .lance files redundant with lance_db_cache?
   - **Action:** Spot-check vector counts between sources
   
3. Can we extract embedding model metadata?
   - **Location:** Likely in .manifest files or globalContext.json
   
4. What's in autocompleteCache.sqlite?
   - **Action:** Analyze schema and content

## Success Metrics (Updated Dec 25)

**Dec 21 Extraction State:**
- ✅ 13,222 chat files analyzed
- ✅ 12,077 exchanges extracted (from 16 workspaces)
- ✅ Large workspaces recovered (+37,698 exchanges)
- ✅ 125,413 vectors imported to Qdrant
- ✅ 0 extraction failures (100% success rate)

**Dec 25 Import State:**
- ✅ 16,116 documents imported via Docker mongoimport
- ✅ All collections verified with mongosh
- ✅ conversations: 99 documents
- ✅ deepdivelogs: 2,394 documents
- ✅ neuralarchives: 2 documents
- ✅ projectslists: 101 documents
- ✅ rawconversations: 13,520 documents
- ✅ Import speed: 908 vectors/sec, ~65 seconds total
- ✅ 0 import failures (100% success rate)

**Current Capabilities:**
- ✅ Semantic search via Qdrant (125K vectors indexed)
- ✅ Chat history queryable via MongoDB API
- ✅ Technology stack detection across 99+ projects
- ✅ Neural analysis logs available for deep insights
- ✅ Ready for frontend UI & RAG pipeline

---

**Conclusion:** KIRO extraction and import complete. We've successfully unified 51,160+ exchanges and 125,413 semantic vectors into a production-ready Second Brain system. See [DEC25_MONGODB_IMPORT_SESSION.md](DEC25_MONGODB_IMPORT_SESSION.md) for import methodology.
