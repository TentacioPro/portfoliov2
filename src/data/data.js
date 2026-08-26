import { Github, Linkedin, Twitter } from 'lucide-react';
import { projects as generatedProjects } from './projects';

export const profile = {
  name: 'Abishek',
  role: 'Full-Stack Engineer',
  bio: 'I build with AI agents, ship with rigor, and track everything.',
  detail: 'A builder focused on the seam between high-level product work and low-level systems. I use breadth-first exploration to find the right problem, then depth-next execution to make the result reliable.',
  avatar: `${import.meta.env.BASE_URL}avatar.jpg`,
  location: 'Chennai, India',
  email: 'hello@tentacio.pro',
  socials: [
    { name: 'GitHub', url: 'https://github.com/TentacioPro', icon: Github },
    { name: 'LinkedIn', url: 'https://linkedin.com/in/', icon: Linkedin },
    { name: 'Twitter', url: 'https://twitter.com/', icon: Twitter },
  ],
};

export const projects = generatedProjects;

export const proudProjects = [
  { label: 'P1', id: '27-google-agentic-ai-day-july-2025' },
  { label: 'P2', id: '19-tmux-orchestrator-ai-agents' },
  { label: 'P3', id: '02-agentic-os-local-llm' },
  { label: 'P4', id: '07-notionclone-collaborative-editor' },
  { label: 'P5', id: '00-master-portfolio-summary' },
].map(({ label, id }) => ({
  label,
  project: projects.find((project) => project.id === id) ?? projects[0],
}));

export const analyticsData = [
  { subject: 'Frontend', value: 92 },
  { subject: 'Backend', value: 86 },
  { subject: 'AI systems', value: 95 },
  { subject: 'DevOps', value: 79 },
  { subject: 'Product thinking', value: 88 },
];
