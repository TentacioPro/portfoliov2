
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain';

const RawConversation = mongoose.model(
  'RawConversation',
  new mongoose.Schema({}, { strict: false })
);

async function getStats() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Mongo.");

    const totalDocs = await RawConversation.countDocuments();
    console.log(`Total RawConversation Documents: ${totalDocs}`);

    // Sample a few docs to estimate exchanges per doc
    const sampleDocs = await RawConversation.find().limit(10);
    let totalExchanges = 0;
    let sampleCount = 0;

    for (const doc of sampleDocs) {
        let exchanges = 0;
        if (doc.source === 'vscode' && doc.content && doc.content.requests) {
            exchanges = doc.content.requests.length;
        } else if (doc.source === 'kiro' && doc.content && doc.content.chat) {
            exchanges = doc.content.chat.filter(m => m.role === 'user').length;
        }
        if (exchanges > 0) {
            totalExchanges += exchanges;
            sampleCount++;
        }
    }

    const avgExchanges = sampleCount > 0 ? totalExchanges / sampleCount : 0;
    console.log(`Average exchanges per valid doc (based on sample): ~${avgExchanges.toFixed(1)}`);
    
    const estimatedTotalExchanges = totalDocs * (avgExchanges || 1); // Fallback to 1
    console.log(`Estimated Total Exchanges to Analyze: ~${estimatedTotalExchanges.toFixed(0)}`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

getStats();
