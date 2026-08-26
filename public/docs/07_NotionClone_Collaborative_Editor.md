# Collaborative Editor

**Stack:** React, Convex, Next.js

## Overview

Built a sophisticated Notion-like document editor with real-time collaboration, rich text editing, and cloud storage integration using Next.js, Convex, and TypeScript. Implemented features like live synchronization, optimistic updates, and conflict resolution to ensure seamless collaboration.

## Engineering notes

This archive entry documents the reasoning behind collaborative editor as a practical engineering exercise. The work emphasizes clear boundaries, useful feedback loops, and an implementation that can be inspected rather than treated as a black box. The selected technologies support the project's central constraint while keeping the system understandable for future iteration.

The project is also a record of trade-offs. It favors small, composable pieces, explicit interfaces, and a workflow that makes failures visible early. That approach makes it easier to test assumptions, compare alternatives, and improve the result without discarding the original learning. Where the work is exploratory, the archive preserves those limitations honestly so the next version can start from evidence instead of guesswork.

## Outcome

The result is a focused reference for collaborative editor, including the problem, the technical direction, and the lessons that carry forward to future builds.

The implementation remains intentionally local and dependency-light, making it suitable for experimentation, review, and continued learning.
