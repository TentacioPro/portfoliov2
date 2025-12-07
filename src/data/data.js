import { Github, Linkedin, Twitter } from 'lucide-react';

export const profile = {
  name: "Abishek",
  role: "Full-Stack Engineer",
  bio: "Full-Stack Engineer with a Low-Level Fetish. Bridging high-level UI with bare-metal logic through Breadth-First, Depth-Next exploration.",
  avatar: "/avatar.jpg",
  socials: [
    { name: "GitHub", url: "https://github.com/TentacioPro", icon: Github },
    { name: "LinkedIn", url: "https://linkedin.com/in/", icon: Linkedin },
    { name: "Twitter", url: "https://twitter.com/", icon: Twitter },
  ],
};

export const projects = [
  {
    id: "subq-protocol",
    title: "SubQ Protocol",
    tags: ["C++", "Bare Metal"],
    image: "/images/project-subq.png",
    description: "Hit the Windows Memory Wall hard orchestrating local LLMs. Pivoted to WSL to unlock raw performance and build a bare-metal agentic OS layer.",
    downloadUrl: "/docs/02_Agentic_OS_Local_LLM.md",
    colSpan: 2
  },
  {
    id: "agents-scratch",
    title: "Agents From Scratch",
    tags: ["Python", "LangGraph"],
    image: "/images/project-agents.png",
    description: "Deconstructed agentic workflows to understand the primitives. Moved from simple chains to stateful, multi-step reasoning graphs.",
    downloadUrl: "/docs/01_Agents_From_Scratch_LangGraph.md",
    colSpan: 1
  },
  {
    id: "voice-agents",
    title: "Voice Agents Workshop",
    tags: ["OpenAI", "Realtime API"],
    image: "/images/project-voice.png",
    description: "Engineered low-latency voice pipeline using OpenAI's Realtime API. Focused on natural interruption and turn-taking in conversation.",
    downloadUrl: "/docs/03_Voice_Agents_OpenAI_Workshop.md",
    colSpan: 1
  },
  {
    id: "yt-summarizer",
    title: "YouTube Summarizer",
    tags: ["Python", "NLP"],
    image: "/images/project-yt.png",
    description: "Built dynamic content processor to extract and summarize video transcripts. Solved token context window challenge for long-form content.",
    downloadUrl: "/docs/04_YouTube_Video_Summarizer.md",
    colSpan: 2
  },
  {
    id: "ai-webscraper",
    title: "AI WebScraper",
    tags: ["Puppeteer", "AI"],
    image: "/images/project-scraper.png",
    description: "Intelligent extraction tool navigating complex DOMs. Uses computer vision and DOM analysis to identify and retrieve relevant data points automatically.",
    downloadUrl: "/docs/11_AI_WebScraper_Intelligent_Extraction.md",
    colSpan: 1
  },
  {
    id: "notion-clone",
    title: "Notion Clone",
    tags: ["Next.js", "WebSockets"],
    image: "/images/project-notion.png",
    description: "Real-time collaborative editor handling concurrent user updates. Implemented CRDT-like conflict resolution for seamless editing experience.",
    downloadUrl: "/docs/07_NotionClone_Collaborative_Editor.md",
    colSpan: 1
  }
];

export const analyticsData = [
  { subject: 'Frontend', A: 140, fullMark: 150 },
  { subject: 'Backend', A: 110, fullMark: 150 },
  { subject: 'Design', A: 130, fullMark: 150 },
  { subject: 'DevOps', A: 90, fullMark: 150 },
  { subject: 'Strategy', A: 100, fullMark: 150 },
];

