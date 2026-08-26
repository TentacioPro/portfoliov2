# Audit of the 11 additional records

The checked-out portfolio contains 40 records, including 11 IDs ending in `-summary`. The audit matched those records against their same-prefix counterparts and compared title, tags, and description vocabulary.

| Additional record | Counterpart | Finding |
|---|---|---|
| `18-chatgpt-clone-full-stack-summary` | `18-chatgpt-clone-full-stack` | Duplicate summary pair |
| `15-n8n-self-hosted-ai-starter-summary` | `15-n8n-self-hosted-ai-starter` | Duplicate summary pair |
| `13-docs-scraper-vector-database-summary` | `13-docs-scraper-vector-database` | Standalone RAG pipeline rollup; related topic, not a duplicate record |
| `12-aws-scraper-cloud-documentation-summary` | `12-aws-scraper-cloud-documentation` | Duplicate summary pair |
| `11-ai-webscraper-intelligent-extraction-summary` | `11-ai-webscraper-intelligent-extraction` | Duplicate summary pair |
| `07-notionclone-collaborative-editor-summary` | `07-notionclone-collaborative-editor` | Duplicate summary pair |
| `05-project-management-system-mern-summary` | `05-project-management-system-mern` | Duplicate summary pair |
| `03-voice-agents-openai-workshop-summary` | `03-voice-agents-openai-workshop` | Duplicate summary pair |
| `02-agentic-os-local-llm-summary` | `02-agentic-os-local-llm` | Duplicate summary pair |
| `01-agents-from-scratch-langgraph-summary` | `01-agents-from-scratch-langgraph` | Duplicate summary pair |
| `00-master-portfolio-summary` | None | Standalone portfolio rollup |

The `-summary` suffix is a strong source-level signal for nine duplicate summary records. The RAG Pipeline and Full Stack Portfolio entries are retained as real standalone rollups and will be marked explicitly as such in the data file.
