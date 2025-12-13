import mongoose from 'mongoose';
import { mongoUri } from '../config/env.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB: Connected');
        return true;
    } catch (err) {
        console.error('❌ MongoDB: Connection Failed', err.message);
        return false;
    }
};