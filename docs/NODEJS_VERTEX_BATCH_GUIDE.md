# Node.js Implementation: Vertex AI Batch Trigger

## 1. Prerequisites
[cite_start]Unlike Python (which uses `google-cloud-aiplatform`), the Node.js environment requires specific libraries[cite: 11].
```bash
npm install @google-cloud/aiplatform @google-cloud/storage
2. Authentication (ADC)
The script relies on Application Default Credentials. Do not manage service account keys manually.
+1

Run: gcloud auth application-default login.
+1

IAM Requirements:


roles/aiplatform.user (Submit Jobs).
+1


roles/bigquery.dataEditor (If using BQ) or roles/storage.objectAdmin (If using GCS).
+1

3. The trigger_batch_elt.js Script Structure
The script must use the JobServiceClient from the GAPIC layer.

3.1 Job Configuration

Endpoint: Must specify ${LOCATION}-aiplatform.googleapis.com to target the correct region (e.g., us-central1).
+1


Model Resource: Format is publishers/google/models/${MODEL_ID}.
+1

Instance Format:

For BigQuery: bigquery.
+1

For GCS (JSONL): jsonl.

3.2 The Input Payload
For each record, the JSON structure must match the GenerateContentRequest format:

JSON

{
  "contents": [{ "role": "user", "parts": [{ "text": "..." }] }],
  "generation_config": {
    "temperature": 0.2,
    "max_output_tokens": 1024
  }
}
4. Operational Handling
Asynchronous: The script submits the job and exits. It does not wait for completion.
+1


Monitoring: The script should output the Console URL for the job so the engineer can track progress in the browser.
+1

Error Handling:


429 (Resource Exhausted): Retry in a different region (Global Endpoint) or wait.
+1


403 (Permission Denied): Check if the Vertex AI Service Agent has permission to read the source bucket/table.
+1
