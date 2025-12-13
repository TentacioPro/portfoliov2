import express from 'express';
import { generateAnswer } from '../services/retrieval.js';

const router = express.Router();

/**
 * POST /api/chat
 * Query the knowledge base and get an AI-generated answer
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid "message" field' 
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message cannot be empty' 
      });
    }

    // Generate answer using RAG pipeline
    const result = await generateAnswer(message);

    return res.json({
      answer: result.answer,
      citations: result.citations || []
    });

  } catch (error) {
    console.error('[Chat API Error]', error);
    return res.status(500).json({ 
      error: 'Failed to generate answer',
      details: error.message 
    });
  }
});

export default router;
