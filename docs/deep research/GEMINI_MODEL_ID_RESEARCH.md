# Gemini Model ID Research for Vertex AI Batch Predictions

**Date:** December 26, 2025  
**Context:** Resolving `NOT_FOUND: The PublisherModel gemini-2.5-flash-001 does not exist` error

---

## Problem Statement

When submitting a Vertex AI Batch Prediction job, the initial model ID `gemini-2.5-flash-001` failed with:

```
5 NOT_FOUND: The PublisherModel gemini-2.5-flash-001 does not exist.
```

---

## Research Findings

### 1. Vertex AI Model ID Format

For **Generative AI on Vertex AI**, the model resource format is:

```
publishers/google/models/{MODEL_ID}
```

### 2. Available Gemini Models (as of Dec 2025)

| Model | Model ID | Context Window | Best For |
|-------|----------|----------------|----------|
| Gemini 2.5 Flash | `gemini-2.5-flash-preview-05-20` | 1M tokens | **Batch Processing** (50% discount) |
| Gemini 2.0 Flash | `gemini-2.0-flash` | 1M tokens | General purpose |
| Gemini 1.5 Flash | `gemini-1.5-flash-002` | 1M tokens | Cost-effective |
| Gemini 1.5 Pro | `gemini-1.5-pro-002` | 2M tokens | Complex reasoning |

### 3. Correct Model ID for Batch Processing

**Working Configuration:**
```javascript
MODEL_ID: 'gemini-2.5-flash-preview-05-20'
```

**Full Resource Path:**
```
publishers/google/models/gemini-2.5-flash-preview-05-20
```

---

## Key Learnings

1. **Preview Models:** Gemini 2.5 Flash is still in preview, hence the `preview-05-20` suffix (May 2025 preview release)
2. **No `-001` Suffix:** Unlike some other models, Gemini 2.5 Flash doesn't use version suffixes like `-001`
3. **Region Matters:** Model availability varies by region. `us-central1` has the widest model support.

---

## Verification

Successfully submitted batch job after model ID correction:
- **Project:** `maaxly-deploy-trial`
- **Region:** `us-central1`
- **Bucket:** `gs://maaxly-brain-batch-storage`
- **Input File:** `batch_input.jsonl` (4.32 GB, 13,520 documents)

---

## References

- [Vertex AI Generative Models](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models)
- [Batch Prediction API](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/batch-prediction-gemini)
- [Model Versioning](https://cloud.google.com/vertex-ai/generative-ai/docs/learn/model-versioning)
