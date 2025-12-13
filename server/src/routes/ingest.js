import { Router } from 'express';
import { IngestJobSchema } from '../types/schemas.js';
import { ingestQueue } from '../workers/ingestion.js';

const router = Router();

/**
 * POST /
 * Accepts text data and queues it for embedding + vector storage
 */
router.post('/', async (req, res) => {
  try {
    // 1. Validate Request Body
    const validated = IngestJobSchema.parse(req.body);

    // 2. Add to Queue
    const job = await ingestQueue.add('ingest-text', validated, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    // 3. Return 202 Accepted
    res.status(202).json({
      status: 'queued',
      jobId: job.id,
      message: 'Text queued for processing',
    });

    console.log(`[API] Queued job ${job.id} from source: ${validated.source}`);

  } catch (error) {
    // Zod validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors,
      });
    }

    // Other errors
    console.error('[API] Ingest error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to queue ingestion job',
    });
  }
});

export default router;
