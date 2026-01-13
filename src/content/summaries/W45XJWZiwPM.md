---
title: "Run Multiple Claude Code Agents Without Git Conflicts (Vibe Kanban)"
videoId: "W45XJWZiwPM"
channel: "Zen van Riel"
channelId: "UC7TUInmEJ4NmYb-krFz-SuA"
duration: "PT9M27S"
publishedAt: "2026-01-07T18:15:02Z"
processedAt: "2026-01-13T15:57:50.765Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
playlistName: "AI Summaries"
category: "ai"
thumbnailUrl: "https://i.ytimg.com/vi/W45XJWZiwPM/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=W45XJWZiwPM"
modelUsed: "gemini-3-flash-preview"
tldr: |
  Manage multiple Claude Code agents effectively using **Vibe Kanban**, an open-source orchestration tool. It prevents merge conflicts by isolating tasks into **feature branches**, enables **human-in-the-loop reviews** through a visual interface, and supports **AI-assisted rebasing** to maintain code quality while scaling development.
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 1
fallbackAttempts: 0
inputTokens: 3026
outputTokens: 797
totalTokens: 4714
processingTimeMs: 12324
---

## Key Takeaways

Scaling AI-assisted coding requires moving beyond single-terminal sessions to a structured, branch-based workflow to maintain repository integrity.

- **Vibe Kanban** organizes AI agents by mapping specific tasks to individual feature branches, preventing agents from overwriting work on the `main` branch.

- A **Human-in-the-loop** model is preserved through a visual UI where users can review diffs, comment on specific lines, and request AI revisions before merging.

- **Conflict Management** is handled via automated rebasing and the ability to prompt Claude to resolve Git conflicts it created in shared files like registries or configuration modules.

## Summary

The traditional approach of running multiple **Claude Code** instances in parallel often leads to catastrophic merge conflicts and a loss of oversight. Zen van Riel introduces **Vibe Kanban**, an open-source project designed to orchestrate these agents. By treating AI agents like members of an agile team, the tool provides a visual Kanban board where each task is assigned a dedicated agent working in a separate Git branch.

### The Vibe Kanban Workflow
When a task is created (e.g., adding a 'Cherry Bomb' to a game), the user provides a detailed specification. Once moved to 'In Progress,' Vibe Kanban initializes a **Claude Code session** within a specific sub-tree. This isolation ensures that while one agent is building a 'Squash' plant, another can work on a 'Debug Panel' without direct interference. The tool tracks the entire conversation history, providing a persistent record that is easier to manage than standard terminal sessions.

### Code Review and Revision
Quality control is maintained through a dedicated **Review phase**. Users can inspect a visual diff of the changes made by the AI. If the code requires adjustment—such as changing a variable's value or refactoring a function—the user can leave a comment on a specific line. The AI agent then reads the conversation history and the existing branch state to apply the fix, maintaining a seamless **stateless-to-stateful** workflow.

### Resolving Parallel Conflicts
Even with isolated branches, conflicts are inevitable when agents edit shared files, such as a central registry that tracks all game entities. Vibe Kanban addresses this by:

- Requiring a **rebase** when the base branch has moved forward.

- Allowing the user to delegate conflict resolution back to the AI, which can intelligently merge overlapping logic.

- Providing a 'Merge' button that automatically moves the task to 'Done' and integrates the code into the main repository once the user is satisfied with the local testing in the IDE.

This system allows developers to act as **Project Managers** and **Architects**, overseeing the high-level logic and quality while the AI handles the bulk of the implementation across multiple features simultaneously.

## Context

As AI coding tools evolve from simple completion engines to autonomous agents like Claude Code, the primary bottleneck has shifted from 'writing code' to 'managing agents.' Vibe Kanban represents a growing trend in AI orchestration tools that bridge the gap between raw LLM capabilities and professional software engineering practices. This matters to developers and teams looking to 10x their output without incurring massive technical debt. It reflects a broader shift toward 'Agentic Workflows' where the human role transitions from a coder to a reviewer and orchestrator, using Git-based branching strategies to maintain stability in increasingly complex, AI-generated codebases.
