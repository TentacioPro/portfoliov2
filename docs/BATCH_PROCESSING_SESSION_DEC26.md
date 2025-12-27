# Batch Processing Session Log - December 26, 2025

## Session Overview
**Objective:** Process 4.32GB of raw conversation data (13,520 documents) using Vertex AI Batch Predictions with Gemini 2.5 Flash.

---

## Timeline of Events

### Phase 1: Initial Attempt (Failed)
**Time:** ~22:26 UTC

1. Ran `node server/src/scripts/fleet-commander.js --phase=batch`
2. Pipeline Status showed:
   - Raw Documents: 13,520
   - Processed (Online): 0
   - Submitted to Batch: 0
   - Neural Archives: 2

3. **UPLOAD SUCCESSFUL:**
   - File: `batch_input.jsonl` (4.32 GB)
   - Quick Hash: `c4bc1cf2bacb966e3f346a3f8a7eeb26`
   - Destination: `gs://maaxly-brain-batch-storage/staging/batch_input.jsonl`
   - Upload Duration: 5.5 minutes

4. **SUBMIT FAILED:**
   ```
   💥 CRITICAL FAILURE: 5 NOT_FOUND: The PublisherModel gemini-2.5-flash-001 does not exist.
   ```

### Phase 2: Model ID Research
**Problem:** Incorrect model ID format for Vertex AI Batch API

**Investigation:**
- Checked Vertex AI documentation
- Discovered Gemini 2.5 Flash uses preview suffix
- Correct model ID: `gemini-2.5-flash-preview-05-20`

**Fix Applied:**
```javascript
// Before (WRONG)
MODEL_ID: 'gemini-2.5-flash-001'

// After (CORRECT)
MODEL_ID: 'gemini-2.5-flash-preview-05-20'
```

### Phase 3: Successful Submission
**Time:** ~22:45 UTC

1. Re-ran batch phase
2. **IDEMPOTENCY WORKED:** Upload skipped (file already exists in GCS)
3. **BATCH JOB SUBMITTED SUCCESSFULLY**

**Job Details:**
- Project: `maaxly-deploy-trial`
- Region: `us-central1`
- Model: `publishers/google/models/gemini-2.5-flash-preview-05-20`
- Input: `gs://maaxly-brain-batch-storage/staging/batch_input.jsonl`
- Output: `gs://maaxly-brain-batch-storage/predictions/`

---

## Scripts Modified

### 1. `server/src/scripts/trigger_batch_processing.js`
- Updated `MODEL_ID` from `gemini-2.5-flash-001` to `gemini-2.5-flash-preview-05-20`
- Idempotency features confirmed working:
  - ✅ Size-based upload skip
  - ✅ Job state checking
  - ✅ Metadata tracking in `.batch_meta.json`

### 2. `server/src/scripts/import-batch-results.js` (Created)
- New script to import Vertex AI batch results from GCS
- Parses JSONL output files
- Bulk upserts to `neuralarchives` collection
- Tracks imported files in `.import_batch_meta.json`

### 3. `server/src/scripts/fleet-commander.js`
- Added `--phase=import` command
- Updated usage help text

---

## Files Created/Updated

| File | Action | Purpose |
|------|--------|---------|
| `server/src/scripts/trigger_batch_processing.js` | Updated | Fixed model ID |
| `server/src/scripts/import-batch-results.js` | Created | Import batch results |
| `server/src/scripts/fleet-commander.js` | Updated | Added import phase |
| `docs/deep research/GEMINI_MODEL_ID_RESEARCH.md` | Created | Model research notes |
| `docs/VERTEX_AI_BATCH_PIPELINE.md` | Updated | Pipeline documentation |
| `docs/BATCH_PROCESSING_SESSION_DEC26.md` | Created | This session log |

---

## Current Status

| Component | Status |
|-----------|--------|
| Local JSONL | ✅ Ready (4.32 GB) |
| GCS Upload | ✅ Complete |
| Batch Job | ✅ Succeeded |
| Results Download | ✅ Complete (13,520 predictions) |
| Results Import | ✅ Complete |
| Vectorization | 🔜 Pending |

---

## Phase 4: Results Import (Dec 27, 2025)

### Batch Job Completed
- **Output File:** `predictions_prediction-model-2025-12-26T08_59_36.339820Z_predictions.jsonl`
- **Location:** `data/predicted_batch/`
- **Total Predictions:** 13,520 lines

### Import Process
1. Dropped existing `neuralarchives` collection
2. Cleared import metadata (`.import_batch_meta.json`)
3. Ran import from local file using `--local` flag

```bash
node server/src/scripts/import-batch-results.js --local
```

### Useful PowerShell Commands for JSONL Inspection

**Preview first line of JSONL:**
```powershell
Get-Content .\predictions_prediction-model-2025-12-26T08_59_36.339820Z_predictions.jsonl -TotalCount 1
```

**Pretty-print first record to file:**
```powershell
Get-Content .\predictions_prediction-model-2025-12-26T08_59_36.339820Z_predictions.jsonl -TotalCount 1 | 
    ConvertFrom-Json |
    ConvertTo-Json -Depth 10 |
    Out-File .\preview.md -Encoding utf8
```

**Count total lines:**
```powershell
(Get-Content .\predictions_prediction-model-2025-12-26T08_59_36.339820Z_predictions.jsonl | Measure-Object -Line).Lines
```

---

## Next Steps

1. **Verify import count** in MongoDB:
   ```bash
   docker exec portfoliov2-mongo-1 mongosh secondbrain --quiet --eval "db.neuralarchives.countDocuments()"
   ```
2. **Run vectorization** to index archives in Qdrant:
   ```bash
   node server/src/scripts/fleet-commander.js --phase=vectorize
   ```

---

## Lessons Learned

1. **Model IDs are version-specific:** Gemini 2.5 Flash requires the full `gemini-2.5-flash-preview-05-20` identifier
2. **Idempotency saves time:** The upload skip saved 5+ minutes on the retry
3. **Large file uploads work:** 4.32GB uploaded successfully with resumable upload in 5.5 minutes
4. **Batch API is the right choice:** For 13k+ documents, batch processing avoids rate limits and timeout issues
5. **Local fallback is essential:** When GCS download is incomplete, having local predictions file is crucial
6. **PowerShell JSONL tools:** Use `Get-Content -TotalCount 1` + `ConvertFrom-Json` for quick inspection
