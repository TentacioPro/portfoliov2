import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const required = ['MONGO_URI', 'REDIS_HOST', 'QDRANT_URL', 'GROQ_API_KEY'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

export const mongoUri = process.env.MONGO_URI;
export const redisHost = process.env.REDIS_HOST;
export const qdrantUrl = process.env.QDRANT_URL;
export const groqKey = process.env.GROQ_API_KEY;
export const googleKey = process.env.GOOGLE_API_KEY;
export const port = process.env.PORT || 3001;