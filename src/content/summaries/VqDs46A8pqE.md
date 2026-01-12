---
title: "Claude Code is Amazing... Until It DELETES Production"
videoId: "VqDs46A8pqE"
channel: "IndyDevDan"
channelId: "UC_x36zCEGilGpB1m-V4gmjg"
duration: "PT22M23S"
publishedAt: "2026-01-05T14:00:52Z"
processedAt: "2026-01-12T23:39:53.128Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
thumbnailUrl: "https://i.ytimg.com/vi/VqDs46A8pqE/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=VqDs46A8pqE"
modelUsed: "gemini-2.5-flash"
tldr: |
  Claude Code's new damage control skill prevents AI agents from **deleting production assets** through a layered hook system. It employs:- **Prompt hooks** for non-deterministic blocking of unknown dangerous commands.- **Deterministic pre-tool use hooks** with configurable patterns for known risky actions.- **Path protection** (zero access, read-only, no delete) and **ask permission** flags for gra
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 3
fallbackAttempts: 2
inputTokens: 5949
outputTokens: 1244
totalTokens: 9555
processingTimeMs: 26915
---

## Key Takeaways

This video introduces a critical damage control skill for Claude Code, designed to safeguard production systems from potentially catastrophic actions by AI agents.

*   **Layered Hook System**: The skill implements a comprehensive set of **Claude Code hooks**, including local, global, and the powerful **prompt hook**. Prompt hooks use an LLM to probabilistically catch and block dangerous commands that haven't been explicitly defined, acting as a vital last-ditch defense against unforeseen destructive actions or hallucinations.*   **Granular Control with Patterns**: Engineers can define **deterministic pre-tool use patterns** (regex-based) in a simple YAML file to block known dangerous commands, enforce **ask permission** for specific operations, and establish **path protection levels** (zero access, read-only, no delete) for critical files and directories.*   **Easy Deployment and Management**: The entire damage control system is packaged as a **reusable skill** with an interactive `/install` command. This agentic workflow guides users through setup, allowing for quick deployment at global, project, or personal levels, ensuring consistent security across different codebases.*   **Essential for Agent Trust and Scale**: Given the risk of AI agent hallucination or misinterpretation, implementing robust damage control is non-negotiable. This system builds **"trust without trust"** by preventing agents from executing irreversible commands, allowing engineers to scale agentic workflows safely without fear of accidental data destruction.

## Summary

The "Claude Code is Amazing... Until It DELETES Production" video by Indy

Dev

Dan highlights the critical need for robust damage control systems when using AI agents in production environments. Even highly capable AI models like Claude Code can hallucinate or misinterpret instructions, leading to potentially catastrophic and irreversible actions, such as deleting valuable production assets. The video introduces a specialized "damage control skill" for Claude Code, designed to prevent such incidents.

### Installation and Core Components

The skill features an interactive `/install` command that simplifies setup. This agentic workflow guides users through choosing installation levels (global, project, or personal) and programming languages (Python or Type

Script). Upon installation, it configures various **Claude Code hooks** within the `settings.json` file, working in conjunction with a `patterns.yaml` file for custom rules.

### Layered Damage Control Measures

The core of the damage control system relies on several types of hooks and patterns:*   **Pre-tool Use Blocking**: This is the primary defense, catching commands before they execute. The skill uses a `patterns.yaml` file, which contains a list of regex-based patterns for commands that should never be run (e.g., `rm -rf`). If an agent attempts to run a blocked command, it's immediately prevented.*   **Prompt Hooks (Non-Deterministic)**: This is a powerful, often overlooked feature. For commands that don't match deterministic patterns, a **prompt hook** engages an LLM (Claude) to evaluate the command. If the LLM determines the command is destructive, it will block it, acting as a crucial "last-ditch effort" against unknown or novel dangerous commands. While this introduces a slight delay due to LLM inference, it's deemed a necessary trade-off to prevent irreversible damage.*   **Ask Permission Functionality**: For commands that are potentially risky but not outright forbidden, the system can be configured to prompt the user for confirmation. By setting an `ask: true` flag in the `patterns.yaml` for specific command patterns, the agent will pause and await user input before proceeding.*   **Granular Path Protection**: The skill provides fine-grained control over file and directory access:*   **Zero Access Paths**: Completely prevents the agent from reading, writing, or accessing specified paths.*   **Read-only Paths**: Allows the agent to read but prohibits writing to these paths.*   **No Delete Paths**: Prevents the agent from deleting files or directories within specified paths.

### Global vs. Local Hooks

The video emphasizes the hierarchy of hooks: user-level (global) > project-level > local-level. Global hooks apply across the entire device, providing a baseline of protection even when working in new or rapidly spun-up codebases. This ensures that a fundamental layer of security is always active.

### Importance and Broader Context

The developer stresses that even with improving AI models and built-in protections, the risk of a single "bad command" occurring due to hallucination or misinterpretation is ever-present. This damage control skill acts as a vital "insurance policy," allowing engineers to build trust with their agents and scale agentic engineering safely. It shifts the paradigm from "trusting the agent" to implementing systems that "don't require trust" for critical operations, similar to how human teams manage access to production systems. The skill is open-source and encourages adoption, adaptation, and further development for robust AI security.

## Context

The rise of AI agents in software development promises unprecedented productivity, but also introduces significant risks. As these agents gain more autonomy and access to production systems, the potential for accidental, irreversible damage due to AI hallucination or misinterpretation becomes a critical concern. This video addresses a fundamental challenge in agentic engineering: how to leverage powerful AI tools like Claude Code without sacrificing system integrity. It's highly relevant for any developer, Dev

Ops engineer, or organization experimenting with or deploying AI agents that interact with codebases or production environments, emphasizing the need for robust security layers to prevent catastrophic data loss and build trust in AI-driven workflows.
