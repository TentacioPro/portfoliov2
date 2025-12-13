---
applyTo: '**'
---
# SECOND BRAIN OS: AGENT CONSTITUTION & ARCHITECTURE

## 1. THE MISSION
We are building a Self-Sovereign, AI-Native "Second Brain".
- **Hardware:** Single Node (Dockerized).
- **Cost:** $0.00 (Self-Hosted Only).
- **Stack:** Node.js v20 (Monorepo), MongoDB (Meta), Qdrant (Vector), Redis (Queue), React (Vite).
- **Philosophy:** "Automation via Verification." No code is written without a test or schema to prove it works.

## 2. THE INFRASTRUCTURE (Immutable)
- **Root:** `docker-compose.yml` orchestrates 4 services: `brain` (Node), `mongo`, `cache`, `vector`.
- **Server:** Express API + BullMQ Workers.
- **Client:** React + Vite.
- **Persistence:** All state lives in `./data/`. Code is stateless.

## 3. CODING STANDARDS (The "Eno Reyes" Doctrine)
1.  **Verification First:** Before implementing logic, define the Interface (Zod Schema) and the Success Condition (Test).
2.  **Strict Typing:** No `any`. Use JSDoc or TypeScript Interfaces for all data crossing boundaries (API, Queue, DB).
3.  **Atomic Functions:** Functions must fit on one screen. Complex logic must be broken into verifiable sub-modules.
4.  **No Hallucinations:** Do not invent libraries. Use ONLY: `express`, `mongoose`, `bullmq`, `@qdrant/js-client-rest`, `@xenova/transformers`.

## 4. GIT STRATEGY (Incremental Restoration)
We use the "Save Point" strategy.
- **Branching:** `feat/<module-name>` -> `dev` -> `main`.
- **Commit Protocol:**
    - `docs: <intent>` (Before coding)
    - `test: <failing-test>` (Verification Gate)
    - `feat: <implementation>` (The Fix)
    - `chore: <cleanup>`
- **Rule:** Never commit broken code. If the Verification Script fails, revert or fix immediately.

## 5. CURRENT PHASE: PHASE 2 (DATA PLANE)
We are building the Ingestion Engine.
- **Input:** Text/PDFs via API.
- **Process:** Queue (BullMQ) -> Chunking -> Embedding (Local ONNX) -> Qdrant.
- **Status:** Infra is Green. We are implementing Schemas and Workers now.