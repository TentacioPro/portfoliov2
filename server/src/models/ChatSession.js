import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: {
    type: String,
    required: true
  },
  citations: [{
    text: String,
    source: String,
    score: Number
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
ChatSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('ChatSession', ChatSessionSchema);
