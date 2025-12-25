import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain';

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`🔌 Connected to DB: ${MONGO_URI}\n`);

    // KEY FIX: Map to 'conversations' collection, not 'projects'
    // We use 'Conversation' model which Mongoose maps to 'conversations' collection
    const Conversation = mongoose.model('Conversation', new mongoose.Schema({}, { strict: false }));
    
    const projects = await Conversation.find({}).sort({ projectName: 1 });

    if (projects.length === 0) {
        console.log("⚠️  'conversations' collection is empty.");
        process.exit(0);
    }

    console.log(`${"ID".padEnd(25)} | ${"EXACT NAME (Copy This)".padEnd(50)} | ${"Msgs".padEnd(6)}`);
    console.log("-".repeat(90));

    projects.forEach(p => {
      // Handle variable field names (projectName vs name)
      const name = p.projectName || p.name || "UNKNOWN";
      
      // Count messages (Copilot 'requests' vs Kiro 'exchanges')
      let msgCount = 0;
      
      // Check if it's the array of sessions format
      if (Array.isArray(p.conversations)) {
         msgCount = p.conversations.reduce((acc, session) => {
             return acc + (session.exchanges ? session.exchanges.length : 0);
         }, 0);
      } else if (Array.isArray(p.chatHistory)) {
         msgCount = p.chatHistory.reduce((acc, session) => {
             return acc + (session.requests ? session.requests.length : 0);
         }, 0);
      }

      // WRAP NAME IN QUOTES to reveal hidden spaces
      const safeName = `"${name}"`; 
      
      console.log(`${p._id.toString().padEnd(25)} | ${safeName.padEnd(50)} | ${msgCount.toString().padEnd(6)}`);
    });

    console.log("-".repeat(90));

  } catch (error) {
    console.error("❌ DB Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();