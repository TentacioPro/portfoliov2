import express from 'express';
import { generateAnswer } from '../services/retrieval.js';
import { chatStorage } from '../services/chatStorage.js';

const router = express.Router();

// --- Session Management ---

/**
 * GET /api/chat/sessions
 * List all chat sessions
 */
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await chatStorage.listSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/sessions
 * Create a new session
 */
router.post('/sessions', async (req, res) => {
  try {
    const session = await chatStorage.createSession();
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/chat/sessions/:id
 * Get a specific session
 */
router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await chatStorage.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/chat/sessions/:id
 * Delete a session
 */
router.delete('/sessions/:id', async (req, res) => {
  try {
    await chatStorage.deleteSession(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/chat/sessions/:id
 * Update session title
 */
router.patch('/sessions/:id', async (req, res) => {
    try {
        const { title } = req.body;
        const session = await chatStorage.updateTitle(req.params.id, title);
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// --- Chat Interaction ---

/**
 * POST /api/chat
 * Query the knowledge base and get an AI-generated answer
 */
router.post('/', async (req, res) => {
  try {
    const { message, provider, sessionId } = req.body;

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

    // 1. Save User Message (if sessionId provided)
    if (sessionId) {
        await chatStorage.addMessage(sessionId, {
            role: 'user',
            content: message
        });
    }

    // 2. Generate answer using RAG pipeline
    const result = await generateAnswer(message, provider);

    // 3. Save Assistant Message (if sessionId provided)
    if (sessionId) {
        await chatStorage.addMessage(sessionId, {
            role: 'assistant',
            content: result.answer,
            citations: result.citations || []
        });
    }

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
