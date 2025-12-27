# 🚀 Second Brain OS - Setup Guide (v2)

This guide will help you set up the **Second Brain OS** on a fresh machine. The system is designed to be self-contained using Docker and Node.js.

---

## 📋 Prerequisites

1.  **Git** (for cloning the repo)
2.  **Node.js v20+** (LTS recommended)
3.  **Docker Desktop** (running)
4.  **Google Cloud SDK** (for Vertex AI authentication)
5.  **MongoDB Tools** (optional, for manual data inspection)

---

## 🛠️ Step 1: Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/TentacioPro/portfoliov2.git
cd portfoliov2

# 2. Switch to the v2 branch
git checkout v2

# 3. Install dependencies (Root)
npm install

# 4. Install Client dependencies
cd client
npm install
cd ..

# 5. Install Server dependencies
cd server
npm install
cd ..
```

---

## 🔐 Step 2: Environment Configuration

Create a `.env` file in the root directory:

```dotenv
# --- CORE SERVICES ---
PORT=3001
NODE_ENV=development

# --- DATABASE ---
MONGO_URI=mongodb://localhost:27017/secondbrain
REDIS_URI=redis://localhost:6379

# --- GOOGLE CLOUD (Vertex AI) ---
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GCS_BUCKET_NAME=your-bucket-name

# --- VECTOR DB ---
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://localhost:11434
```

---

## 🐳 Step 3: Start Infrastructure

We use Docker Compose to spin up the persistence layer (MongoDB, Redis, Qdrant).

```bash
# Start services in detached mode
docker-compose up -d

# Verify services are running
docker ps
```

*You should see: `mongo`, `redis`, `qdrant`, and `brain` (API).*

---

## 🔑 Step 4: Google Cloud Authentication

For the Vertex AI Batch pipeline to work, you need Application Default Credentials (ADC).

```bash
# Login to Google Cloud
gcloud auth application-default login

# Verify project selection
gcloud config set project your-project-id
```

---

## 🧠 Step 5: Data Pipeline (ELT)

The system comes with a `fleet-commander` script to manage the data pipeline.

### A. Check Status
```bash
node server/src/scripts/fleet-commander.js --status
```

### B. Run the Pipeline (Batch Mode)
If you have a large dataset (like our 4.5GB logs):

1.  **Upload & Submit Job:**
    ```bash
    node server/src/scripts/fleet-commander.js --phase=batch
    ```
    *This will upload `batch_input.jsonl` to GCS and trigger a Vertex AI job.*

2.  **Import Results:**
    *(Wait for the job to succeed in Google Cloud Console)*
    ```bash
    node server/src/scripts/fleet-commander.js --phase=import
    ```

3.  **Vectorize (Optional):**
    ```bash
    node server/src/scripts/fleet-commander.js --phase=vectorize
    ```

---

## 🖥️ Step 6: Run the Application

### Start the Backend API
```bash
# In /server directory
npm run dev
```

### Start the Frontend Client
```bash
# In /client directory
npm run dev
```

Access the UI at: `http://localhost:5173`

---

## 📚 Troubleshooting

-   **MongoDB Connection Error?** Ensure Docker container is running (`docker ps`).
-   **Vertex AI 403 Error?** Re-run `gcloud auth application-default login`.
-   **Missing Files?** Check `data/exports/` for local data artifacts.

---

**Happy Coding! 🚀**
