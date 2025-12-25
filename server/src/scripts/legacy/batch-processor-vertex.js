import mongoose from 'mongoose';
import { Storage } from '@google-cloud/storage';
import { JobServiceClient } from '@google-cloud/aiplatform';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const {
    GCP_PROJECT_ID,
    GCP_LOCATION,
    GCS_BUCKET_NAME,
    MONGO_URI
} = process.env;

if (!GCP_PROJECT_ID || !GCS_BUCKET_NAME) {
    console.error('❌ Missing GCP_PROJECT_ID or GCS_BUCKET_NAME in .env');
    process.exit(1);
}

// Initialize GCP Clients
const storage = new Storage({ projectId: GCP_PROJECT_ID });
const jobClient = new JobServiceClient({ 
    apiEndpoint: `${GCP_LOCATION}-aiplatform.googleapis.com` 
});

// Mongoose Schemas
const RawConversation = mongoose.models.RawConversation || mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }), 'rawconversations');

const NeuralArchiveSchema = new mongoose.Schema({
    originalId: mongoose.Schema.Types.ObjectId,
    intent: String,
    struggle_score: Number,
    tech_context: String,
    is_milestone: Boolean,
    processedAt: { type: Date, default: Date.now }
});

const NeuralArchive = mongoose.models.NeuralArchive || mongoose.model('NeuralArchive', NeuralArchiveSchema, 'neuralarchives');

/**
 * Phase 1: Export MongoDB to JSONL (Streaming)
 */
async function exportToJsonl(outputPath) {
    console.log('📦 Phase 1: Exporting MongoDB to JSONL...');
    const writeStream = fs.createWriteStream(outputPath);
    
    // Stream from MongoDB
    const cursor = RawConversation.find({ batch_submitted: { $ne: true } }).cursor();

    let count = 0;
    for await (const doc of cursor) {
        const content = doc.data || doc;
        const promptText = typeof content === 'string' ? content : JSON.stringify(content);

        const request = {
            request: {
                contents: [{
                    role: "user",
                    parts: [{
                        text: `Analyze this developer log exchange and extract metadata. 
                        Dev Log: ${promptText}
                        
                        Return ONLY a JSON object with this structure:
                        {
                            "intent": "Brief description of what the user was trying to do",
                            "struggle_score": 1-10 (1 = smooth, 10 = critical blocker),
                            "tech_context": "Technologies, libraries, or specific files mentioned",
                            "is_milestone": boolean (true if this represents a significant project achievement)
                        }`
                    }]
                }]
            }
        };
        
        writeStream.write(JSON.stringify(request) + '\n');
        count++;
        if (count % 1000 === 0) console.log(`   Processed ${count} docs...`);
    }
    
    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
            console.log(`✅ Exported ${count} documents to ${outputPath}`);
            resolve(count);
        });
        writeStream.on('error', reject);
        writeStream.end();
    });
}

/**
 * Phase 2: Upload to GCS
 */
async function uploadToGcs(localPath, gcsFileName) {
    console.log(`☁️ Phase 2: Ensuring bucket gs://${GCS_BUCKET_NAME} exists...`);
    const bucket = storage.bucket(GCS_BUCKET_NAME);
    
    const [exists] = await bucket.exists();
    if (!exists) {
        console.log(`   Bucket does not exist. Creating in ${GCP_LOCATION}...`);
        await storage.createBucket(GCS_BUCKET_NAME, {
            location: GCP_LOCATION,
            storageClass: 'STANDARD',
        });
        console.log('   Bucket created.');
    }

    // Check if file already exists in GCS with matching size to be idempotent
    const file = bucket.file(gcsFileName);
    try {
        const [metadata] = await file.getMetadata();
        const remoteSize = parseInt(metadata.size, 10);
        const localSize = fs.statSync(localPath).size;

        if (remoteSize === localSize) {
            console.log(`   File gs://${GCS_BUCKET_NAME}/${gcsFileName} already exists with matching size (${remoteSize} bytes). Skipping upload.`);
            return;
        } else {
            console.log(`   File exists but size mismatch (Local: ${localSize}, Remote: ${remoteSize}). Re-uploading...`);
        }
    } catch (err) {
        if (err.code !== 404) {
            console.error(`   Error checking GCS file: ${err.message}`);
            throw err;
        }
        // File doesn't exist, proceed to upload
    }

    console.log(`   Uploading ${gcsFileName}...`);
    await bucket.upload(localPath, {
        destination: gcsFileName,
        resumable: true
    });
    console.log('✅ Upload complete.');
}

/**
 * Phase 3: Submit Vertex AI Batch Job
 */
async function submitBatchJob(gcsInputUri) {
    console.log('🚀 Phase 3: Submitting Vertex AI Batch Prediction Job...');
    const parent = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}`;
    
    // Idempotency: Check if a job for this input already exists
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
                console.log('✅ Job already succeeded. Ready for import.');
                return activeJob.name;
            }
            console.log('⏳ Job is still processing. Exiting to avoid duplicate submission.');
            process.exit(0);
        }
    } catch (err) {
        console.warn(`⚠️ Could not check existing jobs: ${err.message}. Proceeding with submission...`);
    }

    // Model path for Gemini 1.5 Flash in Vertex AI Batch
    const modelName = `projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/gemini-1.5-flash-001`;

    const batchPredictionJob = {
        displayName: `Brain_ETL_Batch`,
        model: modelName,
        inputConfig: {
            instancesFormat: 'jsonl',
            gcsSource: { uris: [gcsInputUri] }
        },
        outputConfig: {
            predictionsFormat: 'jsonl',
            gcsDestination: { outputUriPrefix: `gs://${GCS_BUCKET_NAME}/results/` }
        }
    };

    const [response] = await jobClient.createBatchPredictionJob({ parent, batchPredictionJob });
    console.log(`✅ Job submitted: ${response.name}`);
    return response.name;
}

/**
 * Phase 4: Import Results (GCS -> MongoDB)
 */
async function importResults() {
    console.log('📥 Phase 4: Importing results from GCS...');
    const [files] = await storage.bucket(GCS_BUCKET_NAME).getFiles({ prefix: 'results/' });
    
    let totalImported = 0;
    for (const file of files) {
        if (!file.name.endsWith('.jsonl')) continue;
        
        console.log(`   Processing ${file.name}...`);
        const [content] = await file.download();
        const lines = content.toString().split('\n').filter(l => l.trim());
        
        const bulkOps = [];
        for (const line of lines) {
            try {
                const result = JSON.parse(line);
                // Vertex AI Batch output structure: result.response.candidates[0].content.parts[0].text
                const predictionText = result.response.candidates[0].content.parts[0].text;
                
                // Clean JSON response
                const jsonMatch = predictionText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) continue;
                
                const prediction = JSON.parse(jsonMatch[0]);
                
                bulkOps.push({
                    insertOne: {
                        document: {
                            ...prediction,
                            processedAt: new Date()
                        }
                    }
                });
            } catch (e) {
                console.error(`   Failed to parse line: ${e.message}`);
            }
        }

        if (bulkOps.length > 0) {
            await NeuralArchive.bulkWrite(bulkOps);
            totalImported += bulkOps.length;
            console.log(`   Imported ${bulkOps.length} records from ${file.name}`);
        }
    }
    console.log(`✅ Import complete. Total records: ${totalImported}`);
}

/**
 * Orchestrator
 */
async function main() {
    const args = process.argv.slice(2);
    const localFile = path.resolve(process.cwd(), 'batch_input.jsonl');
    // Use a stable filename for the current batch attempt to allow resumption
    const gcsFile = `batch_input.jsonl`; 

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/secondbrain');
        console.log('Connected.');

        if (args.includes('--import-results')) {
            await importResults();
        } else {
            let count = 0;
            
            // Idempotent Export: Skip if local file exists and has data
            if (fs.existsSync(localFile) && fs.statSync(localFile).size > 0) {
                console.log(`ℹ️ Local export file ${localFile} already exists. Skipping Phase 1.`);
                count = 1; // Assume we have data
            } else {
                count = await exportToJsonl(localFile);
            }

            if (count > 0 || fs.existsSync(localFile)) {
                await uploadToGcs(localFile, gcsFile);
                await submitBatchJob(`gs://${GCS_BUCKET_NAME}/${gcsFile}`);
                
                // Mark as submitted in Mongo only after successful submission
                const result = await RawConversation.updateMany(
                    { batch_submitted: { $ne: true } },
                    { $set: { batch_submitted: true } }
                );
                console.log(`✅ Marked ${result.modifiedCount} documents as batch_submitted.`);
            } else {
                console.log('ℹ️ No new documents to process.');
            }
        }
    } catch (error) {
        console.error('❌ Critical Failure:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        // Cleanup local file if it exists
        if (fs.existsSync(localFile)) {
            // fs.unlinkSync(localFile); // Uncomment to auto-delete
        }
    }
}

// Only run if called directly
const isDirectRun = process.argv[1] && (path.resolve(process.argv[1]) === path.resolve(__filename));
if (isDirectRun) {
    main();
}

export { main as batchProcessor };
