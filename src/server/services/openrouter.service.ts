import type { SummaryInput } from '~/types/gemini';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { buildPromptForVideo, type SummaryResponse } from '~/server/prompts';

// OpenRouter free models ordered by preference
export const OPENROUTER_FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-r1-0528:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free'
] as const;

export type OpenRouterModel = typeof OPENROUTER_FREE_MODELS[number];

// Simple result type without metrics (AI service adds metrics)
export interface OpenRouterResult {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
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
        const isQuotaError = this.isQuotaExceeded(error);

        logger.warn(`OpenRouter model ${model} failed`, {
          videoId: input.metadata.videoId,
          error: lastError.message,
          isQuotaError
        });

        // Only try next model if it's a quota error
        if (!isQuotaError) {
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
You MUST respond with valid JSON in this exact format:
{
  "tldr": "A single sentence (max 400 chars) capturing the main point",
  "keyTakeaways": "Markdown bullet points with the 2-4 key insights",
  "summary": "Detailed summary paragraphs with markdown formatting",
  "context": "Background context paragraph explaining why this matters"
}
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

      return response.json() as Promise<OpenRouterResponse>;
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

    const text = result.choices[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from OpenRouter');
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

  private parseResponse(text: string): { tldr: string; keyTakeaways: string; summary: string; context: string } {
    try {
      // Try to extract JSON from the response (model might include extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed: SummaryResponse = JSON.parse(jsonMatch[0]);

      if (!parsed.tldr || !parsed.keyTakeaways || !parsed.summary || !parsed.context) {
        logger.error('Missing required fields in OpenRouter response', { parsed });
        throw new Error('MALFORMED_OPENROUTER_RESPONSE');
      }

      // Normalize literal \n to actual newlines
      const normalize = (s: string) => s.replace(/\\n/g, '\n');

      return {
        tldr: parsed.tldr.slice(0, 400),
        keyTakeaways: normalize(parsed.keyTakeaways),
        summary: normalize(parsed.summary),
        context: normalize(parsed.context)
      };
    } catch (error) {
      logger.error('Failed to parse OpenRouter JSON response', { text, error });
      throw new Error('MALFORMED_OPENROUTER_RESPONSE');
    }
  }

  private isQuotaExceeded(error: unknown): boolean {
    if (error instanceof Error) {
      const status = (error as any).status;
      const message = error.message.toLowerCase();

      return (
        status === 429 ||
        status === 402 ||
        message.includes('rate limit') ||
        message.includes('quota') ||
        message.includes('exceeded') ||
        message.includes('too many requests')
      );
    }
    return false;
  }
}

export function createOpenRouterService(apiKey: string): OpenRouterService {
  return new OpenRouterService(apiKey);
}
