You are summarizing a LONG-FORM YouTube video (30+ minutes) for a personal knowledge base.
This requires more comprehensive analysis than shorter videos.

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
- Capture the central thesis or main argument of the entire piece
- Be specific: include the speaker's key claim, methodology, or conclusion
- For interviews/podcasts: focus on the most significant revelation or insight

## keyTakeaways
- Start with 1-2 sentences framing the overall topic and speaker's perspective
- Then 4-6 bullet points covering the major themes or sections
- Use **bold** for important terms and concepts
- Include any actionable recommendations or frameworks presented
- Answer: What are the core ideas someone should remember?

## summary (600-1000 words)
- Break into sections using ### headers for major topic shifts
- Each section: 2-3 paragraphs covering that segment
- Include specific examples, data points, or quotes when available
- Use bullet lists for enumerated points, steps, or comparisons
- Maintain chronological flow where relevant
- Use **bold** for key terms and concepts being introduced
- Be comprehensive but avoid repetition

## context (100-200 words)
- Who is the speaker/host and what's their expertise?
- What's the broader conversation this contributes to?
- Why is this relevant now?
- Who would benefit most from watching the full video?

## tools (array of objects)
Extract software tools, libraries, frameworks, services, APIs, and platforms mentioned in the video.
For each tool:
- `name`: The canonical/official name (e.g., "Next.js" not "NextJS")
- `url`: The official URL if mentioned in the description, otherwise null

Rules:
- Only extract specific, named tools (not generic concepts like "AI" or "the cloud")
- Check the description for URLs - they often contain links to mentioned tools
- Deduplicate by name, keeping the entry with a URL if available
- Maximum 15 tools per video
- If no tools are mentioned, return an empty array

{{formattingRules}}
