# GenAI-Augmented ELT Strategy (December 2025)

## Executive Summary
This document defines the architectural strategy for the "Second Brain" project, shifting from synchronous API calls to a **Vertex AI Batch Inference** model. [cite_start]This approach is designed to fit within a $200 Google Cloud Free Trial budget while maximizing throughput for our 4.5GB dataset[cite: 6, 7, 167].

## 1. The Model Landscape (Dec 2025)
[cite_start]Selecting the right model is an optimization problem balancing reasoning, cost, and stability[cite: 176, 177].

| Model | Status | Use Case | Recommendation |
| :--- | :--- | :--- | :--- |
| **Gemini 2.5 Flash** | GA | High-volume extraction, cost-optimization. | [cite_start]**Primary Workhorse.** Supports Implicit Caching and is stable[cite: 200, 201]. |
| **Gemini 2.5 Pro** | GA | Complex reasoning requiring "Thinking Budget". | [cite_start]Use sparingly for high-struggle logs[cite: 197, 198]. |
| **Gemini 3 Pro** | Preview | Deep logical deduction ("Thinking Levels"). | [cite_start]**Avoid for Batch** due to "Preview" instability and region locks[cite: 181, 190]. |

## 2. Financial Engineering
[cite_start]To operate under $200, we leverage three specific cost levers[cite: 221]:

### 2.1 The Batch Discount
* [cite_start]**Mechanism:** Batch jobs run asynchronously (delayed start) to utilize spare compute capacity[cite: 227].
* [cite_start]**Impact:** **50% Discount** on inference costs compared to Online Prediction[cite: 28, 171].

### 2.2 Implicit Caching
* [cite_start]**Mechanism:** Vertex AI automatically caches repeated input tokens (e.g., our static system instructions)[cite: 29].
* [cite_start]**Impact:** Cached tokens are billed at ~10% of the standard rate[cite: 30, 238].
* [cite_start]**Constraint:** Caching discounts do not stack additively with Batch discounts; the Caching discount takes precedence[cite: 242, 244].

### 2.3 Guardrails
* [cite_start]**Max Output Tokens:** Must be strictly set (e.g., 1024) to prevent "runaway loops" where the model generates infinite garbage, draining budget[cite: 262, 495].
* [cite_start]**Budget Alerts:** Set at $50, $100, and $150 to catch overruns early[cite: 505].

## 3. Architecture: The "Zero-ETL" Workflow
[cite_start]The standard pattern for 2025 is **BigQuery-to-BigQuery**[cite: 266].
1.  [cite_start]**Staging:** Data is loaded into a BigQuery table with a specific `request` JSON column[cite: 272].
2.  [cite_start]**Processing:** Vertex AI reads directly from BigQuery, processes in batch, and writes results to a new table[cite: 282].
3.  [cite_start]**Parsing:** A final SQL transformation extracts the structured JSON from the model's text output[cite: 291].

**Adaptation for MongoDB:** Since our source of truth is MongoDB (`rawconversations`), we will adapt this pattern by using **GCS (Google Cloud Storage)** as the staging layer (Mongo -> JSONL -> GCS -> Batch) while retaining the financial benefits of the Batch API.