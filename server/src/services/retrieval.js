import { client as qdrantClient } from './vector.js';
import { embeddingService } from './embedding.js';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { groqKey, googleKey } from '../config/env.js';

// Initialize Groq client
const groq = new Groq({ apiKey: groqKey });

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(googleKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Search for relevant documents using semantic similarity
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of search results with text, source, and score
 */
export async function search(query, limit = 5) {
  try {
    // 1. Generate embedding for the query
    const embedding = await embeddingService.getEmbedding(query);

    // 2. Search Qdrant
    const results = await qdrantClient.search('secondbrain', {
      vector: embedding,
      limit: limit,
      with_payload: true,
    });

    // 3. Map to clean format
    const cleanResults = results.map(result => ({
      text: result.payload?.text || '',
      source: result.payload?.source || 'unknown',
      score: result.score,
      metadata: result.payload?.metadata || {},
    }));

    console.log(`[Retrieval] Found ${cleanResults.length} results for query: "${query}"`);
    return cleanResults;

  } catch (error) {
    console.error('[Retrieval] Search failed:', error.message);
    throw error;
  }
}

/**
 * Generate an answer using RAG (Retrieval Augmented Generation)
 * @param {string} query - The user's question
 * @param {string} provider - The LLM provider ('groq' or 'gemini')
 * @returns {Promise<Object>} - Answer with citations
 */
export async function generateAnswer(query, provider = 'groq') {
  try {
    // 1. Retrieve relevant context
    const searchResults = await search(query, 5);

    if (searchResults.length === 0) {
      return {
        answer: "I don't have any information in my knowledge base to answer that question.",
        citations: [],
      };
    }

    // 2. Construct context from search results
    const context = searchResults
      .map((result, idx) => `[${idx + 1}] ${result.text} (Source: ${result.source})`)
      .join('\n\n');

    let answer = '';

    if (provider === 'gemini') {
      // Gemini Logic
      const prompt = `You are a Second Brain assistant. Answer questions based ONLY on the context provided below. 
If the context doesn't contain relevant information, say so clearly.
When referencing information, mention the source numbers [1], [2], etc.

Context:
${context}

Question: ${query}`;

      console.log(`[RAG] Generating answer with Gemini for: "${query}"`);
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      answer = response.text();

    } else {
      // Groq Logic (Default)
      // 3. Build messages for Groq
      const messages = [
        {
          role: 'system',
          content: `You are a Second Brain assistant. Answer questions based ONLY on the context provided below. 
If the context doesn't contain relevant information, say so clearly.
When referencing information, mention the source numbers [1], [2], etc.

Context:
${context}`,
        },
        {
          role: 'user',
          content: query,
        },
      ];

      // 4. Call Groq API
      console.log(`[RAG] Generating answer with Groq for: "${query}"`);
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.3,
        max_tokens: 1024,
      });

      answer = completion.choices[0]?.message?.content || 'No response generated.';
    }

    // 5. Return answer with citations
    const citations = searchResults.map(result => ({
      text: result.text.substring(0, 200) + (result.text.length > 200 ? '...' : ''),
      source: result.source,
      score: result.score,
    }));

    console.log(`[RAG] Answer generated successfully`);
    return {
      answer,
      citations,
    };

  } catch (error) {
    console.error('[RAG] Answer generation failed:', error.message);
    throw error;
  }
}
