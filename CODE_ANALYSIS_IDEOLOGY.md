# Code Analysis Ideology: Senior Software Architect

## Overview
The Second Brain uses a sophisticated **"INTENT over Syntax"** analysis methodology powered by Groq's LLaMA 3.3 70B model. This approach focuses on understanding the **engineering logic** behind code rather than just documenting its structure.

## The Role
> **You are a Senior Software Architect analyzing a legacy codebase.**

The LLM is not a junior developer reading code — it's an experienced architect conducting a **forensic analysis** of engineering decisions, design patterns, and the original problem being solved.

## Analysis Framework

### 7 Core Outputs

#### 1. **One-Liner** 📝
A simple English sentence explaining what the project actually does.

**Example:**
```
"A real-time chat app using WebSockets and Redis pub/sub"
```

#### 2. **Tech Stack** 🛠️
Array of detected libraries/frameworks from code analysis.

**Example:**
```json
["React", "Node.js", "@clerk/clerk-react", "@edgestore/server", "Convex"]
```

#### 3. **Engineer's Logic** 🧠
2-3 sentences inferring the **problem** the developer was trying to solve.

**Example:**
```
The developer aimed to create a Notion-like collaborative workspace with real-time features. 
They prioritized authentication (Clerk), storage (Edge Store), and a modular UI architecture 
using Radix components. The use of Convex suggests a focus on real-time data synchronization 
without managing WebSocket infrastructure.
```

#### 4. **Prompt Reconstruction** 💡
Reverse-engineer the **likely AI prompt** that generated this code.

**Example:**
```
"Create a Notion clone using React with real-time collaboration. Use Clerk for authentication, 
Edge Store for file uploads, and Convex for the backend. Ensure the UI is built with accessible 
Radix components and supports dark mode."
```

#### 5. **Complexity Rating** 📊
Score from 1-10 based on system sophistication:
- **1-3:** Simple script/utility
- **4-6:** Standard application
- **7-9:** Complex system with multiple integrations
- **10:** Highly sophisticated distributed system

#### 6. **Patterns** 🏗️
Array of architectural patterns detected.

**Example:**
```json
["Modular Architecture", "Event-Driven Architecture", "Micro-Frontend"]
```

#### 7. **Key Components** 🔧
Main technical building blocks of the system.

**Example:**
```json
["Frontend (React)", "Authentication (Clerk)", "Storage (Edge Store)", "Real-time DB (Convex)"]
```

---

## Implementation

### LLM Configuration
```javascript
{
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  max_tokens: 1500,
  response_format: { type: 'json_object' }
}
```

### System Prompt
```
You are a Senior Software Architect analyzing legacy codebases. 
Focus on INTENT over syntax. Always respond with valid JSON.
```

### User Prompt Structure
```
FILE TREE:
[Truncated directory structure]

TECH STACK:
Language: JavaScript/Node.js
Framework: React
Dependencies: react, @clerk/clerk-react, convex, ...

README:
[Project documentation]

ENTRY POINT CODE:
[Main application file]

TASK:
Analyze the provided code files. You must ignore syntax errors and focus on INTENT.
[Detailed instructions for 7-field JSON output]
```

---

## Data Storage

### MongoDB Schema
```javascript
{
  name: String,
  type: { type: String, enum: ['project', 'presentation'] },
  summary: String,
  oneLiner: String,                  // NEW
  techStack: [String],               // NEW
  engineersLogic: String,            // NEW
  promptReconstruction: String,      // NEW
  stack: {
    language: String,
    framework: String,
    dependencies: [String]
  },
  complexity: Number,
  patterns: [String],
  keyComponents: [String],
  analyzedAt: Date
}
```

### Qdrant Payload
```javascript
{
  text: analysis.summary.substring(0, 5000),
  source: projectName,
  type: 'project-architecture',
  oneLiner: analysis.oneLiner,                             // NEW
  techStack: analysis.techStack.join(', '),                // NEW
  engineersLogic: analysis.engineersLogic.substring(0, 1000), // NEW
  promptReconstruction: analysis.promptReconstruction.substring(0, 1000), // NEW
  stack: JSON.stringify(analysis.stack),
  complexity: analysis.complexity,
  patterns: analysis.patterns.join(', '),
  keyComponents: analysis.keyComponents.join(', ')
}
```

---

## API Endpoints

### Get All Projects
```http
GET /api/projects
```

**Response:**
```json
{
  "success": true,
  "count": 33,
  "projects": [
    {
      "id": "693d7c58...",
      "name": "NotionClone",
      "oneLiner": "A collaborative workspace application inspired by Notion",
      "techStack": ["React", "Clerk", "Convex"],
      "engineersLogic": "Developer aimed to replicate Notion's UX...",
      "promptReconstruction": "Create a Notion clone with authentication...",
      "complexity": 8,
      "patterns": ["Modular Architecture", "Event-Driven"],
      "keyComponents": ["Frontend", "Auth", "Real-time DB"],
      "analyzedAt": "2024-12-17T17:30:00.000Z"
    }
  ]
}
```

### Get Specific Project
```http
GET /api/projects/:name
```

**Example:**
```bash
GET /api/projects/NotionClone
```

---

## Why This Ideology?

### Traditional Code Analysis:
- "This is a React app with 15 components"
- "Uses Express server with 8 routes"
- "Has MongoDB database connection"

### **Intent-Focused Analysis:**
- **"What problem was being solved?"** → *Enabling real-time collaboration without WebSocket complexity*
- **"What decisions were made?"** → *Chose Convex over Firebase for real-time sync*
- **"What prompt created this?"** → *"Build a Notion clone with X, Y, Z features"*

This approach enables the Second Brain to:
1. **Understand engineering context** (not just code structure)
2. **Reverse-engineer prompts** (learning from past AI-generated code)
3. **Identify complexity** (prioritizing maintenance efforts)
4. **Map tech stacks** (dependency tracking across 40+ projects)

---

## Example Output

### Qubic Hackathon Analysis
```json
{
  "oneLiner": "A decentralized, zero-gas subscription protocol built on Qubic for the feeless economy.",
  
  "techStack": ["Qubic", "C++", "MongoDB", "Docker"],
  
  "engineersLogic": "The developer was solving the problem of high gas fees in blockchain subscription systems. They aimed to create a decentralized, trustless, and automated solution for recurring payments using Qubic's infrastructure. The design involves a custom smart contract, an off-chain keeper network, and a time-locked vault.",
  
  "promptReconstruction": "Design a decentralized subscription protocol that eliminates gas fees and enables trustless automation of recurring payments on Qubic blockchain.",
  
  "complexity": 8,
  
  "patterns": [
    "Event-Driven Architecture",
    "Decentralized Architecture",
    "Smart Contract Pattern"
  ],
  
  "keyComponents": [
    "Qubic Core Lite",
    "Custom Smart Contract (C++)",
    "Keeper Network",
    "Time-Locked Vault",
    "MongoDB Database"
  ]
}
```

---

## Verification

### Test Analysis
```bash
docker exec experimentalportfolio-brain-1 node -e "
import('./src/services/codeAnalysis.js').then(async m => {
  const { analyzeProject } = m;
  const analysis = await analyzeProject('/projects/YourProject');
  console.log(JSON.stringify(analysis, null, 2));
});
"
```

### Query Projects
```bash
curl http://localhost:3001/api/projects | jq '.projects[] | {name, oneLiner, complexity}'
```

---

## Future Enhancements

1. **Diff Analysis:** Compare v1 vs v2 of same project and explain architectural evolution
2. **Dependency Graph:** Visualize relationships between detected tech stacks
3. **Prompt Library:** Build a corpus of reverse-engineered prompts for AI training
4. **Complexity Trends:** Track how project complexity changes over time
5. **Pattern Recognition:** Identify common architectural decisions across teams

---

**Status:** ✅ Production Ready  
**Version:** 2.0  
**Last Updated:** December 17, 2024  
**Commit:** e884659
