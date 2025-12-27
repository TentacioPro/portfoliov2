# Vertex AI Batch ELT Pipeline

## Overview
The Vertex AI Batch ELT Pipeline is a high-throughput data processing system designed to transform large volumes of raw development logs (~13,520 documents, 4.32GB) into structured "Neural Archives" using Google's **Gemini 2.5 Flash** model with **50% batch discount**.

## Current Status (Dec 26, 2025)
| Phase | Status | Details |
|-------|--------|---------|
| Export | ✅ Complete | 13,520 docs → `batch_input.jsonl` (4.32 GB) |
| Upload | ✅ Complete | Uploaded to `gs://maaxly-brain-batch-storage/staging/` |
| Submit | ✅ Complete | Batch job submitted to Vertex AI |
| Import | ⏳ Pending | Waiting for job completion |

## Architecture
The pipeline follows a clean ELT (Extract, Load, Transform) pattern:

1.  **Extract & Load (Local -> JSONL):**
    *   Streams documents from the `rawconversations` MongoDB collection.
    *   Formats each document into the Vertex AI Batch JSONL request format.
    *   Writes to a local `batch_input.jsonl` file using Node.js streams to maintain a constant memory footprint.

2.  **Transport (Local -> GCS):**
    *   Uploads the JSONL file to a Google Cloud Storage (GCS) bucket.
    *   Implements idempotency by checking file existence and matching file sizes before uploading.
    *   Automatically creates the GCS bucket if it doesn't exist.

3.  **Transform (Vertex AI Batch Prediction):**
    *   Submits a `batchPredictionJob` to Vertex AI using the `gemini-2.5-flash-preview-05-20` model.
    *   Uses the Batch Prediction API to bypass online API rate limits and timeouts.
    *   Implements job idempotency by checking for existing pending or running jobs before submission.

4.  **Import (GCS -> MongoDB):**
    *   Downloads the resulting JSONL files from GCS.
    *   Parses the model's structured JSON output.
    *   Performs a bulk upsert into the `neuralarchives` MongoDB collection.

## Key Features
- **Memory Efficient:** Uses MongoDB cursors and Node.js streams to process gigabytes of data with minimal RAM usage.
- **Idempotent:** Every phase (Export, Upload, Submit, Import) tracks progress via metadata files.
- **Scalable:** Leverages Google Cloud's infrastructure to process thousands of documents in parallel.
- **Cost Effective:** Uses Gemini 2.5 Flash with batch pricing (50% discount).

## Technical Stack
- **Runtime:** Node.js v20
- **Database:** MongoDB (Mongoose)
- **Cloud:** Google Cloud Platform (Vertex AI, Cloud Storage)
- **SDKs:** `@google-cloud/aiplatform`, `@google-cloud/storage`

## Usage
The pipeline is orchestrated via `fleet-commander.js`:

```bash
# Check pipeline status
node server/src/scripts/fleet-commander.js --status

# Run the batch pipeline (Upload -> Submit)
node server/src/scripts/fleet-commander.js --phase=batch

# Import results once the job is complete
node server/src/scripts/fleet-commander.js --phase=import
```

## Configuration (.env)
```dotenv
GCP_PROJECT_ID=maaxly-deploy-trial
GCP_LOCATION=us-central1
GCS_BUCKET_NAME=maaxly-brain-batch-storage
MONGO_URI=mongodb://localhost:27017/secondbrain
```

## Idempotency Tracking Files
| File | Purpose |
|------|---------|
| `data/exports/.batch_meta.json` | Tracks upload timestamp, job ID, job state |
| `data/exports/.import_batch_meta.json` | Tracks which GCS result files are imported |

## Model Configuration
- **Model:** `gemini-2.5-flash-preview-05-20`
- **Resource Path:** `publishers/google/models/gemini-2.5-flash-preview-05-20`
- **Region:** `us-central1`
- **Output Format:** `application/json` (structured metadata extraction)
