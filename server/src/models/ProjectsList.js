import mongoose from 'mongoose';

const ProjectsListSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  workspaceId: {
    type: String,
    required: true
  },
  projectPath: String,
  techStack: [String],
  totalExchanges: {
    type: Number,
    default: 0
  },
  firstChatDate: Date,
  lastChatDate: Date,
  status: {
    type: String,
    enum: ['active', 'archived', 'unknown'],
    default: 'active'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Composite unique index on projectName + workspaceId
ProjectsListSchema.index({ projectName: 1, workspaceId: 1 }, { unique: true });
ProjectsListSchema.index({ totalExchanges: -1 });
ProjectsListSchema.index({ lastChatDate: -1 });

export default mongoose.model('ProjectsList', ProjectsListSchema);
