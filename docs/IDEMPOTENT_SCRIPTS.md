# Idempotent Script Architecture

> **Philosophy**: "Run it again. Same result. Zero wasted work."

All scripts in the Second Brain ELT pipeline are designed to be **idempotent**—meaning you can run them multiple times without causing duplicate work, data corruption, or wasted compute resources.

---

## 🎯 Why Idempotency Matters

1. **Crash Recovery**: If a script fails mid-execution (network timeout, power loss), simply re-run it. It picks up where it left off.
2. **Incremental Updates**: Add new source files? The script processes only the new ones.
3. **Cost Savings**: No duplicate API calls to Gemini. No re-uploading unchanged files to GCS.
4. **Developer Experience**: No mental overhead tracking "where did it stop?" Just run it.

---

## 📊 Status Dashboard

Before any work begins, run the orchestrator with `--status` to see the current pipeline state:

```bash
node server/src/scripts/fleet-commander.js --status
```

Output:
```
╔══════════════════════════════════════════════════════════════╗
║            🧠 SECOND BRAIN PIPELINE STATUS                   ║
╠══════════════════════════════════════════════════════════════╣
║  📥 PHASE 1: INGESTION (Loader)                              ║
║     Raw Documents:        13520                              ║
║                                                              ║
║  🤖 PHASE 2a: TRANSFORMATION (Online API)                    ║
║     Processed (Online):     500 / 13520                      ║
║                                                              ║
║  ☁️  PHASE 2b: TRANSFORMATION (Batch API)                     ║
║     Submitted to Batch:   13520 / 13520                      ║
║                                                              ║
║  📚 PHASE 3: NEURAL ARCHIVES                                 ║
║     Archives Created:      5000                              ║
║                                                              ║
║  🎯 PHASE 4: VECTORIZATION                                   ║
║     Vectorized:            1200 / 5000                       ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🔧 Script-by-Script Idempotency

### 1. `ingest-raw-workspace.js` (Loader)

**Tracking Mechanism**: `filePath` field in MongoDB with unique index on `{filePath, part}`.

**Behavior on Re-run**:
- Queries DB for all previously imported file paths
- Scans workspace for source files
- **Filters out** already-imported files
- Only processes NEW files

**Key Code**:
```javascript
const importedPaths = await getImportedFilePaths();
const newFiles = files.filter(f => !importedPaths.has(f));
if (newFiles.length === 0) {
    console.log('✅ All files already imported. Nothing to do.');
    process.exit(0);
}
```

---

### 2. `archiver-gemini.js` (Online Transformer)

**Tracking Mechanism**: `processed: true` flag on each `rawconversations` document.

**Behavior on Re-run**:
- Shows status report: Total vs Processed vs Pending
- Queries only `{ processed: { $ne: true } }`
- Exits early if nothing pending

**Key Code**:
```javascript
const pendingCount = totalRaw - processedCount;
if (pendingCount === 0) {
    console.log('✅ All documents already processed. Nothing to do.');
    process.exit(0);
}
```

---

### 3. `trigger_batch_processing.js` (Batch Transformer)

**Tracking Mechanisms**:
1. **MongoDB**: `batch_submitted: true` flag per document
2. **GCS**: File size comparison (local vs remote)
3. **Vertex AI**: Checks for existing jobs with same input URI

**Behavior on Re-run**:
- Phase 1 (Export): Skips if all docs have `batch_submitted: true`
- Phase 2 (Upload): Skips if GCS file exists with matching size
- Phase 3 (Submit): Skips if job already PENDING/RUNNING/SUCCEEDED

**Key Code**:
```javascript
// Phase 1: Check pending
const pendingCount = await RawConversation.countDocuments({ batch_submitted: { $ne: true } });

// Phase 2: Check GCS
const [metadata] = await file.getMetadata();
if (remoteSize === localSize) { /* skip */ }

// Phase 3: Check Vertex
const activeJob = existingJobs.find(j => 
    j.inputConfig?.gcsSource?.uris?.includes(gcsInputUri) && 
    ['JOB_STATE_RUNNING', 'JOB_STATE_PENDING', 'JOB_STATE_SUCCEEDED'].includes(j.state)
);
```

---

### 4. `vectorize-archives.js` (Vectorizer)

**Tracking Mechanism**: `vectorized: true` flag on each `neuralarchives` document.

**Behavior on Re-run**:
- Shows status: Total Archives vs Already Vectorized vs Eligible & Pending
- Queries only eligible, non-vectorized documents
- Updates flag after successful Qdrant upsert

**Key Code**:
```javascript
const eligibleCount = await NeuralArchive.countDocuments({
    vectorized: { $ne: true },
    $or: [
        { "analysis.is_milestone": true },
        { struggle_score: { $gt: 5 } }
    ]
});
if (eligibleCount === 0) {
    console.log('✅ No eligible documents pending vectorization.');
}
```

---

### 5. `export-mongo.js` (Backup/Export)

**Tracking Mechanism**: `.export_meta.json` file tracking:
- Document count per collection at last export
- Export timestamp

**Behavior on Re-run**:
- Compares current document count with last export
- Skips unchanged collections
- Use `--force` to re-export all

**Key Code**:
```javascript
if (lastExport.count === currentCount && fileExists) {
    console.log(`${name}: ✅ up-to-date`);
} else {
    toExport.push({ name, count: currentCount });
}
```

---

### 6. `import-mongo.js` (Restore/Import)

**Tracking Mechanism**: `.import_meta.json` file tracking:
- Source file modification timestamp
- Target collection document count

**Behavior on Re-run**:
- Compares source file mtime with last import
- Offers three modes: **Skip**, **Merge** (add new only), **Replace**
- Merge mode uses `_id` matching to avoid duplicates

**Key Code**:
```javascript
if (lastImport.fileModified === fileModified && existingCount === lastImport.count) {
    console.log('✅ Collection already up-to-date with source file.');
}

// Merge mode
const existingIds = new Set([...]);
const newDocs = data.filter(d => !existingIds.has(d._id.toString()));
```

---

## 🏃 Running the Full Pipeline

```bash
# Check status first
node server/src/scripts/fleet-commander.js --status

# Run specific phase (idempotent - safe to repeat)
node server/src/scripts/fleet-commander.js --phase=ingest
node server/src/scripts/fleet-commander.js --phase=transform
node server/src/scripts/fleet-commander.js --phase=batch
node server/src/scripts/fleet-commander.js --phase=vectorize

# Run all phases
node server/src/scripts/fleet-commander.js --phase=all
```

---

## 🛡️ Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Script crashes mid-batch | Re-run picks up from last committed checkpoint |
| GCS upload interrupted | Resumable upload continues from last byte |
| Vertex job submitted but not started | Detects existing job, skips re-submission |
| New files added to workspace | Only new files are processed |
| Database wiped | Full re-import, flags reset |
| `--force` flag passed | Overrides idempotency, re-processes everything |

---

## 📁 Metadata Files

| File | Location | Purpose |
|------|----------|---------|
| `.export_meta.json` | `data/exports/` | Tracks export timestamps and counts |
| `.import_meta.json` | `data/exports/` | Tracks import timestamps and file mtimes |

---

## 🧠 Design Principles

1. **Atomic Marking**: State flags (`processed`, `vectorized`, `batch_submitted`) are updated AFTER successful completion, not before.
2. **Status First**: Every script shows current state before taking action.
3. **No Silent Overwrites**: User is prompted or informed before replacing existing data.
4. **Graceful Degradation**: If status check fails (e.g., DB offline), script proceeds with caution and warns.

---

*Last Updated: December 25, 2025*
