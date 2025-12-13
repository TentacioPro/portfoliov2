import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  static instance = null;
  static modelName = 'Xenova/all-MiniLM-L6-v2';

  constructor() {
    if (EmbeddingService.instance) {
      return EmbeddingService.instance;
    }
    this.pipe = null;
    EmbeddingService.instance = this;
  }

  /**
   * Initializes the model pipeline if not already loaded.
   */
  async init() {
    if (!this.pipe) {
      console.log(`Loading embedding model: ${EmbeddingService.modelName}...`);
      this.pipe = await pipeline('feature-extraction', EmbeddingService.modelName);
      console.log('Model loaded successfully.');
    }
  }

  /**
   * Generates an embedding vector for the given text.
   * @param {string} text - The input text to embed.
   * @returns {Promise<number[]>} - The embedding vector (384 dimensions).
   */
  async getEmbedding(text) {
    if (!this.pipe) {
      await this.init();
    }

    // Generate embedding
    // pooling: 'mean' averages the token vectors to get a single sentence vector
    // normalize: true ensures the vector is unit length (good for cosine similarity)
    const output = await this.pipe(text, { pooling: 'mean', normalize: true });
    
    // Convert Tensor to standard JavaScript array
    return Array.from(output.data);
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();