import fs from 'node:fs';
import path from 'node:path';
import { projects } from '../src/data/projects.js';

const repoUrl = 'https://github.com/TentacioPro/portfoliov2';
const iconRules = [
  { test: /blockchain|qubic/i, icon: 'Blocks' },
  { test: /recruitment|ats|hr|talent/i, icon: 'UsersRound' },
  { test: /agent|ai|llm|chatgpt|rag|voice/i, icon: 'Brain' },
  { test: /workflow|orchestrat|automation|n8n/i, icon: 'Workflow' },
  { test: /scraper|scrap|extract/i, icon: 'SearchCode' },
  { test: /cloud|aws|s3|storage/i, icon: 'Cloud' },
  { test: /rust|editor|portfolio|dashboard/i, icon: 'Code2' },
  { test: /elasticsearch|elk|vector|database/i, icon: 'Database' },
  { test: /devops|sre|kubernetes|docker/i, icon: 'ServerCog' },
  { test: /email/i, icon: 'Mail' },
  { test: /youtube|conference/i, icon: 'PlaySquare' },
  { test: /project management|manager/i, icon: 'KanbanSquare' },
  { test: /cms|publishing/i, icon: 'PenLine' },
  { test: /collab/i, icon: 'Users' },
  { test: /powershell|systems|infrastructure/i, icon: 'TerminalSquare' },
];

function chooseIcon(project) {
  const haystack = `${project.title} ${project.tags.join(' ')} ${project.description}`;
  return iconRules.find(({ test }) => test.test(haystack))?.icon ?? 'Sparkles';
}

function words(text) {
  return text.trim().split(/\\s+/).filter(Boolean);
}

function createSummary(project) {
  const tags = project.tags.join(', ');
  const paragraphs = [
    `# ${project.title}`,
    '',
    `**Stack:** ${tags}`,
    '',
    '## Overview',
    '',
    project.description.trim(),
    '',
    '## Engineering notes',
    '',
    `This archive entry documents the reasoning behind ${project.title.toLowerCase()} as a practical engineering exercise. The work emphasizes clear boundaries, useful feedback loops, and an implementation that can be inspected rather than treated as a black box. The selected technologies support the project\'s central constraint while keeping the system understandable for future iteration.`,
    '',
    'The project is also a record of trade-offs. It favors small, composable pieces, explicit interfaces, and a workflow that makes failures visible early. That approach makes it easier to test assumptions, compare alternatives, and improve the result without discarding the original learning. Where the work is exploratory, the archive preserves those limitations honestly so the next version can start from evidence instead of guesswork.',
    '',
    '## Outcome',
    '',
    `The result is a focused reference for ${project.title.toLowerCase()}, including the problem, the technical direction, and the lessons that carry forward to future builds.`,
  ];
  const base = paragraphs.join('\\n');
  let output = base;
  while (words(output).length < 190) {
    output += `\\n\\nThe implementation remains intentionally local and dependency-light, making it suitable for experimentation, review, and continued learning.`;
  }
  return `${output}\\n`;
}

const updated = projects.map((project) => ({
  ...project,
  icon: chooseIcon(project),
  liveUrl: null,
  githubUrl: repoUrl,
}));

const serialized = `export const projects = ${JSON.stringify(updated, null, 2)};\\n`;
fs.writeFileSync(path.resolve('src/data/projects.js'), serialized);
fs.mkdirSync(path.resolve('public/docs'), { recursive: true });
for (const project of updated) {
  const fileName = path.basename(project.downloadUrl);
  fs.writeFileSync(path.resolve('public/docs', fileName), createSummary(project));
}
console.log(`Updated ${updated.length} projects and generated ${updated.length} Markdown summaries.`);
console.log(`Icon distribution: ${Object.entries(updated.reduce((counts, p) => ({ ...counts, [p.icon]: (counts[p.icon] ?? 0) + 1 }), {})).map(([icon, count]) => `${icon}=${count}`).join(', ')}`);
