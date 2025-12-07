import { Github, Linkedin, Twitter, Disc } from 'lucide-react';

export const profile = {
  name: "Creative Technologist",
  bio: "Exploring the intersection of design, code, and artificial intelligence.",
  avatar: "/avatar.jpg",
};

export const socials = [
  { name: "GitHub", url: "https://github.com", icon: Github },
  { name: "LinkedIn", url: "https://linkedin.com", icon: Linkedin },
  { name: "X", url: "https://x.com", icon: Twitter },
  { name: "Discord", url: "https://discord.com", icon: Disc },
];

export const projects = [
  {
    id: 1,
    title: "SubQ Protocol",
    description: "A decentralized messaging layer built on C++ and custom blockchain architecture. Features zero-knowledge proofs for metadata privacy and sub-second latency.",
    tags: ["C++", "Blockchain", "Cryptography"],
    status: "Beta",
    link: "#"
  },
  {
    id: 2,
    title: "Neon Agent",
    description: "Autonomous AI agent capable of recursive task decomposition. Built with Python and LangChain, featuring a custom memory vector store.",
    tags: ["Python", "AI", "LangChain"],
    status: "Live",
    link: "#"
  },
  {
    id: 3,
    title: "Void Dashboard",
    description: "High-performance React dashboard for visualizing real-time market data. Uses WebSockets and WebGL for rendering millions of data points.",
    tags: ["React", "WebGL", "D3.js"],
    status: "Prototype",
    link: "#"
  },
  {
    id: 4,
    title: "Neural Synth",
    description: "Browser-based synthesizer powered by TensorFlow.js. Generates audio samples using a GAN trained on vintage analog synths.",
    tags: ["TypeScript", "TensorFlow.js", "WebAudio"],
    status: "Concept",
    link: "#"
  }
];

export const analyticsData = [
  { subject: 'Backend', A: 120, fullMark: 150 },
  { subject: 'Frontend', A: 98, fullMark: 150 },
  { subject: 'DevOps', A: 86, fullMark: 150 },
  { subject: 'Low-Level', A: 99, fullMark: 150 },
  { subject: 'AI/ML', A: 85, fullMark: 150 },
  { subject: 'Design', A: 65, fullMark: 150 },
];

export const velocityData = [
  { name: 'Jan', commits: 40, experiments: 24 },
  { name: 'Feb', commits: 30, experiments: 13 },
  { name: 'Mar', commits: 20, experiments: 58 },
  { name: 'Apr', commits: 27, experiments: 39 },
  { name: 'May', commits: 18, experiments: 48 },
  { name: 'Jun', commits: 23, experiments: 38 },
  { name: 'Jul', commits: 34, experiments: 43 },
];
