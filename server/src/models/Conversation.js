import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    projectName: String,
    projectPath: String,
    workspaceId: String,
    techStack: [String],
    conversations: [{
        sessionId: String,
        timestamp: Date,
        exchanges: [{
            prompt: String,
            response: String,
            timestamp: Date,
            toolsUsed: [String],
            filesEditedCount: Number,
            modelUsed: String
        }]
    }],
    totalExchanges: Number,
    firstChatDate: Date,
    lastChatDate: Date,
    extractedAt: Date
});

export default mongoose.model('Conversation', ConversationSchema);
