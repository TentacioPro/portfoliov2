import { Worker, Queue } from 'bullmq';
import crypto from 'crypto';
import { IngestJobSchema } from '../types/schemas.js';
import { embeddingService } from '../services/embedding.js';
import redisClient from '../services/cache.js';
import { client as qdrantClient } from '../services/vector.js';

/**
 * Queue for ingestion jobs
 */
export const ingestQueue = new Queue('ingestion-queue', {
  connection: redisClient,
});

/**
 * Initialize the Ingestion Worker
 * Processes jobs from 'ingestion-queue'
 */
export const initIngestionWorker = () => {
  console.log('👷 Ingestion Worker: Initializing...');

  const worker = new Worker(
    'ingestion-queue',
    async (job) => {
      try {
        // 1. Validate Input
        const { text, source, metadata } = IngestJobSchema.parse(job.data);

        // 2. Simple Chunking (Truncate to 1000 chars for now)
        const processedText = text.length > 1000 ? text.substring(0, 1000) : text;

        // 3. Generate Embedding
        const vector = await embeddingService.getEmbedding(processedText);

        // 4. Upsert to Qdrant
        const pointId = crypto.randomUUID();
        const payload = {
          text: processedText,
          source,
          metadata: metadata || {},
          originalLength: text.length
        };

        await qdrantClient.upsert('secondbrain', {
          wait: true,
          points: [
            {
              id: pointId,
              vector: vector,
              payload: payload,
            },
          ],
        });

        // 5. Log Success
        console.log(`[Ingest] Processed ${source} (Vector Size: ${vector.length})`);

        return { status: 'success', id: pointId };

      } catch (error) {
        console.error(`[Ingest] Failed to process job ${job.id}: ${error.message}`);
        throw error; // Move job to failed
      }
    },
    {
      connection: redisClient,
      concurrency: 5 // Process 5 jobs in parallel
    }
  );

  worker.on('ready', () => {
    console.log('👷 Ingestion Worker: Ready and listening for jobs.');
  });

  worker.on('failed', (job, err) => {
    console.error(`👷 Ingestion Worker: Job ${job?.id} failed with ${err.message}`);
  });

  return worker;
};
