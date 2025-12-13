import express from 'express';
import cors from 'cors';
import { connectDB } from './src/services/db.js';
import redisClient from './src/services/cache.js';
import { checkConnection as checkVector, ensureCollection } from './src/services/vector.js';
import { initIngestionWorker } from './src/workers/ingestion.js';
import { port } from './src/config/env.js';
import ingestRouter from './src/routes/ingest.js';
import resumeRouter from './src/routes/resume.js';
import chatRouter from './src/routes/chat.js';
import graphRouter from './src/routes/graph.js';

const app = express();
app.use(cors());
app.use(express.json());

// Mount API Routes
console.log('📍 Mounting /api/ingest route...');
app.use('/api/ingest', ingestRouter);
console.log('📍 Mounting /api/resume route...');
app.use('/api/resume', resumeRouter);
console.log('📍 Mounting /api/chat route...');
app.use('/api/chat', chatRouter);
console.log('📍 Mounting /api/graph route...');
app.use('/api/graph', graphRouter);
console.log('📍 Routes mounted successfully');

// STATUS STATE
let systemStatus = {
    database: 'INITIALIZING',
    vector: 'INITIALIZING',
    cache: 'INITIALIZING',
    worker: 'INITIALIZING'
};
// INITIALIZATION SEQUENCE
async function ignite() {
    // 1. Connect Mongo
    const dbUp = await connectDB();
    systemStatus.database = dbUp ? 'CONNECTED' : 'FAILED';

    // 2. Check Vector & Ensure Collection
    const vecUp = await checkVector();
    if (vecUp) {
        await ensureCollection('secondbrain');
    }
    systemStatus.vector = vecUp ? 'CONNECTED' : 'FAILED';

    // 3. Check Redis
    try {
        await redisClient.ping();
        systemStatus.cache = 'CONNECTED';
    } catch (e) {
        systemStatus.cache = 'FAILED';
    }

    // 4. Init Worker
    try {
        initIngestionWorker();
        systemStatus.worker = 'ACTIVE';
    } catch (e) {
        console.error('❌ Worker Init Failed', e);
        systemStatus.worker = 'FAILED';
    }

    console.table(systemStatus);
}

app.get('/health', (req, res) => {
    const isHealthy = Object.values(systemStatus).every(s => s === 'CONNECTED' || s === 'ACTIVE');
    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'GREEN' : 'RED',
        pillars: systemStatus
    });
});

app.listen(port, () => {
    console.log(`🧠 Brain Active on Port ${port}`);
    ignite();
});