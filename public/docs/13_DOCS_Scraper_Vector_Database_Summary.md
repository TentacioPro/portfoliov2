# RAG Pipeline

**Stack:** ChromaDB, Qdrant, Ollama

## Overview

This project implements a Retrieval-Augmented Generation pipeline, integrating ChromaDB and Qdrant for vector similarity and Ollama for local LLM inference, to bridge the gap between raw text extraction and AI-powered retrieval. The modular design allows for swapping between vector stores and LLM providers without rewriting business logic.

## Engineering notes

This archive entry documents the reasoning behind rag pipeline as a practical engineering exercise. The work emphasizes clear boundaries, useful feedback loops, and an implementation that can be inspected rather than treated as a black box. The selected technologies support the project's central constraint while keeping the system understandable for future iteration.

The project is also a record of trade-offs. It favors small, composable pieces, explicit interfaces, and a workflow that makes failures visible early. That approach makes it easier to test assumptions, compare alternatives, and improve the result without discarding the original learning. Where the work is exploratory, the archive preserves those limitations honestly so the next version can start from evidence instead of guesswork.

## Outcome

The result is a focused reference for rag pipeline, including the problem, the technical direction, and the lessons that carry forward to future builds.
