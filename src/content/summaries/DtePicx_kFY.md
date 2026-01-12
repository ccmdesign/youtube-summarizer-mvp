---
title: "He Co-Invented the Transformer. Now: Continuous Thought Machines [Llion Jones / Luke Darlow]"
videoId: "DtePicx_kFY"
channel: "Machine Learning Street Talk"
channelId: "UCMLtBahI5DMrt0NPvDSoIRQ"
duration: "PT1H12M40S"
publishedAt: "2025-11-23T17:11:59Z"
processedAt: "2026-01-12T23:28:39.628Z"
source: "youtube"
playlistId: "PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn"
playlistName: "AI Summaries"
category: "ai"
thumbnailUrl: "https://i.ytimg.com/vi/DtePicx_kFY/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=DtePicx_kFY"
modelUsed: "gemini-3-flash-preview"
tldr: |
  Llion Jones, co-inventor of the **Transformer**, is shifting focus away from the architecture to explore **Continuous Thought Machines (CTM)**. 
  - **Biological inspiration**: CTMs utilize neuron synchronization and internal recurrence rather than static attention layers.
  - **Native adaptive compute**: The system naturally spends more time on complex tasks without explicit penalties.
  - **Escaping t
# Video Taxonomy
lengthCategory: "longform"
# AI Processing Metrics
aiProvider: "gemini"
apiCalls: 1
fallbackAttempts: 0
inputTokens: 15137
outputTokens: 1470
totalTokens: 17150
processingTimeMs: 14667
---

## Key Takeaways

Llion Jones and Luke Darlow argue that the AI industry is currently trapped in a **local minimum** of Transformer-based architectures, relying on brute-force scaling rather than structural innovation.

* **Continuous Thought Machines (CTM)**: A new architecture featuring an internal "thought dimension" that allows for sequential, latent reasoning before producing an output.

* **Neuron Level Models (NLM)**: Each individual neuron in a CTM is replaced by a small MLP, allowing neurons to possess their own internal dynamics and history.

* **Synchronization as Representation**: Instead of static state vectors, CTMs use the **synchronization** (dot product) of neuron activations over time to represent complex information.

* **Native Adaptive Compute**: Unlike Transformers, which use the same compute for every token, CTMs solve easy problems quickly and harder ones by "thinking" for more internal steps, resulting in near-perfect **model calibration**.

* **The Sudoku Bench**: A new challenge for AGI involving variant Sudokus that require **meta-reasoning** and the discovery of unique "break-ins" that current LLMs cannot solve.

## Summary

### The Post-Transformer Era and the Research Local Minimum
Llion Jones reflects on the creation of the **Transformer**, noting that it emerged from a "bottom-up" environment of research freedom that is increasingly rare in today's commercialized AI landscape. He expresses concern that the industry has entered a phase of "technology capture," where the overwhelming success of **Large Language Models (LLMs)** has stalled architectural exploration. Jones compares the current era to the pre-Transformer period of RNNs, where researchers made marginal improvements to LSTMs until a fundamental shift rendered those efforts redundant. He suggests that while Transformers are powerful **universal approximators**, they exhibit "jagged intelligence"—solving PhD-level problems while failing at basic logic—indicating a fundamental flaw in their representation of the world.

### Introduction to Continuous Thought Machines (CTM)
To address these flaws, Jones and Luke Darlow at Sakana AI developed the **Continuous Thought Machine (CTM)**. The architecture moves away from the static, layer-by-layer processing of Transformers toward a recurrent, biologically inspired system. The CTM is built on three pillars: an **internal thought dimension**, **Neuron Level Models (NLM)**, and **synchronization**. By allowing a model to process information across an internal temporal dimension, it can break down problems into sequential steps. This is demonstrated through a "Hello World" maze-solving task, where the model must trace a path step-by-step rather than predicting the entire solution in a single shot.

### Rethinking the Neuron and Representation
In a CTM, the traditional neuron (often a simple ReLU activation) is replaced with a **Neuron Level Model**, effectively a small MLP that processes its own history. This allows the system to maintain a continuous time series of activations. Crucially, the model's representation of a "thought" is not just the state of the neurons at a specific moment, but how those neurons **synchronize** with one another over time. By measuring the dot product of activation histories, the system creates a high-dimensional representation space that is far richer than standard state vectors. This approach mimics biological brain waves, where different frequencies and synchronization patterns correspond to different states of cognition.

### Adaptive Compute and Model Calibration
One of the most significant findings of the CTM research is its native ability for **adaptive computation**. In traditional AI, forcing a model to use less compute for easy tasks often requires complex loss functions or hyperparameters. In CTMs, the researchers use a loss function that monitors both performance and certainty. This naturally encourages the model to exit its "thought process" early for simple images (like a cat) while taking more time to disambiguate difficult classes. This results in nearly perfect **model calibration**, meaning the model's confidence scores accurately reflect its probability of being correct—a trait notably absent in modern deep learning models.

### Emergent Behaviors: Leapfrogging and Backtracking
During training on complex mazes, the CTM exhibited fascinating emergent behaviors that hint at human-like reasoning. When time-constrained, the model developed a **"leapfrogging" algorithm**, jumping ahead to a point in the maze and then tracing backward to fill in the path. It also showed signs of **backtracking**, where the internal activations would descend one path, realize it was a dead end, and then return to a previous junction to try another route. These behaviors are not explicitly programmed but fall out of the architecture’s recurrent, sequential nature.

### The Sudoku Bench and the Quest for AGI
Jones introduces **Sudoku Bench**, a dataset of variant Sudokus designed to test **meta-reasoning**. Unlike standard puzzles, these include unique natural language constraints (e.g., "one number in this rule is a lie") or overlaid mazes. Jones argues that current AI lacks the ability to find "break-ins"—the specific logical leap required to solve a handcrafted puzzle. By open-sourcing thousands of hours of expert reasoning from the "Cracking the Cryptic" You

Tube channel, Sakana AI aims to provide the "thought traces" necessary for models to move beyond simple pattern matching toward genuine deductive reasoning. This highlights the gap between current **LLMs** and a system capable of open-ended scientific discovery.

## Context

The video features **Llion Jones**, a co-author of the seminal 'Attention Is All You Need' paper and co-founder of **Sakana AI**, and **Luke Darlow**, a lead research scientist. This discussion is pivotal because it signals a strategic pivot by one of the architects of the current AI boom away from the Transformer architecture. Jones and Darlow argue that the industry's reliance on 'brute force' scaling of LLMs ignores fundamental requirements for intelligence, such as native adaptive compute and structured reasoning. 

This conversation contributes to the growing 'Beyond Transformers' discourse, which includes researchers looking into SSMs (State Space Models), Diffusion World Models, and neuro-symbolic hybrids. It is particularly relevant for ML engineers and researchers interested in **biologically inspired AI** and the limitations of current benchmarks. The episode provides a deep dive into Sakana AI's philosophy, which prioritizes 'following the gradient of interest' and research freedom—a philosophy heavily influenced by Kenneth Stanley’s 'Why Greatness Cannot Be Planned.'
