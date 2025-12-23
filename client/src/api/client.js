/**
 * API Client for Second Brain Backend
 */

const API_BASE = '/api';

/**
 * Generate a resume PDF
 * @param {Object} data - Resume data
 * @param {string} data.name - Full name
 * @param {string} data.title - Professional title
 * @param {string} data.summary - Professional summary
 * @param {string[]} data.skills - Array of skills
 * @returns {Promise<Blob>} - PDF as a Blob
 */
export async function generateResume(data) {
  try {
    const response = await fetch(`${API_BASE}/resume/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate resume' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Return the PDF as a Blob
    return await response.blob();
  } catch (error) {
    console.error('[API] Resume generation failed:', error);
    throw error;
  }
}

/**
 * Ingest text into the knowledge base
 * @param {string} text - Text content to ingest
 * @param {string} source - Source identifier (URL or filename)
 * @param {Object} metadata - Optional metadata
 * @returns {Promise<Object>} - Response with job ID
 */
export async function ingestText(text, source, metadata = {}) {
  try {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to ingest text' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[API] Text ingestion failed:', error);
    throw error;
  }
}

/**
 * Send a chat message to the knowledge base
 * @param {string} message - User's question
 * @param {string} provider - LLM provider ('groq' or 'gemini')
 * @param {string} sessionId - Optional session ID to persist chat
 * @returns {Promise<{answer: string, citations: Array}>}
 */
export async function sendChatMessage(message, provider = 'groq', sessionId = null) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, provider, sessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get answer' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[API] Chat request failed:', error);
    throw error;
  }
}

// --- Session Management ---

export async function getSessions() {
  const res = await fetch(`${API_BASE}/chat/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return await res.json();
}

export async function createSession() {
  const res = await fetch(`${API_BASE}/chat/sessions`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return await res.json();
}

export async function getSession(id) {
  const res = await fetch(`${API_BASE}/chat/sessions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch session');
  return await res.json();
}

export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/chat/sessions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
  return await res.json();
}

/**
 * Helper: Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Suggested filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
