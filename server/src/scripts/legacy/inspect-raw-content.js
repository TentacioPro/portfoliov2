import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const RawConversation = mongoose.model(
    "RawConversation",
    new mongoose.Schema({}, { strict: false })
  );

  const docs = await RawConversation.find({ projectName: "globalStorage" }).limit(5);

  console.log(`Found ${docs.length} docs for globalStorage`);

  for (const doc of docs) {
    console.log("---------------------------------------------------");
    console.log(`File: ${doc.filePath}`);
    console.log(`Source: ${doc.source}`);
    console.log(`Content Type: ${typeof doc.content}`);
    console.log(`Is Array: ${Array.isArray(doc.content)}`);
    
    if (doc.content) {
        if (Array.isArray(doc.content)) {
            console.log(`Array Length: ${doc.content.length}`);
            if (doc.content.length > 0) {
                console.log("First Item Keys:", Object.keys(doc.content[0]));
                console.log("First Item Sample:", JSON.stringify(doc.content[0]).substring(0, 200));
            }
        } else {
            console.log("Content Keys:", Object.keys(doc.content));
            console.log("Content Sample:", JSON.stringify(doc.content).substring(0, 200));
        }
    }
  }

  await mongoose.disconnect();
}

main();
