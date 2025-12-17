import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * GET / - Fetch all project metadata from MongoDB
 * Returns enriched project data with new analysis fields
 */
router.get('/', async (req, res) => {
  try {
    console.log('[Projects] Fetching all project metadata...');

    // Define schema inline if not already defined
    const ProjectSchema = new mongoose.Schema({
      name: String,
      type: String,
      summary: String,
      oneLiner: String,
      techStack: [String],
      engineersLogic: String,
      promptReconstruction: String,
      stack: {
        language: String,
        framework: String,
        dependencies: [String]
      },
      complexity: Number,
      patterns: [String],
      keyComponents: [String],
      analyzedAt: Date
    });

    const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

    const projects = await Project.find({}).sort({ analyzedAt: -1 }).limit(100);

    console.log(`[Projects] Found ${projects.length} projects`);

    res.json({
      success: true,
      count: projects.length,
      projects: projects.map(p => ({
        id: p._id,
        name: p.name,
        type: p.type,
        oneLiner: p.oneLiner,
        techStack: p.techStack,
        engineersLogic: p.engineersLogic,
        promptReconstruction: p.promptReconstruction,
        complexity: p.complexity,
        patterns: p.patterns,
        keyComponents: p.keyComponents,
        stack: p.stack,
        analyzedAt: p.analyzedAt
      }))
    });

  } catch (error) {
    console.error('[Projects] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /:name - Fetch specific project by name
 */
router.get('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`[Projects] Fetching project: ${name}`);

    const ProjectSchema = new mongoose.Schema({}, { strict: false });
    const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

    const project = await Project.findOne({ name });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        type: project.type,
        summary: project.summary,
        oneLiner: project.oneLiner,
        techStack: project.techStack,
        engineersLogic: project.engineersLogic,
        promptReconstruction: project.promptReconstruction,
        complexity: project.complexity,
        patterns: project.patterns,
        keyComponents: project.keyComponents,
        stack: project.stack,
        analyzedAt: project.analyzedAt
      }
    });

  } catch (error) {
    console.error('[Projects] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
