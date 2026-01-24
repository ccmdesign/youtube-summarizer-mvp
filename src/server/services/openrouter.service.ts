import type { SummaryInput } from '~/types/gemini';
import type { Tool } from '~/types/summary';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { normalizeText, normalizeSingleLine } from '~/server/utils/text-normalizer';
import { buildPromptForVideo, type SummaryResponse } from '~/server/prompts';

// OpenRouter free models ordered by preference
// Note: Model IDs updated January 2026 - `:free` suffix deprecated
export const OPENROUTER_FREE_MODELS = [
  'deepseek/deepseek-v3.2-20251201',
  'google/gemini-2.5-flash',
  'meta-llama/llama-3.1-8b-instruct',
  'google/gemini-2.0-flash-001'
] as const;

export type OpenRouterModel = typeof OPENROUTER_FREE_MODELS[number];

// Simple result type without metrics (AI service adds metrics)
export interface OpenRouterResult {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
  tools: Tool[];
  modelUsed: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate a summary using OpenRouter free models
   * Tries models in sequence until one succeeds
   */
  async generateSummary(
    input: SummaryInput,
    preferredModel?: OpenRouterModel
  ): Promise<OpenRouterResult> {
    const modelsToTry = preferredModel
      ? [preferredModel, ...OPENROUTER_FREE_MODELS.filter(m => m !== preferredModel)]
      : [...OPENROUTER_FREE_MODELS];

    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        logger.info(`Trying OpenRouter model: ${model}`, {
          videoId: input.metadata.videoId
        });

        const result = await this.callModel(model, input);
        return result;
      } catch (error) {
        lastError = error as Error;
        const isRecoverable = this.isRecoverableError(error);

        logger.warn(`OpenRouter model ${model} failed`, {
          videoId: input.metadata.videoId,
          error: lastError.message,
          isRecoverable
        });

        // Only try next model if it's a recoverable error
        if (!isRecoverable) {
          throw error;
        }
      }
    }

    throw new Error(`All OpenRouter models exhausted. Last error: ${lastError?.message}`);
  }

  private async callModel(
    model: OpenRouterModel,
    input: SummaryInput
  ): Promise<OpenRouterResult> {
    const { prompt, taxonomy } = buildPromptForVideo({
      metadata: input.metadata,
      transcript: input.transcript
    });

    logger.info(`Using ${taxonomy.length} prompt template (OpenRouter)`, {
      videoId: input.metadata.videoId
    });

    const systemPrompt = `You are a helpful assistant that summarizes YouTube videos.

CRITICAL FORMATTING: Never split words or proper nouns across lines.
Keep compound names intact: WhatsApp, McKinsey, LinkedIn, OpenAI, DevOps.
Each bullet point must be complete on a single line.

You MUST respond with valid JSON in this exact format:
{
  "tldr": "A single sentence (max 400 chars) capturing the main point",
  "keyTakeaways": "Markdown bullet points with the 2-4 key insights",
  "summary": "Detailed summary paragraphs with markdown formatting",
  "context": "Background context paragraph explaining why this matters",
  "tools": [{"name": "Tool Name", "url": "https://example.com or null"}]
}

For tools: Extract software tools, libraries, frameworks, services, APIs mentioned in the video.
Use canonical names (e.g., "Next.js" not "NextJS"). Include URL if mentioned, otherwise null.
Maximum 15 tools. Return empty array [] if no tools mentioned.

Do not include any text outside the JSON object.`;

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const result = await retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://youtube-summarizer.app',
          'X-Title': 'YouTube Summarizer'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
        (error as any).status = response.status;
        (error as any).body = errorBody;
        throw error;
      }

      const json = await response.json();

      // Check for error response from OpenRouter (can return 200 with error body)
      if (json.error) {
        logger.warn('OpenRouter returned error in response body', {
          videoId: input.metadata.videoId,
          model,
          errorMessage: json.error.message,
          errorCode: json.error.code,
          provider: json.error.metadata?.provider_name
        });
        const error = new Error(`OpenRouter provider error: ${json.error.message}`);
        (error as any).status = json.error.code || 502;
        (error as any).provider = json.error.metadata?.provider_name;
        throw error;
      }

      return json as OpenRouterResponse;
    }, {
      maxRetries: 1,
      baseDelay: 2000,
      onRetry: (error, attempt) => {
        logger.warn(`OpenRouter retry ${attempt}`, {
          model,
          videoId: input.metadata.videoId,
          error: error.message
        });
      }
    });

    // Validate response structure
    if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
      logger.error('Invalid OpenRouter response structure', {
        videoId: input.metadata.videoId,
        model,
        responseKeys: Object.keys(result)
      });
      const error = new Error('MALFORMED_OPENROUTER_RESPONSE: No choices in response');
      (error as any).status = 502;
      throw error;
    }

    const text = result.choices[0]?.message?.content;
    if (!text) {
      const error = new Error('MALFORMED_OPENROUTER_RESPONSE: Empty content');
      (error as any).status = 502;
      throw error;
    }

    const parsed = this.parseResponse(text);

    // Extract token usage
    const inputTokens = result.usage?.prompt_tokens;
    const outputTokens = result.usage?.completion_tokens;
    const totalTokens = result.usage?.total_tokens;

    logger.info(`Summary generated via OpenRouter`, {
      videoId: input.metadata.videoId,
      model: result.model,
      tldrLength: parsed.tldr.length,
      inputTokens,
      outputTokens,
      totalTokens
    });

    return {
      ...parsed,
      modelUsed: `openrouter/${result.model}`,
      inputTokens,
      outputTokens,
      totalTokens
    };
  }

  /**
   * Sanitize LLM output by removing repetitive garbage patterns.
   * Some models (especially DeepSeek) can get stuck in loops generating
   * repetitive sequences like "。 \n\n" hundreds of times.
   */
  private sanitizeResponse(text: string): string {
    // Limit response to reasonable length (50KB should be more than enough)
    const MAX_RESPONSE_LENGTH = 50000;
    let sanitized = text.slice(0, MAX_RESPONSE_LENGTH);

    // Detect and remove repetitive trailing patterns
    // Common patterns: "。 \n\n", "\n\n", repeated punctuation, etc.
    const repetitionPatterns = [
      /(\。\s*\n\n){3,}/g,           // Chinese period + newlines repeated
      /(\.\s*\n\n){5,}/g,            // Period + newlines repeated
      /(\n\n){10,}/g,                // Many consecutive blank lines
      /([。.!?]\s*){10,}$/,          // Trailing repeated punctuation
      /(.{1,20})\1{5,}/g,            // Any short sequence repeated 5+ times
    ];

    for (const pattern of repetitionPatterns) {
      const before = sanitized.length;
      sanitized = sanitized.replace(pattern, (match, group) => {
        // Keep a reasonable amount (2-3 occurrences max)
        return group.repeat ? group.repeat(2) : group + group;
      });
      if (sanitized.length < before) {
        logger.warn('Sanitized repetitive pattern from LLM response', {
          pattern: pattern.source,
          removedChars: before - sanitized.length
        });
      }
    }

    return sanitized.trim();
  }

  private parseResponse(text: string): { tldr: string; keyTakeaways: string; summary: string; context: string; tools: Tool[] } {
    try {
      // Sanitize response to remove repetitive garbage
      const sanitized = this.sanitizeResponse(text);

      // Try to extract JSON from the response (model might include extra text)
      const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed: SummaryResponse = JSON.parse(jsonMatch[0]);

      if (!parsed.tldr || !parsed.keyTakeaways || !parsed.summary || !parsed.context) {
        logger.error('Missing required fields in OpenRouter response', { parsed });
        throw new Error('MALFORMED_OPENROUTER_RESPONSE');
      }

      // Normalize tools array - ensure valid structure and limit to 15
      const tools: Tool[] = Array.isArray(parsed.tools)
        ? parsed.tools
            .filter((t): t is Tool => typeof t === 'object' && t !== null && typeof t.name === 'string')
            .map(t => ({ name: t.name, url: t.url ?? null }))
            .slice(0, 15)
        : [];

      // Normalize and clean each field using unified text normalizer
      return {
        tldr: normalizeSingleLine(parsed.tldr).slice(0, 400),
        keyTakeaways: normalizeText(parsed.keyTakeaways),
        summary: normalizeText(parsed.summary),
        context: normalizeText(parsed.context),
        tools
      };
    } catch (error) {
      logger.error('Failed to parse OpenRouter JSON response', { text, error });
      throw new Error('MALFORMED_OPENROUTER_RESPONSE');
    }
  }

  private isRecoverableError(error: unknown): boolean {
    if (error instanceof Error) {
      const status = (error as any).status;
      const message = error.message.toLowerCase();

      // Quota/rate limit errors
      const isQuotaError = (
        status === 429 ||
        status === 402 ||
        message.includes('rate limit') ||
        message.includes('quota') ||
        message.includes('exceeded') ||
        message.includes('too many requests')
      );

      // Malformed response errors (try next model)
      const isMalformedResponse = (
        status === 502 ||
        message.includes('malformed_openrouter_response')
      );

      return isQuotaError || isMalformedResponse;
    }
    return false;
  }
}

export function createOpenRouterService(apiKey: string): OpenRouterService {
  return new OpenRouterService(apiKey);
}
