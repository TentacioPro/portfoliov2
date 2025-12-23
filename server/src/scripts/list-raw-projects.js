import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/secondbrain';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log(`🔌 Connected to Raw Data Lake`);

  const RawConversation = mongoose.model('RawConversation', new mongoose.Schema({}, { strict: false }));

  // Aggregate to find unique projects and count files
  const stats = await RawConversation.aggregate([
    { $group: { _id: "$projectName", count: { $sum: 1 }, sources: { $addToSet: "$source" } } },
    { $sort: { count: 1 } } // Smallest first
  ]);

  console.log(`${"Project Name".padEnd(40)} | ${"Files".padEnd(8)} | ${"Type"}`);
  console.log("-".repeat(70));

  stats.forEach(s => {
    console.log(`${s._id.toString().padEnd(40)} | ${s.count.toString().padEnd(8)} | ${s.sources.join(', ')}`);
  });

  console.log("-".repeat(70));
  console.log(`✅ Total Projects: ${stats.length}`);
  
  await mongoose.disconnect();
}

main();