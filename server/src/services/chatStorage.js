import ChatSession from '../models/ChatSession.js';
import redis from './cache.js';

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'chat_session:';

export const chatStorage = {
  /**
   * Get a chat session by ID
   * Strategy: Cache-Aside (Read-Through)
   */
  async getSession(id) {
    try {
      // 1. Try Redis
      const cached = await redis.get(`${CACHE_PREFIX}${id}`);
      if (cached) {
        // console.log(`[ChatStorage] Cache HIT for ${id}`);
        return JSON.parse(cached);
      }

      // 2. Try Mongo
      // console.log(`[ChatStorage] Cache MISS for ${id}`);
      const session = await ChatSession.findById(id);
      if (!session) return null;

      // 3. Update Redis
      await redis.setex(`${CACHE_PREFIX}${id}`, CACHE_TTL, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('[ChatStorage] Error getting session:', error);
      throw error;
    }
  },

  /**
   * Create a new chat session
   */
  async createSession(title = 'New Chat') {
    try {
      const session = new ChatSession({ title, messages: [] });
      await session.save();
      
      // Cache immediately
      await redis.setex(`${CACHE_PREFIX}${session._id}`, CACHE_TTL, JSON.stringify(session));
      
      return session;
    } catch (error) {
      console.error('[ChatStorage] Error creating session:', error);
      throw error;
    }
  },

  /**
   * Add a message to a session
   * Strategy: Write-Through (Update DB, then Cache)
   */
  async addMessage(sessionId, message) {
    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) throw new Error('Session not found');

      session.messages.push(message);
      
      // Update title if it's the first user message and title is default
      if (session.messages.length === 2 && session.title === 'New Chat' && message.role === 'user') {
         session.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
      }

      await session.save();

      // Update Cache
      await redis.setex(`${CACHE_PREFIX}${sessionId}`, CACHE_TTL, JSON.stringify(session));

      return session;
    } catch (error) {
      console.error('[ChatStorage] Error adding message:', error);
      throw error;
    }
  },

  /**
   * List all sessions (headers only)
   * Strategy: Read from Mongo (Source of Truth)
   */
  async listSessions() {
    try {
      return await ChatSession.find({}, 'title createdAt updatedAt')
        .sort({ updatedAt: -1 });
    } catch (error) {
      console.error('[ChatStorage] Error listing sessions:', error);
      throw error;
    }
  },

  /**
   * Delete a session
   */
  async deleteSession(id) {
    try {
      await ChatSession.findByIdAndDelete(id);
      await redis.del(`${CACHE_PREFIX}${id}`);
      return true;
    } catch (error) {
      console.error('[ChatStorage] Error deleting session:', error);
      throw error;
    }
  },
  
  /**
   * Update session title
   */
  async updateTitle(id, title) {
      try {
          const session = await ChatSession.findByIdAndUpdate(
              id, 
              { title }, 
              { new: true }
          );
          if (session) {
              await redis.setex(`${CACHE_PREFIX}${id}`, CACHE_TTL, JSON.stringify(session));
          }
          return session;
      } catch (error) {
          console.error('[ChatStorage] Error updating title:', error);
          throw error;
      }
  }
};
