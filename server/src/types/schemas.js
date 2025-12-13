import { z } from 'zod';

/**
 * Schema for the Ingestion Job (POST /ingest)
 * Validates raw text input before processing.
 */
export const IngestJobSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters long"),
  source: z.string().min(1, "Source identifier (URL or filepath) is required"),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

/**
 * Schema for a Vector Point (Qdrant Payload)
 * Defines the structure of data sent to the Vector Database.
 */
export const VectorPointSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  vector: z.array(z.number()),
  payload: z.object({
    text: z.string(),
    source: z.string(),
    chunkIndex: z.number().int().nonnegative().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

/**
 * JSDoc Type Definitions for IntelliSense
 * @typedef {z.infer<typeof IngestJobSchema>} IngestJob
 * @typedef {z.infer<typeof VectorPointSchema>} VectorPoint
 */