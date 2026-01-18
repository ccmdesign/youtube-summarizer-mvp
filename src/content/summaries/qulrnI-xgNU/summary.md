---
title: "n8n v2 + MCP: How I Build and Debug Entire Workflows (Tutorial)"
videoId: "qulrnI-xgNU"
channel: "JeredBlu"
channelId: "UCaIm6rTg-RXb6rB19fYJgTg"
duration: "PT14M6S"
publishedAt: "2025-12-18T15:39:32Z"
processedAt: "2026-01-15T17:50:22.608Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
thumbnailUrl: "https://i.ytimg.com/vi/qulrnI-xgNU/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=qulrnI-xgNU"
modelUsed: "openrouter/deepseek/deepseek-r1-0528:free"
tldr: |
  JeredBlu demonstrates using CZ Lancowski's unofficial n8n MCP server (via Docker) with Cloud Code Opus45 to build/debug workflows efficiently, recommending Hostinger for cost-effective self-hosting.
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "openrouter"
apiCalls: 5
fallbackAttempts: 4
inputTokens: 4533
outputTokens: 1249
totalTokens: 5782
processingTimeMs: 98410
---

## Key Takeaways

The unofficial n8n MCP server revolutionizes workflow creation and debugging. Key insights:

- **CZ Lancowski's MCP server** enables full workflow editing, debugging, and execution analysis locally, surpassing n8n's limited official tool

- **Self-hosting on Hostinger** cuts costs by ~75% vs n8n Cloud (KVM2 plan: unlimited executions)
- **Workflow process**: Start with a PRD, use Cloud Code + MCP skills for AI-assisted building (e.g., email scam detector), then iterate via execution debugging

## Summary

### Unofficial MCP Server Setup
CZ Lancowski's Docker-based MCP server (11k Git

Hub stars) connects to n8n instances via API key and URL. It enables:

- Full workflow creation/editing

- Execution analysis and debugging

- Integration with **Cloud Code Opus45** using **n8n MCP skills** for context-aware AI assistance

Compared to n8n's official MCP (limited to 3 tools), this solution works for both cloud and self-hosted users, offering superior control.

### Hosting and Upgrades
**Hostinger** provides affordable self-hosting:

- KVM2 plan handles n8n efficiently

- Unlimited executions at ~25% of n8n Cloud's cost (use code `Jered

Blu` for 10% discount)
- Includes templates like 100+ pre-built workflows

For **n8n v2 upgrades**:
1. Check migration report for breaking changes
2. Run terminal commands: `docker compose pull`, `docker compose down`, `docker compose up -d`

### Workflow Development Process
1. **Start with a PRD**: Define requirements first (e.g., phishing email detector)
2. **AI-driven building**: Cloud Code Opus45 uses MCP tools to:

- Generate node-based implementation plans

- Auto-create workflows from PRDs

- Handle node replacements (e.g., OpenAI → Open

Router)
3. **Debugging workflow**:

- Save and exit n8n before agent edits to avoid version conflicts

- Analyze past executions via MCP server

- Refactor complex workflows using AI insights

## Context

This approach addresses key n8n pain points: limited debugging tools, cloud execution caps (~50 AI credits/month), and the absence of AI features in self-hosted versions. It empowers developers and automation engineers to build complex workflows efficiently using agentic coding trends. Self-hosted users gain cloud-like AI capabilities, while all users benefit from Hostinger's cost savings.
