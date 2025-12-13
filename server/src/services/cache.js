import IORedis from 'ioredis';
import { redisHost } from '../config/env.js';

// We need two connections: one for general cache, one for BullMQ (blocking)
const connection = new IORedis({
    host: redisHost, 
    port: 6379, 
    maxRetriesPerRequest: null 
});

connection.on('connect', () => console.log('✅ Redis: Connected'));
connection.on('error', (err) => console.error('❌ Redis: Error', err.message));

export default connection;