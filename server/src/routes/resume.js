import { Router } from 'express';
import { generateResumeTex } from '../templates/resume.js';
import { compileToPdf } from '../services/latex.js';

const router = Router();

/**
 * POST /generate
 * Generate a PDF resume from provided data
 */
router.post('/generate', async (req, res) => {
  try {
    const { name, title, summary, skills } = req.body;

    // Basic validation
    if (!name || !title || !summary) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, title, summary',
      });
    }

    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({
        status: 'error',
        message: 'Skills must be an array',
      });
    }

    console.log(`[Resume] Generating PDF for: ${name}`);

    // 1. Generate LaTeX from template
    const latexString = generateResumeTex({
      name,
      title,
      summary,
      skills: skills || [],
    });

    // 2. Compile to PDF
    const pdfBuffer = await compileToPdf(latexString);

    // 3. Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);

    console.log(`[Resume] PDF generated successfully for: ${name} (${pdfBuffer.length} bytes)`);

  } catch (error) {
    console.error('[Resume] Generation failed:', error.message);
    
    // Check if LaTeX compilation error
    if (error.message.includes('Tectonic')) {
      return res.status(500).json({
        status: 'error',
        message: 'LaTeX compilation failed',
        details: error.message,
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to generate resume PDF',
    });
  }
});

export default router;
