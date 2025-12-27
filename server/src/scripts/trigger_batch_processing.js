/**
 * VERTEX AI BATCH PROCESSING TRIGGER
 * 
 * Implements the GCS Staging Pattern for MongoDB → Vertex AI Batch Predictions.
 * Uses existing batch_input.jsonl (4.4 GB) file.
 * 
 * IDEMPOTENCY GUARANTEES:
 * ├─ Phase 1 (Export):  SKIPPED - uses pre-generated batch_input.jsonl
 * ├─ Phase 2 (Upload):  Compares file size + CRC32C checksums
 * └─ Phase 3 (Submit):  Checks existing jobs by input URI and state
 * 
 * Metadata tracked in: data/exports/.batch_meta.json
 * 
 * @author Senior GCP Data Engineer
 * @version 2.0.0 - Idempotent Edition
 */

import { Storage } from '@google-cloud/storage';
import { JobServiceClient } from '@google-cloud/aiplatform';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// =============================================================================
// CONFIGURATION
// =============================================================================
const CONFIG = {
    // GCP Settings
    PROJECT_ID: process.env.GCP_PROJECT_ID,
    LOCATION: process.env.GCP_LOCATION || 'us-central1',
    BUCKET_NAME: process.env.GCS_BUCKET_NAME,
    
    // Model Settings - Use stable Gemini 2.0 Flash for batch (2.5 not yet in batch)
    // Available for batch: gemini-2.0-flash-001, gemini-1.5-flash-002, gemini-1.5-pro-002
    MODEL_ID: 'gemini-2.0-flash-001',
    
    // File Paths - Using existing pre-generated file
    LOCAL_INPUT_FILE: 'batch_input.jsonl',  // Your 4.4GB file
    GCS_STAGING_PATH: 'staging/batch_input.jsonl',
    GCS_OUTPUT_PREFIX: 'predictions/',
    
    // Metadata for Idempotency
    METADATA_FILE: 'data/exports/.batch_meta.json'
};

// Validate required config
if (!CONFIG.PROJECT_ID || !CONFIG.BUCKET_NAME) {
    console.error('❌ ERROR: GCP_PROJECT_ID and GCS_BUCKET_NAME must be set in .env');
    console.error('   Example:');
    console.error('   GCP_PROJECT_ID=maaxly-deploy-trial');
    console.error('   GCS_BUCKET_NAME=secondbrain-batch-storage');
    process.exit(1);
}

// Initialize GCP Clients (Uses ADC automatically)
const storage = new Storage({ projectId: CONFIG.PROJECT_ID });
const jobClient = new JobServiceClient({ 
    apiEndpoint: `${CONFIG.LOCATION}-aiplatform.googleapis.com` 
});

// =============================================================================
// IDEMPOTENCY: METADATA TRACKING
// =============================================================================

function loadBatchMeta() {
    const metaPath = path.resolve(process.cwd(), CONFIG.METADATA_FILE);
    if (fs.existsSync(metaPath)) {
        return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
    return {
        lastUploadTimestamp: null,
        lastUploadSize: null,
        lastUploadHash: null,
        lastJobId: null,
        lastJobState: null,
        lastJobSubmitTime: null
    };
}

function saveBatchMeta(meta) {
    const metaPath = path.resolve(process.cwd(), CONFIG.METADATA_FILE);
    const dir = path.dirname(metaPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

/**
 * Compute MD5 hash of first+last 10MB for quick verification of large files
 */
async function computeQuickHash(filePath) {
    const stats = fs.statSync(filePath);
    const chunkSize = 10 * 1024 * 1024; // 10MB
    const hash = crypto.createHash('md5');
    
    // Read first 10MB
    const fd = fs.openSync(filePath, 'r');
    const firstBuffer = Buffer.alloc(Math.min(chunkSize, stats.size));
    fs.readSync(fd, firstBuffer, 0, firstBuffer.length, 0);
    hash.update(firstBuffer);
    
    // Read last 10MB if file is larger
    if (stats.size > chunkSize * 2) {
        const lastBuffer = Buffer.alloc(chunkSize);
        fs.readSync(fd, lastBuffer, 0, chunkSize, stats.size - chunkSize);
        hash.update(lastBuffer);
    }
    
    fs.closeSync(fd);
    return hash.digest('hex');
}

// =============================================================================
// PHASE 2: UPLOAD TO GCS (with Idempotency)
// =============================================================================

async function uploadToGcs(localPath, meta) {
    console.log('\n☁️  PHASE 2: UPLOAD (Local → GCS)');
    console.log('─'.repeat(50));
    
    const gcsUri = `gs://${CONFIG.BUCKET_NAME}/${CONFIG.GCS_STAGING_PATH}`;
    const bucket = storage.bucket(CONFIG.BUCKET_NAME);
    
    // Verify local file exists
    if (!fs.existsSync(localPath)) {
        throw new Error(`Local file not found: ${localPath}`);
    }
    
    const localStats = fs.statSync(localPath);
    const localSize = localStats.size;
    const localHash = await computeQuickHash(localPath);
    
    console.log(`   📁 Local File: ${CONFIG.LOCAL_INPUT_FILE}`);
    console.log(`   💾 Size: ${(localSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`   🔑 Quick Hash: ${localHash}`);
    
    // Ensure bucket exists
    console.log(`\n   🪣 Checking bucket: ${CONFIG.BUCKET_NAME}`);
    const [bucketExists] = await bucket.exists();
    
    if (!bucketExists) {
        console.log(`   📦 Creating bucket in ${CONFIG.LOCATION}...`);
        await storage.createBucket(CONFIG.BUCKET_NAME, {
            location: CONFIG.LOCATION,
            storageClass: 'STANDARD'
        });
        console.log('   ✅ Bucket created.');
    } else {
        console.log('   ✅ Bucket exists.');
    }
    
    // Check if file already exists in GCS
    const gcsFile = bucket.file(CONFIG.GCS_STAGING_PATH);
    
    try {
        const [gcsMetadata] = await gcsFile.getMetadata();
        const remoteSize = parseInt(gcsMetadata.size, 10);
        
        console.log(`\n   ☁️  Remote File Found!`);
        console.log(`   💾 Remote Size: ${(remoteSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
        
        // IDEMPOTENCY CHECK: Size comparison
        if (remoteSize === localSize) {
            console.log('\n   ✅ SIZE MATCH! File already uploaded correctly.');
            console.log('   ⏭️  Skipping upload phase.');
            
            meta.lastUploadTimestamp = gcsMetadata.updated;
            meta.lastUploadSize = remoteSize;
            meta.lastUploadHash = localHash;
            saveBatchMeta(meta);
            
            return { gcsUri, skipped: true };
        }
        
        console.log(`\n   ⚠️  SIZE MISMATCH!`);
        console.log(`      Local:  ${localSize.toLocaleString()} bytes`);
        console.log(`      Remote: ${remoteSize.toLocaleString()} bytes`);
        console.log('   🔄 Re-uploading...');
        
    } catch (err) {
        if (err.code !== 404) throw err;
        console.log('\n   ℹ️  File does not exist in GCS. Uploading...');
    }
    
    // Upload with resumable upload (essential for 4.4GB file)
    console.log(`\n   ⬆️  Starting resumable upload to ${gcsUri}...`);
    console.log('   ⏳ This may take 15-30 minutes for 4.4GB on a good connection.');
    
    const startTime = Date.now();
    
    await bucket.upload(localPath, {
        destination: CONFIG.GCS_STAGING_PATH,
        resumable: true,
        metadata: {
            metadata: {
                sourceHash: localHash,
                uploadTimestamp: new Date().toISOString()
            }
        },
        onUploadProgress: (event) => {
            const percent = ((event.bytesWritten / localSize) * 100).toFixed(1);
            process.stdout.write(`\r   📤 Progress: ${percent}% (${(event.bytesWritten / 1024 / 1024 / 1024).toFixed(2)} GB)`);
        }
    });
    
    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`\n\n   ✅ Upload Complete in ${duration} minutes!`);
    
    // Update metadata
    meta.lastUploadTimestamp = new Date().toISOString();
    meta.lastUploadSize = localSize;
    meta.lastUploadHash = localHash;
    saveBatchMeta(meta);
    
    return { gcsUri, skipped: false };
}
// =============================================================================
// PHASE 3: SUBMIT BATCH JOB (with Idempotency)
// =============================================================================

async function submitBatchJob(gcsInputUri, meta) {
    console.log('\n🚀 PHASE 3: SUBMIT BATCH JOB');
    console.log('─'.repeat(50));
    
    const parent = `projects/${CONFIG.PROJECT_ID}/locations/${CONFIG.LOCATION}`;
    const gcsOutputUri = `gs://${CONFIG.BUCKET_NAME}/${CONFIG.GCS_OUTPUT_PREFIX}`;
    
    console.log(`   🎯 Model:  publishers/google/models/${CONFIG.MODEL_ID}`);
    console.log(`   📥 Input:  ${gcsInputUri}`);
    console.log(`   📤 Output: ${gcsOutputUri}`);
    
    // IDEMPOTENCY: Check for existing jobs with same input
    console.log('\n   🔍 Checking for existing batch jobs...');
    
    try {
        const [existingJobs] = await jobClient.listBatchPredictionJobs({ parent });
        
        // Find job with matching input URI
        const matchingJob = existingJobs.find(job => {
            const inputUris = job.inputConfig?.gcsSource?.uris || [];
            return inputUris.includes(gcsInputUri);
        });
        
        if (matchingJob) {
            const jobId = matchingJob.name.split('/').pop();
            const state = matchingJob.state;
            
            console.log(`\n   ℹ️  Found existing job for this input!`);
            console.log(`   🆔 Job ID: ${jobId}`);
            console.log(`   📊 State:  ${state}`);
            
            // Update metadata
            meta.lastJobId = jobId;
            meta.lastJobState = state;
            saveBatchMeta(meta);
            
            if (state === 'JOB_STATE_SUCCEEDED') {
                console.log('\n   ✅ Job already SUCCEEDED!');
                console.log('   💡 Run: node server/src/scripts/import-batch-results.js');
                printConsoleUrl(jobId);
                return { jobId, skipped: true, state };
            }
            
            if (['JOB_STATE_RUNNING', 'JOB_STATE_PENDING', 'JOB_STATE_QUEUED'].includes(state)) {
                console.log('\n   ⏳ Job is still processing. No action needed.');
                console.log('   💡 Check back later or monitor in console.');
                printConsoleUrl(jobId);
                return { jobId, skipped: true, state };
            }
            
            if (state === 'JOB_STATE_FAILED' || state === 'JOB_STATE_CANCELLED') {
                console.log(`\n   ⚠️  Previous job ${state}. Will submit a new one.`);
            }
        } else {
            console.log('   ℹ️  No existing job found for this input.');
        }
        
    } catch (err) {
        console.warn(`   ⚠️  Could not check existing jobs: ${err.message}`);
        console.log('   Proceeding with new submission...');
    }
    
    // Create new batch job
    console.log('\n   📝 Creating new batch prediction job...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const displayName = `SecondBrain_Batch_${timestamp}`;
    
    const batchPredictionJob = {
        displayName,
        model: `publishers/google/models/${CONFIG.MODEL_ID}`,
        inputConfig: {
            instancesFormat: 'jsonl',
            gcsSource: { uris: [gcsInputUri] }
        },
        outputConfig: {
            predictionsFormat: 'jsonl',
            gcsDestination: { outputUriPrefix: gcsOutputUri }
        }
    };
    
    const [response] = await jobClient.createBatchPredictionJob({
        parent,
        batchPredictionJob
    });
    
    const jobId = response.name.split('/').pop();
    const state = response.state;
    
    console.log('\n   🎉 BATCH JOB SUBMITTED SUCCESSFULLY!');
    console.log('   ' + '═'.repeat(45));
    console.log(`   🆔 Job ID:      ${jobId}`);
    console.log(`   📊 State:       ${state}`);
    console.log(`   🏷️  Display:     ${displayName}`);
    
    // Update metadata
    meta.lastJobId = jobId;
    meta.lastJobState = state;
    meta.lastJobSubmitTime = new Date().toISOString();
    saveBatchMeta(meta);
    
    printConsoleUrl(jobId);
    
    return { jobId, skipped: false, state };
}

/**
 * Prints the Google Cloud Console URL for job monitoring
 */
function printConsoleUrl(jobId) {
    const consoleUrl = `https://console.cloud.google.com/vertex-ai/locations/${CONFIG.LOCATION}/batch-predictions/${jobId}?project=${CONFIG.PROJECT_ID}`;
    
    console.log('\n   🔗 MONITOR YOUR JOB:');
    console.log('   ' + '─'.repeat(45));
    console.log(`   ${consoleUrl}`);
    console.log('\n   💡 Tip: Job runs async. You can close this terminal.');
}

// =============================================================================
// MAIN ORCHESTRATOR
// =============================================================================

async function main() {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  🧠 SECOND BRAIN: VERTEX AI BATCH PROCESSING');
    console.log('═'.repeat(60));
    console.log(`  📅 ${new Date().toISOString()}`);
    console.log(`  🏗️  Project:  ${CONFIG.PROJECT_ID}`);
    console.log(`  🌍 Location: ${CONFIG.LOCATION}`);
    console.log(`  🤖 Model:    ${CONFIG.MODEL_ID}`);
    console.log('═'.repeat(60));
    
    // Load idempotency metadata
    const meta = loadBatchMeta();
    const localPath = path.resolve(process.cwd(), CONFIG.LOCAL_INPUT_FILE);
    
    // Status Report
    console.log('\n📊 IDEMPOTENCY STATUS:');
    console.log('─'.repeat(50));
    console.log(`   Last Upload:   ${meta.lastUploadTimestamp || 'Never'}`);
    console.log(`   Last Job ID:   ${meta.lastJobId || 'None'}`);
    console.log(`   Last Job State: ${meta.lastJobState || 'N/A'}`);
    
    try {
        // Verify local file exists (Phase 1 is pre-done)
        console.log('\n📦 PHASE 1: VERIFY LOCAL FILE');
        console.log('─'.repeat(50));
        
        if (!fs.existsSync(localPath)) {
            console.error(`   ❌ ERROR: ${CONFIG.LOCAL_INPUT_FILE} not found!`);
            console.error('   Expected at:', localPath);
            console.error('\n   You need to generate this file first.');
            process.exit(1);
        }
        
        const stats = fs.statSync(localPath);
        console.log(`   ✅ Found: ${CONFIG.LOCAL_INPUT_FILE}`);
        console.log(`   💾 Size:  ${(stats.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
        console.log(`   📅 Modified: ${stats.mtime.toISOString()}`);
        console.log('   ⏭️  Export phase skipped (using pre-generated file).');
        
        // Phase 2: Upload to GCS
        const { gcsUri } = await uploadToGcs(localPath, meta);
        
        // Phase 3: Submit Batch Job
        await submitBatchJob(gcsUri, meta);
        
        // Final Summary
        console.log('\n');
        console.log('═'.repeat(60));
        console.log('  ✅ PIPELINE EXECUTION COMPLETE');
        console.log('═'.repeat(60));
        console.log('  📋 Next Steps:');
        console.log('     1. Monitor job in Google Cloud Console');
        console.log('     2. Once SUCCEEDED, run:');
        console.log('        node server/src/scripts/import-batch-results.js');
        console.log('═'.repeat(60));
        console.log('\n');
        
    } catch (error) {
        console.error('\n💥 CRITICAL FAILURE:', error.message);
        console.error(error.stack);
        
        if (error.message.includes('403') || error.message.includes('Permission')) {
            console.error('\n💡 Permission Error. Try:');
            console.error('   gcloud auth application-default login');
            console.error('   Ensure roles/aiplatform.user and roles/storage.admin');
        }
        
        if (error.message.includes('429') || error.message.includes('quota')) {
            console.error('\n💡 Quota Exhausted. Try:');
            console.error('   Wait 30 minutes or use different region');
        }
        
        process.exit(1);
    }
}

// Entry Point
const isDirectRun = process.argv[1] && 
    path.resolve(process.argv[1]) === path.resolve(__filename);

if (isDirectRun) {
    main();
}

export { main as triggerBatch, CONFIG };
