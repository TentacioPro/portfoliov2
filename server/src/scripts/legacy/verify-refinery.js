/**
 * VERIFICATION SCRIPT: Refinery Pipeline Status
 * 
 * Cross-checks:
 * - MongoDB conversations (total vs analyzed)
 * - Vector embeddings in Qdrant
 * - Data integrity
 */

import mongoose from 'mongoose';
import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/secondbrain',
  QDRANT_URL: process.env.QDRANT_URL || 'http://localhost:6333',
  COLLECTION_NAME: 'code_embeddings'
};

// ============================================================================
// MONGOOSE SCHEMA
// ============================================================================

const ConversationSchema = new mongoose.Schema({}, { strict: false });
const Conversation = mongoose.model('Conversation', ConversationSchema);

// ============================================================================
// VERIFICATION LOGIC
// ============================================================================

async function verifyMongoDB() {
  console.log('\n📊 MONGODB VERIFICATION');
  console.log('─'.repeat(80));
  
  const totalDocs = await Conversation.countDocuments({});
  const analyzedDocs = await Conversation.countDocuments({ 
    'analysis.processed_at': { $exists: true } 
  });
  const unanalyzedDocs = totalDocs - analyzedDocs;
  
  console.log(`   Total Conversations:      ${totalDocs.toLocaleString()}`);
  console.log(`   ✅ Analyzed:               ${analyzedDocs.toLocaleString()} (${((analyzedDocs/totalDocs)*100).toFixed(1)}%)`);
  console.log(`   ⏳ Pending:                ${unanalyzedDocs.toLocaleString()} (${((unanalyzedDocs/totalDocs)*100).toFixed(1)}%)`);
  
  // Sample analysis data
  if (analyzedDocs > 0) {
    const sample = await Conversation.findOne({ 
      'analysis.processed_at': { $exists: true } 
    }).lean();
    
    console.log('\n   📝 Sample Analysis:');
    console.log(`      Project: ${sample.projectName}`);
    console.log(`      Intent: ${sample.analysis.intent}`);
    console.log(`      Tech Stack: ${sample.analysis.tech_stack.join(', ')}`);
    console.log(`      Difficulty: ${sample.analysis.difficulty_score}/10`);
    console.log(`      Struggle: ${sample.analysis.struggle_heuristic ? '⚠️  Yes' : '✅ No'}`);
  }
  
  return { totalDocs, analyzedDocs, unanalyzedDocs };
}

async function verifyQdrant() {
  console.log('\n\n🔍 QDRANT VERIFICATION');
  console.log('─'.repeat(80));
  
  try {
    const client = new QdrantClient({ url: CONFIG.QDRANT_URL });
    
    // Check if collection exists
    const collections = await client.getCollections();
    const ourCollection = collections.collections.find(
      c => c.name === CONFIG.COLLECTION_NAME
    );
    
    if (!ourCollection) {
      console.log(`   ⚠️  Collection "${CONFIG.COLLECTION_NAME}" not found`);
      return { vectorCount: 0 };
    }
    
    const collectionInfo = await client.getCollection(CONFIG.COLLECTION_NAME);
    const vectorCount = collectionInfo.points_count || 0;
    
    console.log(`   Collection: ${CONFIG.COLLECTION_NAME}`);
    console.log(`   Total Vectors: ${vectorCount.toLocaleString()}`);
    console.log(`   Vector Dimension: ${collectionInfo.config.params.vectors.size}`);
    console.log(`   Distance Metric: ${collectionInfo.config.params.vectors.distance}`);
    
    return { vectorCount };
    
  } catch (error) {
    console.log(`   ❌ Qdrant Error: ${error.message}`);
    return { vectorCount: 0 };
  }
}

async function verifyDataIntegrity() {
  console.log('\n\n🔬 DATA INTEGRITY CHECK');
  console.log('─'.repeat(80));
  
  // Check for conversations without exchanges
  const emptyConversations = await Conversation.countDocuments({
    $or: [
      { conversations: { $exists: false } },
      { conversations: { $size: 0 } }
    ]
  });
  
  // Check for analysis with invalid difficulty scores
  const invalidScores = await Conversation.countDocuments({
    'analysis.difficulty_score': { $exists: true, $not: { $gte: 1, $lte: 10 } }
  });
  
  // Check for analysis with empty tech stacks
  const emptyTechStacks = await Conversation.countDocuments({
    'analysis.tech_stack': { $exists: true, $size: 0 }
  });
  
  console.log(`   ⚠️  Empty Conversations:    ${emptyConversations}`);
  console.log(`   ⚠️  Invalid Difficulty:     ${invalidScores}`);
  console.log(`   ℹ️  Empty Tech Stacks:      ${emptyTechStacks}`);
  
  return { emptyConversations, invalidScores, emptyTechStacks };
}

async function generateSummary(mongoStats, qdrantStats, integrityStats) {
  console.log('\n\n' + '═'.repeat(80));
  console.log('📋 VERIFICATION SUMMARY');
  console.log('═'.repeat(80));
  
  const mongoProgress = (mongoStats.analyzedDocs / mongoStats.totalDocs * 100).toFixed(1);
  
  console.log(`\n🗄️  DATABASE STATUS:`);
  console.log(`   ${mongoProgress}% of conversations analyzed (${mongoStats.analyzedDocs.toLocaleString()}/${mongoStats.totalDocs.toLocaleString()})`);
  
  if (qdrantStats.vectorCount > 0) {
    console.log(`\n🔍 VECTOR STATUS:`);
    console.log(`   ${qdrantStats.vectorCount.toLocaleString()} vectors indexed`);
  }
  
  console.log(`\n✅ DATA QUALITY:`);
  if (integrityStats.emptyConversations === 0 && integrityStats.invalidScores === 0) {
    console.log(`   No integrity issues detected`);
  } else {
    console.log(`   ${integrityStats.emptyConversations + integrityStats.invalidScores} issues found`);
  }
  
  if (mongoStats.unanalyzedDocs > 0) {
    console.log(`\n⏭️  NEXT STEPS:`);
    console.log(`   Run: node src/scripts/refine-forensics.js`);
    console.log(`   Remaining: ${mongoStats.unanalyzedDocs.toLocaleString()} conversations`);
  } else {
    console.log(`\n🎉 ALL CONVERSATIONS ANALYZED!`);
  }
  
  console.log('═'.repeat(80));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('═'.repeat(80));
  console.log('🔬 REFINERY VERIFICATION SYSTEM');
  console.log('═'.repeat(80));
  
  try {
    await mongoose.connect(CONFIG.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    const mongoStats = await verifyMongoDB();
    const qdrantStats = await verifyQdrant();
    const integrityStats = await verifyDataIntegrity();
    
    await generateSummary(mongoStats, qdrantStats, integrityStats);
    
  } catch (error) {
    console.error('\n💥 Verification Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();
