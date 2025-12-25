# Vertex AI Batch ELT Pipeline

## Overview
The Vertex AI Batch ELT Pipeline is a high-throughput data processing system designed to transform large volumes of raw development logs (~13,000+ documents, 4.5GB+) into structured "Neural Archives" using Google's Gemini 1.5 Flash model.

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
    *   Submits a `batchPredictionJob` to Vertex AI using the `gemini-1.5-flash-001` model.
    *   Uses the Batch Prediction API to bypass online API rate limits and timeouts.
    *   Implements job idempotency by checking for existing pending or running jobs before submission.

4.  **Import (GCS -> MongoDB):**
    *   Downloads the resulting JSONL files from GCS.
    *   Parses the model's structured JSON output.
    *   Performs a bulk write into the `neuralarchives` MongoDB collection.

## Key Features
- **Memory Efficient:** Uses MongoDB cursors and Node.js streams to process gigabytes of data with minimal RAM usage.
- **Idempotent:** Every phase (Export, Upload, Submit) checks for existing progress to allow resumption after failures.
- **Scalable:** Leverages Google Cloud's infrastructure to process thousands of documents in parallel.
- **Cost Effective:** Uses the Flash model and batch pricing to minimize LLM costs.

## Technical Stack
- **Runtime:** Node.js v20
- **Database:** MongoDB (Mongoose)
- **Cloud:** Google Cloud Platform (Vertex AI, Cloud Storage)
- **SDKs:** `@google-cloud/aiplatform`, `@google-cloud/storage`

## Usage
The pipeline is orchestrated via `fleet-commander.js`:

```bash
# Run the full batch pipeline (Export -> Upload -> Submit)
node server/src/scripts/fleet-commander.js --phase=batch

# Import results once the job is complete
node server/src/scripts/batch-processor-vertex.js --import-results
```

## Configuration (.env)
```dotenv
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GCS_BUCKET_NAME=your-bucket-name
MONGO_URI=mongodb://localhost:27017/secondbrain
```
