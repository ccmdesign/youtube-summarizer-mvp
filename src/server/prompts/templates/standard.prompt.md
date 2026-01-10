You are summarizing a YouTube video for a personal knowledge base.

Video Title: {{title}}
Channel: {{channel}}
Duration: {{duration}}
Published: {{publishedAt}}

{{#transcript}}
Transcript:
{{transcript}}

{{/transcript}}
Provide a summary with these four fields:

## tldr (max 400 characters)
- The single most important insight or actionable lesson
- Be specific: include names, numbers, methods, or key terminology
- Use bullet points (•) only if there are 2-3 tightly related points
- Example BAD: "This video shares important productivity tips"
- Example GOOD: "The Pomodoro Technique: • 25min work + 5min break • Start with hardest task • Track sessions"

## keyTakeaways
- Start with a brief intro sentence explaining the core message
- Then 2-4 bullet points with the key insights
- Use **bold** for important terms
- Answer: What should the reader know immediately?

## summary (300-600 words)
- Expand on the key points with supporting details
- Use multiple paragraphs - short ones (2-3 sentences each)
- Use bullet lists for steps, tips, or related points
- Use **bold** for key terms being introduced
- Use ### subsection headers if covering distinct topics
- Be information-dense, no filler

## context (50-150 words)
- Background: Why does this matter?
- Who should care about this?
- How does it connect to broader trends or applications?

{{formattingRules}}
