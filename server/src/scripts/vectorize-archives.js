import mongoose from 'mongoose';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' });
const COLLECTION_NAME = "secondbrain_vectors";
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = "nomic-embed-text";

// Schemas
const NeuralArchiveSchema = new mongoose.Schema({
    originalId: mongoose.Schema.Types.ObjectId,
    intent: String,
    struggle_score: Number,
    tech_context: String,
    response_summary: String,
    analysis: {
        is_milestone: Boolean
    },
    timestamp: { type: Date, default: Date.now },
    vectorized: { type: Boolean, default: false }
});

const NeuralArchive = mongoose.models.NeuralArchive || mongoose.model('NeuralArchive', NeuralArchiveSchema, 'neuralarchives');

async function getEmbedding(text) {
    try {
        const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
            method: 'POST',
            body: JSON.stringify({ model: EMBEDDING_MODEL, prompt: text })
        });
        if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
        const json = await res.json();
        return json.embedding;
    } catch (error) {
        console.error('Embedding error:', error);
        throw error;
    }
}

async function ensureCollection() {
    try {
        const collections = await qdrant.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
        if (!exists) {
            console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
            await qdrant.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: 768, // Size for nomic-embed-text
                    distance: 'Cosine'
                }
            });
        }
    } catch (error) {
        console.error('Error ensuring Qdrant collection:', error);
    }
}

async function vectorize() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain');
        console.log('Connected.');

        // --- IDEMPOTENCY STATUS REPORT ---
        const totalArchives = await NeuralArchive.countDocuments();
        const vectorizedCount = await NeuralArchive.countDocuments({ vectorized: true });
        const eligibleCount = await NeuralArchive.countDocuments({
            vectorized: { $ne: true },
            $or: [
                { "analysis.is_milestone": true },
                { struggle_score: { $gt: 5 } }
            ]
        });
        
        console.log('\n📊 VECTORIZATION STATUS:');
        console.log(`   Total Archives:       ${totalArchives}`);
        console.log(`   Already Vectorized:   ${vectorizedCount}`);
        console.log(`   Eligible & Pending:   ${eligibleCount}`);
        
        if (eligibleCount === 0) {
            console.log('\n✅ No eligible documents pending vectorization. Nothing to do.');
            await mongoose.disconnect();
            return;
        }

        await ensureCollection();
        
        // Check Qdrant collection status
        try {
            const collectionInfo = await qdrant.getCollection(COLLECTION_NAME);
            console.log(`   Qdrant Vectors:       ${collectionInfo.points_count || 0}`);
        } catch (e) {
            console.log(`   Qdrant Vectors:       0 (new collection)`);
        }
        
        console.log(`\n🚀 Processing ${eligibleCount} documents...\n`);

        const candidates = await NeuralArchive.find({
            vectorized: { $ne: true },
            $or: [
                { "analysis.is_milestone": true },
                { struggle_score: { $gt: 5 } }
            ]
        }).limit(100);

        console.log(`Found ${candidates.length} candidates for vectorization.`);

        for (const doc of candidates) {
            const payloadStr = `Intent: ${doc.intent} | Context: ${doc.tech_context} | Summary: ${doc.response_summary}`;
            console.log(`Vectorizing: ${doc._id}`);

            try {
                const vector = await getEmbedding(payloadStr);

                await qdrant.upsert(COLLECTION_NAME, {
                    wait: true,
                    points: [{
                        id: doc._id.toString(),
                        vector: vector,
                        payload: {
                            originalId: doc.originalId?.toString(),
                            timestamp: doc.timestamp,
                            struggle_score: doc.struggle_score,
                            text: payloadStr,
                            intent: doc.intent,
                            is_milestone: doc.analysis?.is_milestone
                        }
                    }]
                });

                await NeuralArchive.updateOne({ _id: doc._id }, { $set: { vectorized: true } });
                console.log(`Successfully vectorized ${doc._id}`);
            } catch (err) {
                console.error(`Failed to vectorize doc ${doc._id}:`, err.message);
            }
        }

        console.log('Vectorization phase complete.');
    } catch (error) {
        console.error('Vectorization error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Only run if called directly
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectRun) {
    vectorize();
}

export { vectorize };
