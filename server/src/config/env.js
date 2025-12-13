import dotenv from 'dotenv';
dotenv.config();

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
export const port = process.env.PORT || 3001;