import mongoose from 'mongoose';
import { Storage } from '@google-cloud/storage';
import { JobServiceClient } from '@google-cloud/aiplatform';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
    GCP_PROJECT_ID,
    GCP_LOCATION = 'us-central1',
    GCS_BUCKET_NAME,
    MONGO_URI
} = process.env;

// Configuration Constants
const CONFIG = {
    MODEL_ID: 'gemini-2.5-flash-001',
    LOCAL_INPUT_FILE: 'temp_batch_input.jsonl',
    GCS_STAGING_PATH: 'staging/temp_batch_input.jsonl',
    GCS_OUTPUT_PATH: 'predictions/',
    MAX_OUTPUT_TOKENS: 1024
};

// Initialize GCP Clients (Uses ADC automatically)
const storage = new Storage({ projectId: GCP_PROJECT_ID });
const jobClient = new JobServiceClient({ 
    apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com` 
});

/**
 * Utility to ask user for input
 */
function askQuestion(query) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.toLowerCase());
    }));
}

/**
 * Phase 1: Export MongoDB to JSONL (Streaming)
 */
async function exportToJsonl(outputPath) {
    console.log('📦 Phase 1: Exporting MongoDB to JSONL...');
    const RawConversation = mongoose.models.RawConversation || mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }), 'rawconversations');
    
    const writeStream = fs.createWriteStream(outputPath);
    const cursor = RawConversation.find({ batch_submitted: { $ne: true } }).cursor();

    let count = 0;
    const exportedIds = [];

    for await (const doc of cursor) {
        const content = doc.data || doc;
        const promptText = typeof content === 'string' ? content : JSON.stringify(content);

        const request = {
            request: {
                contents: [{
                    role: "user",
                    parts: [{ text: `Analyze this developer log exchange and extract metadata (intent, struggle_score, tech_context, is_milestone). Log: ${promptText}` }]
                }],
                generation_config: {
                    max_output_tokens: CONFIG.MAX_OUTPUT_TOKENS,
                    response_mime_type: "application/json"
                }
            }
        };
        
        writeStream.write(JSON.stringify(request) + '\n');
        exportedIds.push(doc._id);
        count++;
        
        if (count % 1000 === 0) {
            console.log(`   Processed ${count} docs...`);
            // Periodically update to avoid massive memory usage for IDs if dataset is huge
            // but for 13k it's fine.
        }
    }
    
    return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
            console.log(`✅ Exported ${count} documents to ${outputPath}`);
            if (exportedIds.length > 0) {
                console.log(`   Marking ${exportedIds.length} docs as batch_submitted...`);
                await RawConversation.updateMany(
                    { _id: { $in: exportedIds } },
                    { $set: { batch_submitted: true, batch_submitted_at: new Date() } }
                );
            }
            resolve(count);
        });
        writeStream.on('error', reject);
        writeStream.end();
    });
}

/**
 * Phase 2: Upload to GCS
 */
async function uploadToGcs(localPath) {
    console.log(`☁️ Phase 2: Ensuring bucket gs://${GCS_BUCKET_NAME} exists...`);
    const bucket = storage.bucket(GCS_BUCKET_NAME);
    
    // Ensure bucket exists
    const [exists] = await bucket.exists();
    if (!exists) {
        console.log(`   Creating bucket ${GCS_BUCKET_NAME}...`);
        await storage.createBucket(GCS_BUCKET_NAME, { location: GCP_LOCATION });
    }

    // Idempotency: Check if file exists and size matches
    const file = bucket.file(CONFIG.GCS_STAGING_PATH);
    try {
        const [metadata] = await file.getMetadata();
        const remoteSize = parseInt(metadata.size, 10);
        const localSize = fs.statSync(localPath).size;

        if (remoteSize === localSize) {
            console.log(`   File gs://${GCS_BUCKET_NAME}/${CONFIG.GCS_STAGING_PATH} already exists with matching size. Skipping upload.`);
            return;
        }
        console.log(`   File exists but size mismatch (Local: ${localSize}, Remote: ${remoteSize}). Re-uploading...`);
    } catch (err) {
        if (err.code !== 404) throw err;
        // File doesn't exist, proceed to upload
    }

    await bucket.upload(localPath, {
        destination: CONFIG.GCS_STAGING_PATH,
        resumable: true
    });
    console.log('✅ Upload complete.');
}

/**
 * Phase 3: Submit Vertex AI Batch Job
 */
async function submitBatchJob() {
    console.log('🚀 Phase 3: Checking for existing Batch Prediction Jobs...');
    const parent = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}`;
    const gcsInputUri = `gs://${GCS_BUCKET_NAME}/${CONFIG.GCS_STAGING_PATH}`;

    // Idempotency: Check if a job for this input is already running or succeeded
    try {
        const [existingJobs] = await jobClient.listBatchPredictionJobs({ parent });
        const activeJob = existingJobs.find(j => 
            j.inputConfig?.gcsSource?.uris?.includes(gcsInputUri) && 
            ['JOB_STATE_RUNNING', 'JOB_STATE_PENDING', 'JOB_STATE_SUCCEEDED'].includes(j.state)
        );

        if (activeJob) {
            console.log(`ℹ️ A batch job for this input is already in state: ${activeJob.state}.`);
            console.log(`   Job Name: ${activeJob.name}`);
            if (activeJob.state === 'JOB_STATE_SUCCEEDED') {
                console.log('✅ Job already succeeded. Ready for import phase.');
                return;
            }
            console.log('⏳ Job is still processing. Exiting to avoid duplicate submission.');
            return;
        }
    } catch (err) {
        console.warn(`⚠️ Could not check existing jobs: ${err.message}. Proceeding with submission...`);
    }

    const modelResource = `publishers/google/models/${CONFIG.MODEL_ID}`;
    const gcsOutputUriPrefix = `gs://${GCS_BUCKET_NAME}/${CONFIG.GCS_OUTPUT_PATH}`;

    const batchPredictionJob = {
        displayName: `SecondBrain_ELT_Batch`,
        model: modelResource,
        inputConfig: {
            instancesFormat: 'jsonl',
            gcsSource: { uris: [gcsInputUri] }
        },
        outputConfig: {
            predictionsFormat: 'jsonl',
            gcsDestination: { outputUriPrefix: gcsOutputUriPrefix }
        }
    };

    const [response] = await jobClient.createBatchPredictionJob({ parent, batchPredictionJob });
    
    console.log('\n🎯 BATCH JOB SUBMITTED SUCCESSFULLY');
    console.log(`🆔 Job ID: ${response.name.split('/').pop()}`);
    console.log(`🔗 Console URL: https://console.cloud.google.com/vertex-ai/locations/${GCP_LOCATION}/batch-predictions/${response.name.split('/').pop()}?project=${GCP_PROJECT_ID}`);
}

/**
 * Main Orchestrator
 */
async function main() {
    if (!GCP_PROJECT_ID || !GCS_BUCKET_NAME) {
        console.error('❌ ERROR: GCP_PROJECT_ID and GCS_BUCKET_NAME must be set in .env');
        process.exit(1);
    }

    const localPath = path.resolve(process.cwd(), CONFIG.LOCAL_INPUT_FILE);

    try {
        await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/secondbrain');
        const RawConversation = mongoose.models.RawConversation || mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }), 'rawconversations');
        
        const pendingCount = await RawConversation.countDocuments({ batch_submitted: { $ne: true } });
        
        if (pendingCount === 0 && fs.existsSync(localPath)) {
            console.log('✅ All documents already exported and local file exists. Skipping Phase 1.');
        } else if (pendingCount > 0) {
            if (fs.existsSync(localPath)) {
                const choice = await askQuestion(`⚠️ ${CONFIG.LOCAL_INPUT_FILE} exists but ${pendingCount} docs are still pending in DB. Overwrite (o) or Append (a - not recommended) or Skip (s)? [o/a/s]: `);
                if (choice === 'o') {
                    await exportToJsonl(localPath);
                } else if (choice === 'a') {
                    console.log('ℹ️ Appending is not implemented for safety. Please delete the file or overwrite.');
                    process.exit(0);
                }
            } else {
                await exportToJsonl(localPath);
            }
        } else if (pendingCount === 0 && !fs.existsSync(localPath)) {
            console.log('⚠️ No pending documents in DB and no local file found. Nothing to do.');
            // We might still want to check GCS/Vertex if we are in "import" mode, but for "trigger" we stop.
            process.exit(0);
        }

        await mongoose.disconnect();

        if (fs.existsSync(localPath)) {
            await uploadToGcs(localPath);
            await submitBatchJob();
        } else {
            console.log('❌ Local input file missing. Cannot proceed to upload/submit.');
        }

    } catch (error) {
        console.error('💥 CRITICAL FAILURE:', error.message);
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        process.exit(1);
    }
}

// Only run if called directly
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectRun) {
    main();
}

export { main as triggerBatch };
