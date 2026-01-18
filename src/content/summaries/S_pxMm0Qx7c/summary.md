---
title: "Claude Code's Creator Has a Surprisingly Vanilla Setup"
videoId: "S_pxMm0Qx7c"
channel: "JeredBlu"
channelId: "UCaIm6rTg-RXb6rB19fYJgTg"
duration: "PT8M57S"
publishedAt: "2026-01-04T20:43:08Z"
processedAt: "2026-01-16T15:29:14.808Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
thumbnailUrl: "https://i.ytimg.com/vi/S_pxMm0Qx7c/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=S_pxMm0Qx7c"
modelUsed: "gemini-2.5-flash"
tldr: |
  Boris Churnney, Claude Code's creator, reveals a "vanilla" setup that emphasizes workflow over customization, though it leverages significant parallel usage due to unlimited tokens.
  - **Parallel sessions**: Runs multiple Claude Code instances across terminals, web, and mobile concurrently.
  - **Plan Mode Priority**: Focuses heavily on planning for reliable, one-shot code generation.
  - **Feedback Lo
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 3
fallbackAttempts: 2
inputTokens: 3146
outputTokens: 1078
totalTokens: 9094
processingTimeMs: 74618
---

## Key Takeaways

Boris Churnney's usage of Claude Code, while enabled by unlimited tokens, offers critical insights for optimizing AI-assisted development workflows:

- Prioritize **plan mode** extensively: Thorough planning with Claude before execution leads to significantly more accurate and "one-shot" code generation.

- Leverage **slash commands** and **sub-agents**: Automate repetitive tasks and complex workflows to streamline development and manage context effectively, rather than relying solely on extensive customization.

- Implement robust **feedback loops**: Provide Claude with mechanisms to verify its own work (e.g., **Chrome for Claude extension**) for 2-3 times better final results.

- Practice careful **permission management**: Avoid the `dangerously skip permissions` (YOLO) mode; instead, use `SL permissions` to pre-approve safe bash commands to maintain control and prevent errors.

## Summary

This video delves into the surprisingly 'vanilla' setup of Boris Churnney, the creator of Claude Code, highlighting his practical workflow despite the tool's extensive customizability. While Churnney and his team at Anthropic benefit from unlimited token usage – a key differentiator from average users – his methodology provides valuable lessons in optimizing AI-driven development. The speaker, Jered

Blu, emphasizes adapting these insights for typical usage limitations.

### Churnney's "Vanilla" but High-Volume Setup
Churnney runs an impressive number of Claude Code sessions concurrently: five in parallel in his terminal using i

Term2, five to ten web sessions on claude.ai, and multiple sessions via the Claude iOS app. This high parallel usage is a direct result of his unlimited token access, allowing for extensive concurrent experimentation and development. He exclusively uses **Opus45 with Thingy**, considering it the superior coding model for its reduced need for steering and enhanced tool use.

### Collaborative `cla.md` and Planning
His team utilizes a shared `cla.md` file, checked into Git and updated weekly, to consistently add rules that guide Claude's behavior (e.g., 'always use bun, not npm'). While effective for his team, the speaker cautions that lengthy `cla.md` files can become less effective for token-constrained users. A core tenet of Churnney's workflow is starting most sessions in **plan mode**. He engages in extensive back-and-forth with Claude to refine a plan before switching to auto-accept edit mode, often achieving a "one-shot" solution. This emphasizes that a well-defined plan is crucial for optimal results.

### Automation and Permission Control
Churnney heavily relies on **slash commands** for repeated inter-loop workflows, saving time from repetitive prompting. He also uses a few **sub-agents** to automate common, complex tasks like QA testing or research, helping to manage context windows effectively. For formatting, a **post-tool hook** is employed to handle the final 10% of code formatting, ensuring consistency. Critically, he avoids the `dangerously skip permissions` (YOLO) mode, opting instead for **`SL permissions`** to pre-allow safe bash commands, thereby maintaining control and preventing unintended actions.

### Tool Use and The Power of Feedback Loops
Claude Code integrates seamlessly with various tools, performing tasks like searching Slack, running Big

Query CLI queries, and grabbing error logs from Sentry. For long-running tasks, he instructs Claude to verify its work with a background agent or uses a **stop agent hook**. The most significant takeaway is the importance of a **feedback loop**. Providing Claude with a mechanism to verify its own work – whether through Playwright, Chrome Dev

Tools, or the new **Chrome for Claude extension** for web-based projects – can improve output quality by 2-3 times. This enables Claude to check UI visuals, network activity, and logs, mirroring a human developer's verification process. While Churnney's setup is described as 'vanilla', his focus on planning, automation, and rigorous feedback loops offers a sophisticated model for leveraging AI in development.

## Context

The rapid advancement of AI coding agents like Claude Code, Gemini CLI, and Codex CLI is transforming software development. Understanding the workflows of experienced users, especially creators like Boris Churnney, is crucial for maximizing productivity with these tools. This video provides insights into how a leading expert uses AI for coding, highlighting best practices such as rigorous planning and feedback loops. These strategies are particularly relevant for developers seeking to optimize their own AI-assisted coding processes, navigating token limitations, and staying ahead in the evolving landscape of AI engineering.
