import { Github, Linkedin, Twitter } from 'lucide-react';

export const profile = {
  name: "Design Engineer",
  bio: "Crafting digital interfaces with Swiss precision and modern motion.",
  avatar: "/avatar.jpg",
};

export const socials = [
  { name: "GitHub", url: "https://github.com", icon: Github },
  { name: "LinkedIn", url: "https://linkedin.com", icon: Linkedin },
  { name: "X", url: "https://x.com", icon: Twitter },
];

export const projects = [
  {
    id: 1,
    title: "SubQ Protocol",
    description: "A bare-metal blockchain messaging layer optimized for sub-millisecond latency. Written in Rust and C++.",
    tags: ["Bare Metal", "Rust", "Cryptography"],
    status: "Production",
    link: "#",
    downloadUrl: "#",
    colSpan: 2
  },
  {
    id: 2,
    title: "Lumina UI",
    description: "A React component library focusing on compound components and accessible primitives.",
    tags: ["React", "A11y", "Design System"],
    status: "Beta",
    link: "#",
    downloadUrl: "#",
    colSpan: 1
  },
  {
    id: 3,
    title: "Vercel Clone",
    description: "Reverse engineering the Vercel dashboard deployment pipeline using AWS Lambda and SQS.",
    tags: ["AWS", "Node.js", "DevOps"],
    status: "Concept",
    link: "#",
    downloadUrl: "#",
    colSpan: 1
  },
  {
    id: 4,
    title: "Linear Sync",
    description: "Two-way sync engine between Linear issues and GitHub issues.",
    tags: ["TypeScript", "API", "Tooling"],
    status: "Live",
    link: "#",
    downloadUrl: "#",
    colSpan: 2
  }
];

export const analyticsData = [
  { subject: 'Frontend', A: 140, fullMark: 150 },
  { subject: 'Backend', A: 110, fullMark: 150 },
  { subject: 'Design', A: 130, fullMark: 150 },
  { subject: 'DevOps', A: 90, fullMark: 150 },
  { subject: 'Strategy', A: 100, fullMark: 150 },
];

