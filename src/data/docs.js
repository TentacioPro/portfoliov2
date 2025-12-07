export const docsData = {
  title: "The Blueprint",
  subtitle: "A 6-month exploration of Autonomous SDLC using AWS Kiro, GitHub Copilot, Zed, and Agentic Workflows.",
  philosophy: {
    title: "Spec Engineering",
    inspiration: "Inspired by Eno Reyes (CTO, Factory.AI)",
    tenets: [
      {
        title: "Verification First",
        description: "We don't write code until the spec is verified. We don't run code until the test is generated. We treat English as the highest-level programming language."
      },
      {
        title: "Autonomous SDLC",
        description: "The developer is no longer the bricklayer. The developer is the architect. AI Agents handle the implementation details, while humans handle the system design and constraints."
      },
      {
        title: "AI Agents as Workforce",
        description: "Treating LLMs not as chatbots, but as deterministic state machines that can be orchestrated to perform complex, multi-step engineering tasks."
      }
    ]
  },
  prompts: [
    {
      id: "neon-void",
      title: "The Neon Void One-Shot",
      description: "The initial prompt that established the V2 aesthetic and core layout structure.",
      code: `Act as a Senior UI Engineer.
Create a "Neon Void" aesthetic portfolio.
Background: #050505.
Accent: #00f0ff (Cyan).
Font: 'Space Grotesk'.
Layout:
1. Hero: Large "Glitch" text effect.
2. Grid: Bento-style layout for projects.
3. Dock: macOS style floating dock at bottom.
Use Framer Motion for all interactions.`
    },
    {
      id: "archivist",
      title: "The Archivist Script",
      description: "The prompt used to generate the AI Indexer that autonomously scanned the codebase.",
      code: `Act as a Technical Archivist.
Write a Node.js script 'ai-indexer.js'.
Goal: Scan all .md files in the root directory.
Process:
1. Use 'glob' to find files.
2. Read content.
3. Send to Groq API (Llama 3 70b).
4. Extract: Title, Tech Stack, Description, Complexity.
5. Output: A clean JSON file 'src/data/projects.json'.`
    },
    {
      id: "neo-swiss",
      title: "The Neo-Swiss Pivot",
      description: "The refactoring prompt that shifted the design system from Cyberpunk to Swiss International Style.",
      code: `Act as a Design Systems Lead.
Refactor the entire application to "Neo-Swiss" style.
Constraints:
1. Remove all neon/glow effects.
2. Background: Stone-50 (#fafaf9).
3. Text: Zinc-900 (#18181b).
4. Font: 'Instrument Sans' or 'Inter Tight'.
5. Borders: 1px solid Stone-200.
6. Shadows: Soft, diffused "glass" shadows.
Keep the layout, change the soul.`
    }
  ]
};
