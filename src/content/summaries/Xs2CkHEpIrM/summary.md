---
title: "Why I Stopped Using MCPs in Claude Code (And What I Use Instead)"
videoId: "Xs2CkHEpIrM"
channel: "Kenny Liao"
channelId: "UCOEqiv0-yg_hx0nJiaWJK4Q"
duration: "PT25M32S"
publishedAt: "2026-01-12T14:01:03Z"
processedAt: "2026-01-17T17:01:08.212Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
playlistName: "AI Summaries"
category: "ai"
thumbnailUrl: "https://i.ytimg.com/vi/Xs2CkHEpIrM/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=Xs2CkHEpIrM"
modelUsed: "gemini-3-flash-preview"
tldr: |
  Directly connecting multiple MCP servers to Claude Code bloats the context window, causing **context rot** and performance degradation. **MCP Launchpad** solves this by:
  - Replacing dozens of tool definitions with a single **CLI gateway**
  - Using **BM25 semantic search** for on-demand tool discovery
  - Restoring nearly **100% of the context window** while scaling to thousands of tools.
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 1
fallbackAttempts: 0
inputTokens: 5093
outputTokens: 830
totalTokens: 7259
processingTimeMs: 15038
---

## Key Takeaways

Connecting multiple MCP servers directly to Claude Code creates a massive bottleneck where tool definitions consume over 50% of the available **200,000 token limit**.

* **Context Rot** occurs when irrelevant tool data distracts the AI, leading to lower reasoning quality and higher costs.

* **MCP Launchpad** acts as a unified CLI that follows the principle of **progressive disclosure**, where Claude only learns about a tool's schema when it specifically needs it.

* The tool enables **semantic search**, allowing Claude to find capabilities (like database querying or issue tracking) across dozens of servers using natural language queries.

## Summary

The current standard for using Model Context Protocol (MCP) servers with Claude Code involves connecting them directly to the agent. While easy to set up, this method is fundamentally unscalable. Each MCP server injects its entire tool schema into the system prompt. For a power user with seven or more servers, this can consume 100,000 tokens—half of Claude's context window—before a single word is typed. This results in **context rot**, where the model's performance degrades because it is overwhelmed by irrelevant information.

### The MCP Launchpad Concept
To solve this, the author developed **MCP Launchpad**, a CLI tool built with **UV** that centralizes all MCP servers. Instead of pre-loading thousands of tool definitions, Claude is given a small system prompt instructing it to use the `mcpl` command. This shifts the AI's workflow from "total recall" to "just-in-time discovery." When Claude needs a specific capability, it uses the CLI to find, inspect, and then execute the appropriate tool.

### Key Features of the Tool
The Launchpad provides several essential functions for AI agents:

- **Semantic Search:** Utilizing the **BM25 algorithm**, Claude can search for tools using keywords or concepts (e.g., "Sentry errors" or "SQL query").

- **Tool Inspection:** Claude can call `mcpl inspect` to receive the exact JSON schema for a specific tool, ensuring it uses the correct parameters.

- **Caching and Management:** The tool caches definitions from various MCP servers to ensure fast lookups and allows users to enable or disable specific servers easily.

### Setup and Configuration
Users can install the utility as a global tool using **UV**. Configuration is managed via an `mcp.json` file and a `.env` file for secrets, typically stored in the user's hidden `.claude` directory. To complete the integration, a `claude.md` file is used to provide the AI with the necessary instructions on how to browse and use the Launchpad. This setup ensures that the AI's workspace remains clean, preserving the context window for actual coding and problem-solving tasks.

## Context

As AI agents like Claude Code become more autonomous, the demand for specialized tools (Sentry, Linear, Superbase, etc.) is increasing. However, current LLM architectures struggle with the trade-off between having many capabilities and maintaining high-quality reasoning. This video addresses the technical bottleneck of 'context bloat' in agentic workflows. It is essential for developers and AI power users who want to scale their agents' capabilities to hundreds or thousands of tools without sacrificing the model's accuracy or exceeding token limits. This represents a broader shift toward 'agentic discovery' as a best practice in AI engineering.
