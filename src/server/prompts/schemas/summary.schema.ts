import type { VideoMetadata, Tool } from '~/types/summary';
import type { SchemaType } from '@google/generative-ai';

/**
 * Input for building a summary prompt.
 */
export interface SummaryPromptInput {
  metadata: VideoMetadata;
  transcript?: string;
}

/**
 * Structured response from AI summarization.
 * Used by both Gemini (via JSON schema) and OpenRouter (via JSON parsing).
 */
export interface SummaryResponse {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
  tools: Tool[];
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
      description: 'A concise summary (max 400 chars) using proper markdown. Format: Start with a lead sentence, then use markdown bullet points (- item) on separate lines for 2-3 key points. Use **bold** for emphasis. Example:\nMain insight here:\n- **Key point one** with brief context\n- **Key point two** explained\n- **Key point three** summarized',
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
    },
    tools: {
      type: 'array' as SchemaType.ARRAY,
      description: 'Software tools, libraries, frameworks, services, APIs, and platforms mentioned in the video. Max 15 items. Return empty array if no tools mentioned.',
      items: {
        type: 'object' as SchemaType.OBJECT,
        properties: {
          name: {
            type: 'string' as SchemaType.STRING,
            description: 'The canonical/official name of the tool (e.g., "Next.js" not "NextJS")',
            nullable: false
          },
          url: {
            type: 'string' as SchemaType.STRING,
            description: 'The official URL if mentioned in the description, otherwise null',
            nullable: true
          }
        },
        required: ['name', 'url']
      },
      nullable: false
    }
  },
  required: ['tldr', 'keyTakeaways', 'summary', 'context', 'tools']
};

/**
 * Extended schema descriptions for long-form videos.
 * These override base schema descriptions with expanded expectations.
 */
export const longformSchemaOverrides = {
  keyTakeaways: {
    description: 'The 4-6 most important points from the video. Use markdown: start with 1-2 framing sentences, then bullet points (* or -) for each takeaway. Use **bold** for key terms. Include actionable recommendations.'
  },
  summary: {
    description: 'Comprehensive summary of the video content. Use markdown: paragraphs, bullet lists, **bold** for key terms, ### for section headers. Break into sections for major topic shifts. 600-1000 words.'
  },
  context: {
    description: 'Extended background context. Who is the speaker? What broader conversation does this contribute to? Why is this relevant now? Who benefits most? 100-200 words.'
  }
};
