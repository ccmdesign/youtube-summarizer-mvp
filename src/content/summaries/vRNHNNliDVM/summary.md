---
title: "The SECRET to Stunning AI Video Prompts!"
videoId: "vRNHNNliDVM"
channel: "Theoretically Media"
channelId: "UC9Ryt3XOGYBoAJVsBHNGDzA"
duration: "PT14M15S"
publishedAt: "2026-01-14T23:07:00Z"
processedAt: "2026-01-15T14:34:19.146Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
playlistName: "AI Summaries"
category: "ai"
thumbnailUrl: "https://i.ytimg.com/vi/vRNHNNliDVM/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=vRNHNNliDVM"
modelUsed: "gemini-3-flash-preview"
tldr: |
  Elevate AI cinematography using structured LLM workflows and technical film data:
  - **The 2x2 Method**: Generate 2x2 grids in **Nano Banana Pro**, then crop and enhance for high-fidelity base images.
  - **Shot Deck Integration**: Extract real-world lens, camera, and hex code data from **Shot Deck** to ground LLM prompts in professional cinematography.
  - **Aspect Ratio**: Use native **21:9** formatt
# Video Taxonomy
lengthCategory: "standard"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 1
fallbackAttempts: 0
inputTokens: 4202
outputTokens: 882
totalTokens: 6170
processingTimeMs: 15680
---

## Key Takeaways

This workflow focuses on moving away from random prompting toward a repeatable, technical pipeline for high-end AI film production.

* **LLM Template Cascading**: Utilize specific templates for LLMs (like GPT or Claude) to generate massive 2,800-character prompts that cover character consistency and environmental details.

* **Technical Metadata**: Incorporating specific camera rigs (e.g., **Arri Alexa 35**) and lens types (e.g., **Panavision anamorphic**) helps steer the AI toward specific visual 'ballparks.'
* **Refinement Loop**: The process requires a 'crop and enhance' step—taking a low-res generation and running it through an enhancement prompt before final video conversion.

* **Real-World References**: Using tools like **Shot Deck** allows creators to inject professional color palettes and lighting schemas into their AI generations.

## Summary

### The Foundation: The PJ A. Workflow
The core of this method builds on the **Legend of Zelda trailer workflow**, which shifts AI video from a single-prompt gamble to a multi-stage pipeline. The process starts in **Nano Banana Pro** utilizing an image-to-video workflow. By generating images in a **2x2 grid**, creators can quickly iterate and select the most successful composition without wasting excessive credits on single-shot failures.

### LLM-Driven Prompt Engineering
Rather than manual writing, the workflow uses a sophisticated **LLM prompt template**. This template acts as a bridge, taking a simple scenario description and expanding it into a detailed, 2,800-character technical prompt. These prompts are designed to be 'context-dense,' providing the AI model with exhaustive details on lighting, textures, and character traits to ensure the output matches a specific cinematic vision.

### The Refining and Enhancement Phase
Once a 2x2 grid is generated, the creator crops the preferred shot. Because cropping reduces resolution, the image must undergo an **enhancement pass**. This involves running the cropped image back through Nano Banana with a specific enhancement prompt to restore detail and remove 'mushiness' before it is converted into video. For video generation, tools like **Cling 2.6** are recommended for their ability to respect wider aspect ratios and maintain fluid motion.

### Cinematic Steerage and Shot Deck
To move beyond generic AI aesthetics, creators should use 'homebrew' camera selections. By adding keywords like **IMAX**, **Hawk 5 anamorphic lenses**, or even vintage **Sony VFX1000** DV cams, the model is pushed toward specific visual styles. 

A major breakthrough involves using **Shot Deck**, a massive database of technical metadata from professional films. By extracting the specific **color hex codes**, lens focal lengths, and lighting setups from real movies (like *Andor* or *Asteroid City*) and feeding them into the LLM template, the resulting AI video adopts the professional 'look and feel' of those productions. This experimental approach allows for high-level stylization that traditional prompting cannot achieve.

## Context

AI video generation is rapidly evolving from a hobbyist novelty into a serious tool for independent filmmaking. This workflow represents a shift toward 'cinematic literacy' in AI, where users apply traditional filmmaking concepts—like lens choice, color theory, and aspect ratio—to steer generative models. It matters because it provides a bridge for traditional filmmakers to enter the AI space and for AI creators to achieve professional-grade consistency. This connects to the broader trend of 'AI Filmmaking' where the quality of the output is increasingly determined by the structure of the workflow rather than the specific model used.
