import type { VideoMetadata } from '~/types/summary';
import type { SchemaType } from '@google/generative-ai';

export interface SummaryPromptInput {
  metadata: VideoMetadata;
  transcript?: string;
}

export interface SummaryResponse {
  keyTakeaway: string;
  summary: string;
}

/**
 * JSON schema for structured Gemini responses.
 * Guarantees the response matches this exact structure.
 */
export const summaryResponseSchema = {
  type: 'object' as SchemaType.OBJECT,
  properties: {
    keyTakeaway: {
      type: 'string' as SchemaType.STRING,
      description: 'The single most important insight or actionable lesson from this video (max 200 characters). This should be the one thing someone should remember if they only read this line.',
      nullable: false
    },
    summary: {
      type: 'string' as SchemaType.STRING,
      description: 'A comprehensive summary of the video content (up to 1000 words, but shorter if the content is simple). Focus on key insights, main arguments, actionable takeaways, and notable quotes or statistics.',
      nullable: false
    }
  },
  required: ['keyTakeaway', 'summary']
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

Provide a summary following these guidelines:

For keyTakeaway:
- The single most important insight or actionable lesson
- Maximum 200 characters, no quotes
- Should be the one thing someone remembers if they only read this line

For summary:
Use the "inverted pyramid" technique from journalism:

1. LEAD (first paragraph): Start with the most important conclusions and key findings. Answer: What is the core message? What should the reader know immediately? Front-load the critical insights so someone reading only the first paragraph gets the essential value.

2. BODY (middle section): Expand with supporting arguments, evidence, and context. Include:
   - Main arguments and reasoning
   - Notable quotes or statistics (paraphrased)
   - Actionable takeaways and practical applications

3. TAIL (final section): Add background context, additional details, and supplementary information that enriches understanding but isn't essential.

Guidelines:
- Up to 1000 words, but shorter if content is simple
- No filler - be direct and information-dense
- Each paragraph should be independently valuable
- A reader can stop at any point and still have gained the most important information up to that point`;
}
