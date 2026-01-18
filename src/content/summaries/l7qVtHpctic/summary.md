---
title: "Claude Code's MCP Problem Just Got Fixed"
videoId: "l7qVtHpctic"
channel: "Kenny Liao"
channelId: "UCOEqiv0-yg_hx0nJiaWJK4Q"
duration: "PT28M24S"
publishedAt: "2026-01-17T21:24:09Z"
processedAt: "2026-01-18T16:35:26.181Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
playlistName: "AI Summaries"
category: "ai"
thumbnailUrl: "https://i.ytimg.com/vi/l7qVtHpctic/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=l7qVtHpctic"
modelUsed: "gemini-3-flash-preview"
tldr: |
  Anthropic introduced **lazy loading** in Claude Code 2.17 to eliminate MCP context bloat.
  - **Enable tool search** by setting `enable_tool_search: true` in `settings.json`.
  - **Reduces token usage** from tens of thousands to near zero by fetching schemas on demand.
  - **Maintains performance** by injecting specific tools only when identified by name or keyword.
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 1
fallbackAttempts: 0
inputTokens: 5863
outputTokens: 792
totalTokens: 11552
processingTimeMs: 37736
---

## Key Takeaways

Claude Code now features a dynamic tool-fetching mechanism that prevents unused MCP definitions from consuming the 200k context window.

- **MCP Search Tool:** Version 2.17 uses `mcp_search` to fetch full schemas only when a specific tool is required for a task.

- **Configuration Overrides:** This feature is currently opt-in and requires a manual update to the `settings.json` file at the project or global level.

- **Persistence and Compaction:** Loaded tools remain in context to ensure high attention during a session but are cleared during the `/compact` process to save space.

## Summary

### The Evolution of MCP in Claude Code
Previously, connecting multiple **Model Context Protocol (MCP)** servers to Claude Code resulted in 'context bloat.' Every tool definition, including complex schemas for platforms like Superbase or Sentry, was preloaded into the context window. This could easily consume over 35,000 tokens before a user even sent their first message, significantly reducing the space available for actual code and reasoning.

### The New Lazy Loading Solution
In version 2.17, Anthropic introduced a **lazy loading** architecture. Instead of full schemas, Claude Code now initially loads only the names of available tools. This provides the model with an 'index' of capabilities without the associated token cost. When Claude identifies a need for a specific function, it utilizes a new system tool called **mcp_search**.

This tool supports two modes of operation:

- **Direct Selection:** If Claude knows the exact tool needed, it calls `select:[tool_name]`.

- **Keyword Search:** If the requirement is vague, Claude can perform a natural language search to find the top five most relevant tools.

### Implementation Steps
To utilize this feature, users must manually enable it by modifying their `.claude/settings.json` (either globally or within a specific project folder). Adding the environment variable `'enable_tool_search': true` tells Claude Code to bypass the default preloading behavior. Once enabled, users will see MCP servers listed in a 'grayed out' state in the context overview, indicating they are ready for on-demand loading.

### Impact on Context Management
When a tool is fetched via `mcp_search`, the full schema is dynamically injected into the system message. This ensures the model has the necessary parameters and instructions to execute the tool correctly. These definitions stay in the context for the duration of the session to facilitate repeated calls. However, unlike the previous preloading method, these tools are ephemeral. Running the **/compact** command effectively 'purges' the loaded tools, returning the context to a clean state while keeping the model's ability to re-fetch them as needed.

## Context

The ability to scale tool access without sacrificing context is a pivotal development for AI-integrated development environments. As the MCP ecosystem matures, developers are connecting more specialized servers for database management, project tracking, and cloud infrastructure. Without lazy loading, the sheer volume of documentation would eventually render AI agents ineffective. This update ensures that Claude Code remains performant even when integrated with dozens of external services, marking a transition from 'all-in-memory' toolsets to more efficient 'search-and-retrieve' architectures that mimic how human engineers utilize technical documentation.
