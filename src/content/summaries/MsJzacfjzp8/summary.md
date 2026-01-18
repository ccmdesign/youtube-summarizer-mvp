---
title: "OpenAI Adds Agent Skills to Codex (First Look & Walkthrough)"
videoId: "MsJzacfjzp8"
channel: "JeredBlu"
channelId: "UCaIm6rTg-RXb6rB19fYJgTg"
duration: "PT6M41S"
publishedAt: "2025-12-22T04:20:58Z"
processedAt: "2026-01-15T17:48:13.637Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
thumbnailUrl: "https://i.ytimg.com/vi/MsJzacfjzp8/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=MsJzacfjzp8"
modelUsed: "openrouter/deepseek/deepseek-r1-0528:free"
tldr: |
  OpenAI added **agent skills** support to Codex using the open agent skills standard, enabling easy installation of reusable workflows via CLI/extensions to reduce context bloat through **progressive disclosure**.
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "openrouter"
apiCalls: 5
fallbackAttempts: 4
inputTokens: 2535
outputTokens: 1105
totalTokens: 3640
processingTimeMs: 89162
---

## Key Takeaways

Codex now integrates agent skills for efficient AI workflows:

- **Progressive disclosure** loads only skill metadata initially, reducing context window bloat by deferring full content until needed

- Existing **Claude skills** are ~99% compatible without modification, enabling cross-platform reuse

- Install skills via **URL** (using `/skill_installer`) or **local folders** with no configuration changes required

- Built-in **skill evaluator** checks third-party skills for security risks before installation

## Summary

OpenAI has implemented **agent skills** in Codex, adopting Anthropic's open agent skills standard. Skills package instructions, scripts, and reference files into reusable workflows while combating context bloat through **progressive disclosure**—only loading skill names/descriptions initially, then expanding details when invoked. This contrasts with traditional methods like MCP servers that overload context windows upfront.

After updating Codex via npm/bun, users access two built-in skills: `skill_creator` (builds new skills) and `skill_installer` (adds third-party skills). Skills install via URL—demonstrated by adding an **agent skill evaluator** from Git

Hub—or by placing existing Claude skill folders into Codex's directory. Installed skills appear in `/skills` and activate via `$[skill_name]` commands.

Testing revealed strong compatibility:

- Playwright skills built for Claude worked immediately in Codex

- Skills self-correct when encountering platform-specific paths (e.g., redirecting file outputs)
- The evaluator skill successfully audited third-party skills using MCP tools like Bright Data

OpenAI's rapid adoption (within 2 months of Anthropic's release) signals industry alignment on solving LLM limitations through open standards.

## Context

This update addresses critical LLM constraints like **context window bloat**, where agents waste tokens loading unused tools/rules upfront. Developers building AI assistants benefit from modular, reusable skills that enhance functionality without sacrificing performance. It reflects broader industry momentum toward standardized, interoperable AI components—potentially extending to ChatGPT soon—making agent development more efficient and collaborative.
