import { Github, Linkedin, Twitter } from 'lucide-react';
import { projects as generatedProjects } from './projects';

export const profile = {
  name: "Abishek",
  role: "Full-Stack Engineer",
  bio: "Full-Stack Engineer with a Low-Level Fetish. Bridging high-level UI with bare-metal logic through Breadth-First, Depth-Next exploration.",
  avatar: `${import.meta.env.BASE_URL}avatar.jpg`,
  socials: [
    { name: "GitHub", url: "https://github.com/TentacioPro", icon: Github },
    { name: "LinkedIn", url: "https://linkedin.com/in/", icon: Linkedin },
    { name: "Twitter", url: "https://twitter.com/", icon: Twitter },
  ],
};

export const projects = generatedProjects;

export const analyticsData = [
  { subject: 'Frontend', A: 140, fullMark: 150 },
  { subject: 'Backend', A: 110, fullMark: 150 },
  { subject: 'Design', A: 130, fullMark: 150 },
  { subject: 'DevOps', A: 90, fullMark: 150 },
  { subject: 'Strategy', A: 100, fullMark: 150 },
];

