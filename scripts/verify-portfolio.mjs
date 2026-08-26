import fs from 'node:fs';
import { projects } from '../src/data/projects.js';

const failures = [];
if (projects.length < 1) failures.push('No projects found');
for (const project of projects) {
  if (!project.icon) failures.push(`${project.id}: missing icon`);
  if (Object.hasOwn(project, 'image')) failures.push(`${project.id}: legacy image field remains`);
  if (!Object.hasOwn(project, 'liveUrl')) failures.push(`${project.id}: missing liveUrl`);
  if (!Object.hasOwn(project, 'githubUrl')) failures.push(`${project.id}: missing githubUrl`);
  if (!fs.existsSync(`public${project.downloadUrl}`)) failures.push(`${project.id}: missing ${project.downloadUrl}`);
}
for (const artifact of ['specs/assets/lighthouse-report.json', 'specs/assets/responsive/mobile-375.png', 'specs/assets/responsive/tablet-768.png', 'specs/assets/responsive/desktop-1440.png']) {
  if (!fs.existsSync(artifact)) failures.push(`Missing artifact: ${artifact}`);
}
const sourceFiles = ['src/App.jsx', 'src/pages/Portfolio.jsx', 'src/pages/About.jsx', 'src/pages/Docs.jsx', 'src/components/BentoGrid.jsx', 'src/index.css', 'tailwind.config.js', 'index.html'];
for (const file of sourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('project-placeholder')) failures.push(`${file}: placeholder reference remains`);
  if (content.includes('ThemeToggle')) failures.push(`${file}: theme toggle reference remains`);
}
if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, projects: projects.length, docs: fs.readdirSync('public/docs').length, requiredArtifacts: 4 }, null, 2));
