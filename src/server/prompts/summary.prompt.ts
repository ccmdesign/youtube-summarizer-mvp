import type { VideoMetadata } from '~/types/summary';
import type { SchemaType } from '@google/generative-ai';

export interface SummaryPromptInput {
  metadata: VideoMetadata;
  transcript?: string;
}

export interface SummaryResponse {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
}

/**
 * JSON schema for structured Gemini responses.
 * Each section is a separate field to avoid line-breaking issues.
 * Markdown formatting is allowed within each field.
 */
export const summaryResponseSchema = {
  type: 'object' as SchemaType.OBJECT,
  properties: {
    tldr: {
      type: 'string' as SchemaType.STRING,
      description: 'A single sentence (max 400 chars) capturing the most important insight. Be specific - include names, numbers, or key terms. Can use bullet points (•) for 2-3 related points.',
      nullable: false
    },
    keyTakeaways: {
      type: 'string' as SchemaType.STRING,
      description: 'The 2-4 most important points from the video. Use markdown: start with a brief intro sentence, then bullet points (* or -) for each takeaway. Use **bold** for key terms. Multiple paragraphs OK.',
      nullable: false
    },
    summary: {
      type: 'string' as SchemaType.STRING,
      description: 'Detailed summary of the video content. Use markdown: paragraphs, bullet lists, **bold** for key terms, ### for subsections if needed. Multiple paragraphs encouraged. 300-600 words.',
      nullable: false
    },
    context: {
      type: 'string' as SchemaType.STRING,
      description: 'Background context and why this matters. Use markdown paragraphs. Explain the broader significance, who should care, or how this connects to larger trends. 50-150 words.',
      nullable: false
    }
  },
  required: ['tldr', 'keyTakeaways', 'summary', 'context']
};

/**
 * Build the prompt for video summarization.
 *
 * Customize this prompt to change how summaries are generated.
 * The response structure is enforced by summaryResponseSchema.
 */
export function buildSummaryPrompt(input: SummaryPromptInput): string {
  const { metadata, transcript } = input;

  return `You are summarizing a YouTube video for a personal knowledge base.

Video Title: ${metadata.title}
Channel: ${metadata.channel}
Duration: ${metadata.duration}
Published: ${metadata.publishedAt}

${transcript ? `Transcript:\n${transcript}\n\n` : ''}

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

Formatting rules:
- Use markdown within each field: **bold**, bullet points (* or -), ### headers
- Paragraphs should be separated by blank lines
- Keep paragraphs short and scannable
- DO NOT include the section headers (## Key Takeaways, etc.) - just the content`;
}
