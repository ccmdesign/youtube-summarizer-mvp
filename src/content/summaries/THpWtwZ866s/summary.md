---
title: "GitHub Spec Kit 🤝 Agent Handoffs in Visual Studio Code"
videoId: "THpWtwZ866s"
channel: "Den Delimarsky"
channelId: "UCNHIUc6KE64sUe5G0eP70aQ"
duration: "PT14M14S"
publishedAt: "2025-10-22T21:25:05Z"
processedAt: "2026-01-16T15:27:04.318Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
thumbnailUrl: "https://i.ytimg.com/vi/THpWtwZ866s/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=THpWtwZ866s"
modelUsed: "gemini-2.5-flash"
tldr: |
  Spec Kit introduces **Agent Handoffs** in VS Code Insiders, streamlining developer workflows with AI agents. - **Chat modes** act as programmable system prompts, triggered by simple commands. - **Handoffs** provide intuitive next-step buttons, automatically switching agents and pre-filling prompts based on task completion. - This reduces **command sprawl** and cognitive load, making multi-step pro
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 3
fallbackAttempts: 2
inputTokens: 3740
outputTokens: 1202
totalTokens: 7410
processingTimeMs: 55204
---

## Key Takeaways

The latest Spec Kit updates, currently in a Git

Hub PR for VS Code Insiders, significantly enhance developer workflow with AI agents.

*   **Agent Handoffs**: This new feature provides context-aware next-step suggestions within VS Code Copilot. After an agent completes a task (e.g., generating a project constitution), intuitive buttons appear, guiding the user to the next logical step, such as "Build Specification" or "Build Technical Plan."
*   **Seamless Agent Switching**: Clicking a handoff button automatically switches the active **chat mode** (agent) in Copilot and can pre-fill prompts, eliminating the need for manual slash commands or remembering the next step in a complex workflow. This dramatically reduces **command sprawl**.

*   **Chat Modes as System Prompts**: Spec Kit has refactored its prompt system, moving from simple `.prompt.md` files to more robust `.chat_mode.md` files. These chat modes function as programmable system prompts, allowing for more sophisticated and encapsulated agent behaviors.

*   **Improved Branch Naming**: Utilizing Large Language Models (LLMs), Spec Kit now generates short, descriptive branch names based on the user's initial prompt, replacing previous unhelpful naming conventions like "001 I want you."

## Summary

Den Delimarsky introduces upcoming features for **Spec Kit**, currently gated behind a pull request (PR 986) and available in **VS Code Insiders**, focusing on enhancing agent handoffs and overall developer experience within Visual Studio Code with Copilot. He expresses gratitude for Spec Kit's growing user base of over 40,000 users.

### Streamlined Workflow with Chat Modes and Handoffs
A significant update involves the shift from traditional "prompts" to "chat modes." Previously, Spec Kit used `.prompt.md` files. Now, it introduces `.chat_mode.md` files, which function more like **system prompts**. The content that was once in a prompt is now encapsulated within a chat mode. While traditional prompts still exist as shortcuts, they primarily serve to hint to VS Code Copilot which chat mode to activate. For instance, typing a command like "Constitution" for a new project now triggers the `specit-constitution` chat mode, which then follows its defined steps. This reorganization allows for a more structured and programmable approach to guiding the AI agent.

The core new functionality is **Agent Handoffs**. This feature integrates into the VS Code Copilot UX, allowing developers to define subsequent actions within their `chat_mode.md` files using a YAML front matter section called `handoffs`. When an agent completes a task (e.g., generating a project constitution), intuitive buttons appear in the chat interface, guiding the user to the next logical step in the development workflow. For example, after the constitution is complete, a "Build Specification" button might appear.

### Benefits and Implementation Details
These handoffs offer several key benefits:

*   **Reduced Cognitive Load**: Developers no longer need to remember the next command or navigate through files to determine the next step in a multi-stage process. The UX provides clear, actionable suggestions.

*   **Seamless Agent Switching**: Clicking a handoff button automatically switches the active Copilot agent to the appropriate chat mode for the next task.

*   **Pre-filled Prompts**: Handoffs can also pre-fill parts of the next prompt. The `handoffs` configuration allows specifying an `agent` to switch to, a `prompt` string, and a `send` boolean. If `send: true`, the agent automatically executes the prompt (e.g., for clarification). If `send: false`, it provides the prompt but allows the user to add further context (e.g., "build technical plan with..."). This intuitive flow significantly reduces the amount of manual input and clicking required.

Another notable improvement is the **LLM-powered branch naming**. Spec Kit now uses Large Language Models to generate short, descriptive branch names based on the initial project prompt (e.g., `001 podcast landing`), replacing less intuitive previous methods. For developers wishing to experiment with these new features, a local script (`create release packages`) allows generating local copies of all Spec Kit templates, enabling testing within VS Code Insiders. Delimarsky emphasizes that while handoffs are currently an Insiders-only feature, the PR will be merged iteratively, and the buttons will "light up" in production VS Code once the feature rolls out widely.

## Context

This video is crucial for developers using **Spec Kit** and **Git

Hub Copilot** within **Visual Studio Code**, especially those working on complex, multi-stage software projects. It highlights the growing trend of integrating AI agents directly into the developer environment to streamline workflows and reduce friction. The introduction of **Agent Handoffs** and **Chat Modes** signifies a move towards more intelligent, guided development experiences, where AI not only assists with code generation but also helps manage the project lifecycle. This evolution aims to make development faster, less error-prone, and more accessible by simplifying command interaction and maintaining context across different tasks. It's particularly relevant for enhancing productivity in AI-assisted coding environments.
