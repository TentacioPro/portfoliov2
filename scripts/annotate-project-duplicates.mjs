import fs from 'node:fs';
import { projects } from '../src/data/projects.js';

const duplicateIds = new Set([
  '18-chatgpt-clone-full-stack-summary',
  '15-n8n-self-hosted-ai-starter-summary',
  '12-aws-scraper-cloud-documentation-summary',
  '11-ai-webscraper-intelligent-extraction-summary',
  '07-notionclone-collaborative-editor-summary',
  '05-project-management-system-mern-summary',
  '03-voice-agents-openai-workshop-summary',
  '02-agentic-os-local-llm-summary',
  '01-agents-from-scratch-langgraph-summary',
]);

const standaloneIds = new Set([
  '13-docs-scraper-vector-database-summary',
  '00-master-portfolio-summary',
]);

const annotated = projects.map((project) => {
  if (duplicateIds.has(project.id)) {
    return {
      ...project,
      isDuplicate: true,
      duplicateOf: project.id.replace(/-summary$/, ''),
      duplicateNote: 'Summary record retained for provenance; overlaps the paired project record.',
    };
  }
  if (standaloneIds.has(project.id)) {
    return {
      ...project,
      isDuplicate: false,
      duplicateOf: null,
      duplicateNote: 'Standalone rollup retained; related to other work but not a duplicate record.',
    };
  }
  return project;
});

fs.writeFileSync('src/data/projects.js', `export const projects = ${JSON.stringify(annotated, null, 2)};\n`);
console.log(JSON.stringify({
  total: annotated.length,
  duplicateRecords: annotated.filter((project) => project.isDuplicate).length,
  standaloneAdditionalRecords: annotated.filter((project) => project.duplicateOf === null && Object.hasOwn(project, 'isDuplicate')).length,
}, null, 2));
