export const docsData = {
  title: "Second Brain OS",
  subtitle: "A Self-Sovereign, AI-Native knowledge system built with Docker, Node.js, and Local ML. Zero cloud dependencies. $0.00 cost.",
  
  mission: {
    title: "The Mission",
    description: "We are building a Self-Sovereign, AI-Native 'Second Brain' - a personal knowledge base that runs entirely on your hardware, processes your documents with local embeddings, and answers questions using RAG (Retrieval Augmented Generation). No data leaves your machine. No monthly subscriptions. Complete ownership.",
    specs: [
      { label: "Hardware", value: "Single Node (Dockerized)" },
      { label: "Cost", value: "$0.00 (Self-Hosted Only)" },
      { label: "Stack", value: "Node.js v20, MongoDB, Qdrant, Redis, React" },
      { label: "Philosophy", value: "Automation via Verification" }
    ]
  },

  architecture: {
    title: "The Infrastructure",
    description: "Four services orchestrated with Docker Compose. All state persists in ./data/. Code is stateless.",
    services: [
      { name: "brain", description: "Node.js Express API + BullMQ Workers", port: "3001" },
      { name: "mongo", description: "MongoDB for metadata storage", port: "27017" },
      { name: "cache", description: "Redis for queue and caching", port: "6379" },
      { name: "vector", description: "Qdrant vector database", port: "6333" }
    ]
  },

  philosophy: {
    title: "Coding Standards",
    inspiration: "The 'Eno Reyes' Doctrine",
    tenets: [
      {
        title: "Verification First",
        description: "Before implementing logic, define the Interface (Zod Schema) and the Success Condition (Test). No code is written without a test or schema to prove it works."
      },
      {
        title: "Strict Typing",
        description: "No 'any'. Use JSDoc or TypeScript Interfaces for all data crossing boundaries (API, Queue, DB). Functions must fit on one screen."
      },
      {
        title: "No Hallucinations",
        description: "Do not invent libraries. Use ONLY: express, mongoose, bullmq, @qdrant/js-client-rest, @xenova/transformers, groq-sdk."
      }
    ]
  },
  prompts: [
    {
      id: "prompt-1",
      phase: "Phase 2: Data Plane",
      title: "PROMPT 1: Define Zod Schemas",
      description: "Strict validation for data ingestion pipeline using Zod schemas.",
      code: `@workspace I need to define the Zod schemas for our Data Ingestion Pipeline in server/src/types/schemas.js.

Context: We are in Phase 2. We need strict validation before data enters our Queue or Database.

Requirements:
- IngestJobSchema: Validates the POST /ingest payload. Must have text (min 10 chars), source (url/file), and optional metadata.
- VectorPoint: Defines what we send to Qdrant. Needs id (UUID), vector (array of numbers), and payload (JSON).

Constraint: Export these as standard JSDoc-typed objects or Zod schemas.`
    },
    {
      id: "prompt-2",
      phase: "Phase 2: Data Plane",
      title: "PROMPT 2: Implement Embedding Service",
      description: "Local embedding generation using @xenova/transformers with Singleton pattern.",
      code: `@workspace Implement the Embedding Service in server/src/services/embedding.js.

Context: We need a local embedding generator using @xenova/transformers.

Constraint:
- Use the Singleton pattern. The pipeline feature-extraction model (Xenova/all-MiniLM-L6-v2) should only load once.
- Function getEmbedding(text) should return a Promise<number[]>.

Verification: Create a standalone script server/src/scripts/verify-embedding.js that embeds the string "Hello World" and logs the vector length (should be 384).`
    },
    {
      id: "prompt-3",
      phase: "Phase 2: Data Plane",
      title: "PROMPT 3: Implement Ingestion Worker",
      description: "BullMQ worker for processing embeddings and upserting to Qdrant.",
      code: `@workspace Create server/src/workers/ingestion.js.

REQUIREMENTS:
1. Setup: Create a BullMQ Worker named 'ingestion-queue'.
2. Connection: Use the redisClient from ../services/cache.js.
3. Process Job:
   - Extract { text, source, metadata } from job.data.
   - Validate: Use IngestJobSchema.parse(). If it fails, throw error.
   - Embed: Call embeddingService.getEmbedding(text).
   - Chunking: If text > 1000 chars, take first 1000.
   - Upsert: Use qdrantClient to upsert into collection 'secondbrain'.
     * ID: Generate UUID (crypto.randomUUID()).
     * Vector: Output from embedding service.
     * Payload: { text, source, metadata }.
4. Logging: console.log [Ingest] Processed \${source} (Vector Size: \${vector.length}).

CONSTRAINT: Use ES Modules (import). Export as initIngestionWorker().`
    },
    {
      id: "prompt-4",
      phase: "Phase 2: Data Plane",
      title: "PROMPT 4: Refactor to ESM & Vector Service",
      description: "Convert entire backend to ES Modules and ensure Qdrant collection exists.",
      code: `@workspace Refactor to ES Modules and ensure Qdrant collection.

TASK 1: Refactor server/src/services/vector.js to ESM.
- Change require to import.
- Export client and checkConnection using export const.
- ADD function ensureCollection(collectionName).
  * Check if collection exists.
  * If NOT, create it with vectors: { size: 384, distance: 'Cosine' }.
  * Log: "✅ Qdrant: Collection 'secondbrain' ready."

TASK 2: Refactor server/src/services/db.js and cache.js to ESM.

TASK 3: Refactor server/index.js to ESM.
- Import initIngestionWorker from ./src/workers/ingestion.js.
- Import ensureCollection from ./src/services/vector.js.
- In ignite() function:
  1. Await connectDB().
  2. Await ensureCollection('secondbrain').
  3. Init initIngestionWorker().`
    },
    {
      id: "prompt-5",
      phase: "Phase 2: Data Plane",
      title: "PROMPT 5: Implement Ingest API",
      description: "HTTP endpoint for submitting text to the ingestion queue.",
      code: `@workspace Create server/src/routes/ingest.js.

TASK:
- Use Express Router.
- POST /:
  * Validate body using IngestJobSchema (import from ../types/schemas.js).
  * Add job to ingestion-queue (export queue from ingestion.js).
  * Return 202 Accepted: { status: 'queued', jobId }.

UPDATE server/index.js:
- Import the ingest route.
- Mount it at /api/ingest.`
    },
    {
      id: "prompt-6",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 6: Implement LaTeX Service",
      description: "Compile LaTeX strings to PDF using Tectonic.",
      code: `@workspace Create server/src/services/latex.js (ESM).

REQUIREMENTS:
1. Export: compileToPdf(latexString) returns Promise<Buffer>.
2. Logic:
   - Use child_process.spawn.
   - Command: tectonic - (hyphen reads from stdin).
   - Write latexString to stdin.
   - Capture stdout chunks into Buffer (the PDF).
   - Capture stderr for error logging.
   - IMPORTANT: Use temp file approach for robustness:
     a. Write latexString to temp/input.tex.
     b. Run tectonic temp/input.tex --outdir temp/.
     c. Read temp/input.pdf into Buffer.
     d. Cleanup temp files.
   - Use crypto.randomUUID() for unique filenames.
3. Error Handling: If exit code != 0, throw Error with stderr log.`
    },
    {
      id: "prompt-7",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 7: Verify LaTeX Engine",
      description: "Test script to verify PDF generation works inside Docker.",
      code: `@workspace Create server/src/scripts/verify-latex.js.

REQUIREMENTS:
1. Define minimal LaTeX string:
   \\documentclass{article}\\begin{document}Hello World from Eno Reyes\\end{document}
2. Call compileToPdf(latex).
3. Check if output Buffer starts with %PDF (magic bytes).
4. Log: "✅ PDF Generated (Size: X bytes)".
5. Optional: Write to output.pdf for manual inspection.`
    },
    {
      id: "prompt-8",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 8: Implement Resume API",
      description: "End-to-end pipeline for generating PDF resumes from form data.",
      code: `@workspace Build Resume Generation Pipeline.

TASK 1: THE TEMPLATE
Create server/src/templates/resume.js (ESM).
- Export function: generateResumeTex(data) => string.
- Return standard LaTeX string (\\documentclass{article}).
- Dynamic Data: Accept { name, title, summary, skills }.
- Formatting: Clean layout (itemize for skills, bold for name).
- Escaping: Helper to escape LaTeX special chars (&, %, $).

TASK 2: THE CONTROLLER
Create server/src/routes/resume.js.
- Express Router.
- POST /generate:
  * Extract body: { name, title, summary, skills }.
  * Call generateResumeTex(body) to get string.
  * Call latexService.compileToPdf(texString).
  * Response:
    - Header: Content-Type: application/pdf
    - Header: Content-Disposition: attachment; filename="resume.pdf"
    - Send Buffer.

TASK 3: MOUNT
Update server/index.js: Mount at /api/resume.`
    },
    {
      id: "prompt-9",
      phase: "Phase 4: Frontend Glass",
      title: "PROMPT 9: Configure Vite Proxy",
      description: "Proxy API requests to avoid CORS issues.",
      code: `@workspace Update client/vite.config.js.

TASK:
- Add server.proxy configuration.
- Rule: Any request starting with /api should target http://localhost:3001.
- Ensure changeOrigin: true.
- Keep existing plugins (React).`
    },
    {
      id: "prompt-10",
      phase: "Phase 4: Frontend Glass",
      title: "PROMPT 10: Create API Client",
      description: "Central place for all API calls from React app.",
      code: `@workspace Create client/src/api/client.js.

REQUIREMENTS:
1. Resume Generator:
   - Export function generateResume(data).
   - Method: POST /api/resume/generate.
   - Body: { name, title, summary, skills }.
   - IMPORTANT: Set responseType: 'blob' (binary PDF).
   - Return the Blob.

2. Ingestion (Future proofing):
   - Export function ingestText(text, source).
   - Method: POST /api/ingest.

3. Error Handling: Wrap in try/catch and console.error failures.`
    },
    {
      id: "prompt-11",
      phase: "Phase 4: Frontend Glass",
      title: "PROMPT 11: Build Resume Component",
      description: "Split-screen UI for resume generation with live preview.",
      code: `@workspace Create client/src/components/ResumeBuilder.jsx.

REQUIREMENTS:
1. Layout: Two columns (Split Screen).
   - Left: Input Form.
   - Right: Preview/Status Area.
2. Form Fields:
   - Name (Text)
   - Title (Text)
   - Summary (Textarea)
   - Skills (Text input, comma-separated -> array).
3. Action:
   - "Generate PDF" button.
   - On Click: Call client.generateResume(formData).
   - Show "Generating Artifact..." spinner while waiting.
4. Success State:
   - Create window.URL.createObjectURL(blob).
   - Display "Download PDF" button linking to that URL.
   - BONUS: Try <iframe src={blobUrl}>.
5. Styling: Use Tailwind CSS (Dark Mode style).`
    },
    {
      id: "prompt-12",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 12: Implement Retrieval Service",
      description: "RAG pipeline with semantic search and LLM answer generation.",
      code: `@workspace Create server/src/services/retrieval.js (ESM).

REQUIREMENTS:
1. Import: qdrantClient from ./vector.js and embeddingService from ./embedding.js.
2. Export: search(query, limit = 5) returns Promise<Array>.
3. Logic:
   - Embed the query string using embeddingService.getEmbedding(query).
   - Call qdrantClient.search('secondbrain', { vector: embedding, limit }).
   - Map result to return clean array of { text, source, score }.
4. Export: generateAnswer(query) (The RAG chain).
   - Call search(query).
   - Construct System Prompt: "You are a Second Brain. Answer based ONLY on the context below...".
   - Call Groq SDK (using process.env.GROQ_API_KEY) to generate response.
   - Return { answer, citations: [...] }.

CONSTRAINT: Use @xenova/transformers for embedding. Use groq-sdk for LLM.`
    },
    {
      id: "prompt-13",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 13: Verify RAG Pipeline",
      description: "Test script to verify retrieval and answer generation.",
      code: `@workspace Create server/src/scripts/verify-rag.js.

REQUIREMENTS:
1. Query: "What are Eno Reyes' skills?" (or relevant to ingested text).
2. Action: Call retrieval.generateAnswer(query).
3. Log:
   - Top 3 Retrieved Chunks (with scores).
   - The Final LLM Answer.
4. Success Condition: Answer must contain keywords found in the chunks.`
    },
    {
      id: "prompt-14",
      phase: "Phase 3: Artifact Engine",
      title: "PROMPT 14: Implement Knowledge Seeder",
      description: "Batch PDF ingestion script using pdf-parse.",
      code: `@workspace Create server/src/scripts/seed-knowledge.js.

REQUIREMENTS:
1. Dependencies: fs, pdf-parse, axios (or native fetch).
2. Logic:
   - Scan project root (or specific folder) for .pdf files.
   - For each PDF:
     * Extract text using pdf-parse.
     * Clean text (remove excessive newlines).
     * Send to http://localhost:3001/api/ingest.
     * Payload: { text: extractedText, source: fileName }.
3. Logging: "🌱 Seeding [File]... ✅ Queued."

VERIFICATION: Run script, then query RAG verification script again.`
    },
    {
      id: "prompt-15",
      phase: "Phase 4: Frontend Glass",
      title: "PROMPT 15: Build Chat Interface",
      description: "ChatGPT-style interface with conversation history and citations.",
      code: `@workspace Build Second Brain Chatbot.

TASK 1: CREATE CHAT ROUTE (Backend)
Create server/src/routes/chat.js.
- Import retrievalService from ../services/retrieval.js.
- POST /:
  * Body: { message }.
  * Call retrievalService.generateAnswer(message).
  * Return: { answer, citations }.
- MOUNT in server/index.js at /api/chat.

TASK 2: CREATE CHAT COMPONENT (Frontend)
Create client/src/components/ChatInterface.jsx.
- UI: Classic chat window (fixed height, scrollable).
  * Messages list (User = Right/Blue, Bot = Left/Gray).
  * Input area at bottom.
- Logic:
  * State: messages array [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }].
  * On Submit:
    - Add User message to state.
    - Show "Thinking..." indicator.
    - Call API client.post('/api/chat', { message }).
    - Add Assistant message to state.
    - CITATIONS: Display as small footnotes below bot message.
- Style: Dark mode, clean typography (Tailwind).

TASK 3: INTEGRATE
Add <ChatInterface /> to App.jsx.`
    },
    {
      id: "prompt-16",
      phase: "Phase 5: Visualization",
      title: "PROMPT 16: Create Roadmap Visualization",
      description: "Metro-map style timeline showing project phases and tasks.",
      code: `@workspace Create Roadmap Data Structure.

TASK 1: CREATE DATA FILE
Create client/src/data/roadmap.json.
- Structure: Array of Phases.
- Phase Object: { id, title, description, status: 'completed'|'in-progress'|'planned', tasks: [] }.
- Task Object: { id, title, status: 'done'|'pending' }.
- Content: Populate with REAL work:
  * Phase 1: Infrastructure (Green).
  * Phase 2: The Brain (Green).
  * Phase 3: Artifact Engine (Green).
  * Phase 4: Frontend Glass (Green).
  * Phase 5: Visualization (In Progress).

TASK 2: CREATE ROADMAP COMPONENT
Create client/src/components/Roadmap.jsx.
- Design: Vertical timeline or "Metro Map" style layout.
- Visuals:
  * Completed Phases: Green/Dimmed.
  * Active Phase: Bright/Pulsing (Use Tailwind animate-pulse).
  * Future Phases: Gray/dashed.
- Interactivity: Hovering over phase shows list of sub-tasks.
- Integration: Export component to be used in App.jsx.`
    }
  ]
};