import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import ProjectsList from '../models/ProjectsList.js';

console.log('🔄 Syncing projects list from conversations...\n');

await mongoose.connect('mongodb://localhost:27017/secondbrain');

// Get all conversations
const conversations = await Conversation.find({});

console.log(`📊 Found ${conversations.length} projects in conversations collection\n`);

// Clear existing projects list
await ProjectsList.deleteMany({});
console.log('🗑️  Cleared existing projects list\n');

// Create projects list entries
const projectsData = conversations.map(conv => ({
  projectName: conv.projectName,
  workspaceId: conv.workspaceId,
  projectPath: conv.projectPath,
  techStack: conv.techStack || [],
  totalExchanges: conv.totalExchanges || 0,
  firstChatDate: conv.firstChatDate,
  lastChatDate: conv.lastChatDate,
  status: 'active'
}));

await ProjectsList.insertMany(projectsData);

console.log('✅ Projects list synced successfully!\n');

// Display summary
const topProjects = await ProjectsList.find({})
  .sort({ totalExchanges: -1 })
  .limit(10);

console.log('🏆 TOP 10 PROJECTS BY ACTIVITY:\n');
topProjects.forEach((proj, idx) => {
  console.log(`${idx + 1}. ${proj.projectName}`);
  console.log(`   Exchanges: ${proj.totalExchanges}`);
  console.log(`   Tech: [${proj.techStack.join(', ')}]`);
  console.log('');
});

console.log(`📝 Total projects in list: ${projectsData.length}`);

await mongoose.disconnect();
