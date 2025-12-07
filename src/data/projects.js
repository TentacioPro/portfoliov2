export const projects = [
  {
    id: '01-agents-from-scratch',
    title: 'Agents From Scratch',
    category: 'AI',
    tags: ['Python', 'LangGraph', 'LangSmith', 'Gmail API'],
    status: 'MVP',
    thumbnail: 'bot',
    abstract: 'Autonomous email triage agent with human-in-the-loop approval gates.',
    description: `
## Concept
Moving beyond simple chatbots to "ambient agents" that can autonomously manage complex workflows. This project implements an email assistant that triages, drafts, and sends emails, but only after human approval.

## The Architecture
We implemented a 4-layer maturity model:
1.  **Basic Agent**: Tool calling capabilities.
2.  **Evaluation**: LLM-as-judge framework.
3.  **HITL**: Human-in-the-loop approval gates.
4.  **Memory**: Long-term state persistence using LangGraph Store.

## The Solution
Using **LangGraph**, we modeled the agent's decision process as a state machine. This allows for cyclic workflows (e.g., "draft -> critique -> revise -> draft") which are impossible in linear chains.
    `,
    links: {
      source: 'https://github.com/example/agents-from-scratch'
    }
  },
  {
    id: '02-agentic-os',
    title: 'Agentic OS v0',
    category: 'AI',
    tags: ['llama.cpp', 'Python', 'C++', 'TinyLlama'],
    status: 'Experimental',
    thumbnail: 'terminal',
    abstract: 'Local AI operating system experiment using Llama.cpp for offline inference.',
    description: `
## Concept
"Inference at the edge." Running AI agents locally without cloud dependencies to address privacy and latency concerns.

## The Tech
Uses **llama.cpp** to run quantized models (like TinyLlama) on consumer hardware. The "Agentic" layer translates natural language commands into system-level operations.

## The Vision
An operating system where the command line is replaced by a conversation, executed entirely on your own hardware.
    `,
    links: {
      source: 'https://github.com/example/agentic-os'
    }
  },
  {
    id: '03-voice-agents',
    title: 'Voice Agents Workshop',
    category: 'AI',
    tags: ['OpenAI Realtime API', 'WebRTC', 'Next.js', 'TypeScript'],
    status: 'Workshop',
    thumbnail: 'mic',
    abstract: 'Real-time voice-enabled AI agents using OpenAI\'s Agents SDK.',
    description: `
## Concept
Exploring the frontier of voice-to-voice AI. This project experiments with OpenAI's Realtime API to create fluid, low-latency conversations.

## The Focus
Minimizing latency to create a natural conversational flow, handling interruptions, and managing audio streams via WebRTC.
    `,
    links: {
      source: 'https://github.com/example/voice-agents'
    }
  },
  {
    id: '04-youtube-summarizer',
    title: 'YouTube Summarizer',
    category: 'AI',
    tags: ['Python', 'NLP', 'YouTube API', 'Scikit-learn'],
    status: 'Prototype',
    thumbnail: 'file-text',
    abstract: 'Intelligent video content processing with dynamic topic extraction.',
    description: `
## Concept
An intelligent video content processing system that extracts, analyzes, and summarizes YouTube videos.

## The Tech
Uses **YouTube Transcript API** for data retrieval and **NLTK/Spacy** for NLP processing. It features dynamic topic modeling to segment videos into semantic chunks.
    `,
    links: {
      source: 'https://github.com/example/youtube-summarizer'
    }
  },
  {
    id: '05-project-management',
    title: 'MERN Project Manager',
    category: 'Full Stack',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    status: 'MVP',
    thumbnail: 'layout-list',
    abstract: 'Full-stack task orchestration platform with real-time status tracking.',
    description: `
## Concept
A classic CRUD application for coordinating tasks across teams. It addresses the "task orchestration" problem with a clean, RESTful architecture.

## The Tech
Built on the MERN stack. It features a distinct separation of concerns with a shared data model and comprehensive task tracking.
    `,
    links: {
      source: 'https://github.com/example/project-management-system'
    }
  },
  {
    id: '06-nextjs-portfolio',
    title: 'Next.js Portfolio',
    category: 'Full Stack',
    tags: ['Next.js 14', 'Tailwind CSS', 'Shadcn/ui', 'TypeScript'],
    status: 'Live',
    thumbnail: 'globe',
    abstract: 'Modern, performant portfolio website with optimal SEO.',
    description: `
## Concept
A showcase of projects built with the latest web technologies.

## The Tech
Leverages **Next.js 14 App Router** for server components and static generation. Styled with **Tailwind CSS** and **Shadcn/ui** for a polished look.
    `,
    links: {
      source: 'https://github.com/example/portfolio-v1'
    }
  },
  {
    id: '07-notion-clone',
    title: 'NotionClone',
    category: 'Full Stack',
    tags: ['Next.js 14', 'Convex', 'Clerk', 'BlockNote'],
    status: 'Production-Ready',
    thumbnail: 'file-text',
    abstract: 'Real-time collaborative document editor with block-based rich text.',
    description: `
## Concept
Building a Notion-like collaborative editor requires solving multiple hard problems: real-time synchronization, rich text editing, and multi-user permissions.

## The Tech Stack
- **Frontend**: Next.js 14 (App Router).
- **Backend**: Convex for real-time sync.
- **Auth**: Clerk for user management.
- **Editor**: BlockNote for block-based editing.

## Outcome
A fully functional collaborative workspace deployed to Vercel.
    `,
    links: {
      source: 'https://github.com/TentacioPro/notionClone',
      demo: 'https://28-jotion-clone.vercel.app/'
    }
  },
  {
    id: '08-react-dashboard',
    title: 'React Dashboards',
    category: 'Full Stack',
    tags: ['React', 'Tailwind CSS', 'Data Visualization'],
    status: 'Prototype',
    thumbnail: 'activity',
    abstract: 'Exploration of admin interface patterns and component architectures.',
    description: `
## Concept
Multiple dashboard implementations exploring different design patterns for admin interfaces.

## The Tech
Features both a traditional admin panel and a modern Tailwind-based design, focusing on data visualization and responsive layouts.
    `,
    links: {
      source: 'https://github.com/example/react-dashboard'
    }
  },
  {
    id: '09-elk-stack',
    title: 'ELK Stack Analytics',
    category: 'Infrastructure',
    tags: ['Elasticsearch', 'Logstash', 'Kibana', 'Windows'],
    status: 'Infrastructure',
    thumbnail: 'database',
    abstract: 'Complete ELK stack deployment for log aggregation and analysis.',
    description: `
## Concept
A centralized logging solution using the ELK stack (Elasticsearch, Logstash, Kibana) deployed on Windows.

## The Goal
To provide a unified view of system logs and metrics, enabling better observability and faster debugging.
    `,
    links: {
      source: 'https://github.com/example/elk-stack'
    }
  },
  {
    id: '10-minio-storage',
    title: 'Minio Object Storage',
    category: 'Infrastructure',
    tags: ['Minio', 'S3 API', 'Object Storage'],
    status: 'Infrastructure',
    thumbnail: 'database',
    abstract: 'Local S3-compatible object storage implementation.',
    description: `
## Concept
Self-hosted object storage using Minio, providing an S3-compatible API for file management and backups.

## Key Features
- **S3 Compatibility**: Full Amazon S3 API support.
- **Web Console**: User-friendly browser interface.
- **IAM Policies**: Fine-grained access control.
    `,
    links: {
      source: 'https://github.com/example/minio'
    }
  },
  {
    id: '11-ai-webscraper',
    title: 'AI WebScraper',
    category: 'Data Engineering',
    tags: ['Selenium', 'Crawl4ai', 'LLM Cleaning', 'Python'],
    status: 'MVP',
    thumbnail: 'globe',
    abstract: 'Intelligent scraping with AI-powered content extraction.',
    description: `
## Concept
Addressing the "last mile" problem of web scraping: transforming messy HTML into structured, AI-ready markdown.

## The Innovation
Combines **Crawl4ai** for async crawling and **Selenium** for dynamic content, using an LLM to "clean" the output into semantic markdown.
    `,
    links: {
      source: 'https://github.com/example/ai-webscraper'
    }
  },
  {
    id: '12-aws-scraper',
    title: 'AWS Doc Scraper',
    category: 'Data Engineering',
    tags: ['Puppeteer', 'Node.js', 'AWS', 'Automation'],
    status: 'Tool',
    thumbnail: 'network',
    abstract: 'Specialized scraper for AWS documentation with auth handling.',
    description: `
## Concept
Automated extraction of AWS documentation and resources.

## The Tech
Uses **Puppeteer** for headless browser automation, handling complex authentication flows and dynamic content loading on the AWS console.
    `,
    links: {
      source: 'https://github.com/example/aws-scraper'
    }
  },
  {
    id: '13-docs-scraper-rag',
    title: 'DOCS Scraper RAG',
    category: 'Data Engineering',
    tags: ['ChromaDB', 'Ollama', 'Python', 'RAG'],
    status: 'MVP',
    thumbnail: 'database',
    abstract: 'Scraping pipeline feeding a local vector database for semantic search.',
    description: `
## Concept
Bridging the gap between raw text extraction and AI-powered retrieval.

## The Solution
A multi-stage pipeline:
1.  **Ingestion**: Scraping documentation.
2.  **Indexing**: Chunking and embedding into **ChromaDB** and **Qdrant**.
3.  **Retrieval**: Semantic search using local LLMs via **Ollama**.
    `,
    links: {
      source: 'https://github.com/example/docs-scraper'
    }
  },
  {
    id: '14-ai-powershell',
    title: 'AI PowerShell Integration',
    category: 'Infrastructure',
    tags: ['PowerShell', 'REST API', 'Automation', 'Windows'],
    status: 'Tool',
    thumbnail: 'terminal',
    abstract: 'System automation using intelligent API requests from PowerShell.',
    description: `
## Concept
Integrating AI capabilities directly into the Windows command line.

## The Tech
PowerShell scripts that interact with AI models via REST APIs to generate system commands, automate tasks, and diagnose issues.
    `,
    links: {
      source: 'https://github.com/example/ai-powershell'
    }
  },
  {
    id: '15-n8n-ai-starter',
    title: 'n8n AI Orchestration',
    category: 'AI',
    tags: ['Docker', 'n8n', 'Qdrant', 'PostgreSQL'],
    status: 'Production-Ready',
    thumbnail: 'network',
    abstract: 'Self-hosted AI workflow automation stack.',
    description: `
## Concept
A pre-configured, self-hosted stack for building AI agents without vendor lock-in.

## The Architecture
Combines **n8n** (workflow engine), **Qdrant** (vector store), and **PostgreSQL** in a single Docker Compose setup. Supports local inference via Ollama.
    `,
    links: {
      source: 'https://github.com/n8n-io/self-hosted-ai-starter-kit'
    }
  },
  {
    id: '16-accenture-hackathon',
    title: 'Accenture Enterprise AI',
    category: 'AI',
    tags: ['TensorFlow', 'Python', 'Enterprise', 'Hackathon'],
    status: 'Hackathon',
    thumbnail: 'activity',
    abstract: 'AI solutions for retail inventory and e-commerce recommendations.',
    description: `
## Concept
Solving real-world enterprise challenges using AI/ML.

## Use Cases
1.  **Inventory Optimization**: Demand forecasting with LSTM networks.
2.  **Personalized Recommendations**: Collaborative filtering for e-commerce.
    `,
    links: {
      source: 'https://github.com/example/accenture-hackathon'
    }
  },
  {
    id: '17-bet-archive',
    title: 'BET ARCHIVE Analytics',
    category: 'Data Engineering',
    tags: ['Elasticsearch', 'Node.js', 'Analytics', 'Big Data'],
    status: 'Live',
    thumbnail: 'database',
    abstract: 'Betting data analytics system using Elasticsearch.',
    description: `
## Concept
A comprehensive system for storing, processing, and analyzing betting wheel records.

## The Tech
Uses **Elasticsearch** for distributed analytics and **Node.js** for data transformation pipelines. Features time-series data management and real-time aggregation.
    `,
    links: {
      source: 'https://github.com/example/bet-archive'
    }
  },
  {
    id: '18-chatgpt-clone',
    title: 'ChatGPT Clone',
    category: 'Full Stack',
    tags: ['React', 'Node.js', 'OpenAI API', 'Express'],
    status: 'Proof-of-Concept',
    thumbnail: 'message-square',
    abstract: 'Full-stack clone with streaming response handling.',
    description: `
## Concept
A "conversational AI frontend" that proxies requests to OpenAI.

## The Tech
**React** frontend with **Node.js/Express** backend. Handles real-time streaming responses and manages conversation context.
    `,
    links: {
      source: 'https://github.com/example/chatgpt-clone'
    }
  },
  {
    id: '19-tmux-orchestrator',
    title: 'TMUX Orchestrator',
    category: 'AI',
    tags: ['Tmux', 'Bash', 'Claude API', 'Agents'],
    status: 'Experimental',
    thumbnail: 'terminal',
    abstract: '24/7 AI agent coordination system using tmux sessions.',
    description: `
## Concept
An innovative system for running AI agents continuously using terminal multiplexers.

## The Architecture
Uses **tmux** for persistent sessions and **Claude API** for intelligence. Agents can self-schedule, coordinate across projects, and maintain state.
    `,
    links: {
      source: 'https://github.com/example/tmux-orchestrator'
    }
  },
  {
    id: '20-sre-projects',
    title: 'SRE & DevOps',
    category: 'Infrastructure',
    tags: ['Docker', 'Flask', 'DevOps', 'Monitoring'],
    status: 'Infrastructure',
    thumbnail: 'cpu',
    abstract: 'Containerized applications and infrastructure automation.',
    description: `
## Concept
Demonstrating Site Reliability Engineering (SRE) principles.

## The Tech
Containerized **Python Flask** applications with **Docker**, focusing on observability, health checks, and automated deployment pipelines.
    `,
    links: {
      source: 'https://github.com/example/sre-projects'
    }
  },
  {
    id: '21-eom-maaxly',
    title: 'EOM Maaxly',
    category: 'Full Stack',
    tags: ['GCP', 'Supabase', 'PostgreSQL', 'Agile'],
    status: 'In Development',
    thumbnail: 'code',
    abstract: 'Progressive development of the Maaxly platform.',
    description: `
## Concept
A comprehensive development project featuring Google Cloud integration and Supabase backend.

## The Tech
**Google Cloud Platform** for infrastructure and **Supabase** for real-time database management. Tracks progressive development with detailed session logging.
    `,
    links: {
      source: 'https://github.com/example/eom-maaxly'
    }
  },
  {
    id: '22-mtw2025',
    title: 'MTW2025 Experience',
    category: 'Community',
    tags: ['Conference', 'Networking', 'AI Trends', 'Mumbai'],
    status: 'Event',
    thumbnail: 'globe',
    abstract: 'Insights from Mumbai Tech Week 2025.',
    description: `
## Concept
Documentation of the Mumbai Tech Week 2025 experience.

## Highlights
Covered sessions from **Google DeepMind**, **Meta India**, and startup founders. Focused on AI/ML trends and the Mumbai tech ecosystem.
    `,
    links: {
      source: 'https://github.com/example/mtw2025'
    }
  },
  {
    id: '23-z-community-ats',
    title: 'Z Community ATS',
    category: 'Full Stack',
    tags: ['Next.js', 'Supabase', 'Kiro AI', 'Tailwind'],
    status: 'In Development',
    thumbnail: 'layout-list',
    abstract: 'Comprehensive Applicant Tracking System platform.',
    description: `
## Concept
A modern ATS platform for community hiring.

## The Tech
Built with **Next.js 14+** and **Supabase**. Features AI-powered development using **Kiro AI** and includes candidate management, job posting, and analytics.
    `,
    links: {
      source: 'https://github.com/example/z-community-ats'
    }
  },
  {
    id: '24-zed-editor',
    title: 'ZED Editor Dev',
    category: 'Systems',
    tags: ['Rust', 'Performance', 'GPU', 'Editor'],
    status: 'Contribution',
    thumbnail: 'code',
    abstract: 'Exploration of the high-performance Rust-based code editor.',
    description: `
## Concept
Diving into **Zed**, a high-performance code editor built in **Rust**.

## The Tech
Focuses on system-level performance, GPU-accelerated rendering, and real-time collaboration features.
    `,
    links: {
      source: 'https://github.com/example/zed-editor'
    }
  },
  {
    id: '25-ghost-blog',
    title: 'Ghost CMS Platform',
    category: 'Full Stack',
    tags: ['Node.js', 'Ghost', 'Handlebars', 'CMS'],
    status: 'Live',
    thumbnail: 'file-text',
    abstract: 'Professional publishing platform using Ghost CMS.',
    description: `
## Concept
Exploration of headless CMS capabilities for professional publishing.

## The Tech
**Ghost CMS** on **Node.js**. Features custom theme development with **Handlebars** and API integration for headless deployments.
    `,
    links: {
      source: 'https://github.com/example/ghost-blog'
    }
  },
  {
    id: '26-ibm-watsonx',
    title: 'IBM WatsonX Hackathon',
    category: 'AI',
    tags: ['WatsonX', 'Python', 'React', 'Enterprise'],
    status: 'Hackathon',
    thumbnail: 'bot',
    abstract: 'AI-powered HR onboarding document assistant.',
    description: `
## Concept
Streamlining HR onboarding using enterprise AI orchestration.

## The Solution
Built with **IBM WatsonX Orchestrate**. An intelligent system that processes onboarding documents, manages workflows, and provides a conversational interface for HR.
    `,
    links: {
      source: 'https://github.com/example/ibm-watsonx'
    }
  },
  {
    id: '27-google-agentic-ai',
    title: 'Google Agentic AI Day',
    category: 'AI',
    tags: ['Google AI', 'Multi-Agent', 'Architecture', 'Workshop'],
    status: 'Event',
    thumbnail: 'bot',
    abstract: 'Building intelligent multi-agent systems on Google Cloud.',
    description: `
## Concept
Workshop on designing scalable agentic AI architectures.

## The Tech
Focuses on **Google AI Platform** and multi-agent systems. Explores autonomous decision-making and tool use in AI agents.
    `,
    links: {
      source: 'https://github.com/example/google-agentic-ai'
    }
  },
  {
    id: '28-qubic-hackathon',
    title: 'Qubic Blockchain',
    category: 'Blockchain',
    tags: ['Go', 'C++', 'Qubic', 'React'],
    status: 'Hackathon Winner',
    thumbnail: 'cpu',
    abstract: 'Infrastructure and dApps for the Qubic network.',
    description: `
## Concept
Building the **SubQ Protocol**, a subscription primitive on Qubic's bare-metal infrastructure.

## The Tech
**Go** and **C++** for node implementation, **React** for the dashboard. Won the hackathon by demonstrating a recurring payment flow on the testnet.
    `,
    links: {
      source: 'https://github.com/example/qubic-hackathon'
    }
  },
  {
    id: '29-underdogs-talent',
    title: 'Underdogs Talent Platform',
    category: 'Full Stack',
    tags: ['MERN', 'TypeScript', 'GCP', 'Kiro AI'],
    status: 'Production-Ready',
    thumbnail: 'layout-list',
    abstract: 'Recruitment platform for connecting underrepresented talent.',
    description: `
## Concept
A comprehensive ATS for the "Underdogs of Madras" initiative.

## The Tech
**MERN Stack** with **TypeScript** and **Google Cloud**. Features AI-powered candidate matching and a complete recruitment workflow.
    `,
    links: {
      source: 'https://github.com/example/underdogs-talent'
    }
  }
];

export const categories = ['All', 'AI', 'Full Stack', 'Data Engineering', 'Blockchain', 'Infrastructure', 'Systems', 'Community'];
