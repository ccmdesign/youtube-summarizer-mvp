import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { SummaryInput, SummaryOutput, SummaryMetrics } from '~/types/gemini';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { geminiFlashLimiter, geminiProLimiter } from '~/server/utils/rate-limiter';
import { buildPromptForVideo, summaryResponseSchema, type SummaryResponse } from '~/server/prompts';
import { createOpenRouterService, OPENROUTER_FREE_MODELS } from './openrouter.service';

// Gemini models fallback ladder (best to most available)
// Model IDs from: https://ai.google.dev/gemini-api/docs/models
const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-pro',     // Best quality, 5 RPM free tier
  'gemini-2.5-flash',   // Good balance, 10 RPM free tier
  'gemini-2.0-flash'    // Most available, 15 RPM free tier
] as const;

// Delay between model attempts to avoid burning rate limits (ms)
const MODEL_ATTEMPT_DELAY = 2000;

// Internal result type with token usage
interface GeminiResult {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface AIServiceConfig {
  geminiApiKey: string;
  primaryModel: string;
  openRouterApiKey?: string;
  enableFallback?: boolean;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private primaryModel: string;
  private openRouterApiKey?: string;
  private enableFallback: boolean;

  constructor(config: AIServiceConfig) {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.primaryModel = config.primaryModel;
    this.openRouterApiKey = config.openRouterApiKey;
    this.enableFallback = config.enableFallback ?? true;
  }

  /**
   * Generate a summary with automatic fallback on quota exhaustion
   * Fallback chain: Primary Model → Gemini Fallbacks → OpenRouter Free Models
   */
  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    const startTime = Date.now();
    const modelsToTry = this.buildFallbackChain();
    let lastError: Error | null = null;
    let apiCalls = 0;
    let fallbackAttempts = 0;

    // Try Gemini models first
    for (const modelName of modelsToTry) {
      try {
        logger.info(`Attempting Gemini model: ${modelName}`, {
          videoId: input.metadata.videoId,
          mode: input.mode,
          attempt: fallbackAttempts + 1
        });

        apiCalls++;
        const result = await this.callGemini(modelName, input);

        const metrics: SummaryMetrics = {
          modelUsed: modelName,
          apiCalls,
          fallbackAttempts,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          processingTimeMs: Date.now() - startTime,
          provider: 'gemini'
        };

        logger.info(`Summary generated with metrics`, {
          videoId: input.metadata.videoId,
          ...metrics
        });

        return {
          tldr: result.tldr,
          keyTakeaways: result.keyTakeaways,
          summary: result.summary,
          context: result.context,
          modelUsed: modelName,
          metrics
        };
      } catch (error) {
        lastError = error as Error;
        fallbackAttempts++;
        const isRecoverableError = this.isRecoverableGeminiError(error);

        logger.warn(`Gemini model ${modelName} failed`, {
          videoId: input.metadata.videoId,
          error: lastError.message,
          isRecoverableError,
          willFallback: isRecoverableError && this.enableFallback,
          apiCalls,
          fallbackAttempts
        });

        if (!isRecoverableError || !this.enableFallback) {
          throw error;
        }

        logger.info(`Waiting ${MODEL_ATTEMPT_DELAY}ms before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, MODEL_ATTEMPT_DELAY));
      }
    }

    // If all Gemini models failed with recoverable errors, try OpenRouter
    if (this.openRouterApiKey && this.enableFallback) {
      logger.info('All Gemini models exhausted, falling back to OpenRouter', {
        videoId: input.metadata.videoId,
        apiCalls,
        fallbackAttempts
      });

      try {
        apiCalls++;
        const openRouterService = createOpenRouterService(this.openRouterApiKey);
        const result = await openRouterService.generateSummary(input);

        // Add metrics from OpenRouter call
        const metrics: SummaryMetrics = {
          modelUsed: result.modelUsed,
          apiCalls,
          fallbackAttempts,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          processingTimeMs: Date.now() - startTime,
          provider: 'openrouter'
        };

        return {
          tldr: result.tldr,
          keyTakeaways: result.keyTakeaways,
          summary: result.summary,
          context: result.context,
          modelUsed: result.modelUsed,
          metrics
        };
      } catch (error) {
        logger.error('OpenRouter fallback also failed', {
          videoId: input.metadata.videoId,
          error: (error as Error).message,
          apiCalls,
          fallbackAttempts
        });
        throw error;
      }
    }

    throw new Error(
      `All AI models exhausted after ${apiCalls} API calls and ${fallbackAttempts} fallback attempts. ` +
      `Last error: ${lastError?.message}. Configure OPEN_ROUTER_API_KEY for additional fallback options.`
    );
  }

  private buildFallbackChain(): string[] {
    const chain: string[] = [this.primaryModel];

    if (this.enableFallback) {
      // Add Gemini fallback models that aren't the primary
      for (const model of GEMINI_FALLBACK_MODELS) {
        if (!chain.includes(model)) {
          chain.push(model);
        }
      }
    }

    return chain;
  }

  private async callGemini(modelName: string, input: SummaryInput): Promise<GeminiResult> {
    // Use appropriate rate limiter based on model
    const limiter = modelName.includes('pro') ? geminiProLimiter : geminiFlashLimiter;
    await limiter.acquire();

    const { prompt, taxonomy } = buildPromptForVideo({
      metadata: input.metadata,
      transcript: input.transcript
    });

    logger.info(`Using ${taxonomy.length} prompt template`, {
      videoId: input.metadata.videoId,
      duration: input.metadata.duration
    });

    const result = await retryWithBackoff(async () => {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: summaryResponseSchema.properties,
            required: summaryResponseSchema.required
          }
        }
      });

      if (input.mode === 'native-video') {
        return await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'video/youtube' as any,
              data: `https://www.youtube.com/watch?v=${input.metadata.videoId}`
            }
          }
        ]);
      } else {
        return await model.generateContent(prompt);
      }
    }, {
      maxRetries: 1, // Fewer retries since we have fallback
      baseDelay: 2000,
      onRetry: (error, attempt) => {
        logger.warn(`Gemini API retry ${attempt}`, {
          videoId: input.metadata.videoId,
          model: modelName,
          error: error.message
        });
      }
    });

    const text = result.response.text();
    const parsed = this.parseGeminiResponse(text);

    // Extract token usage from response metadata
    const usageMetadata = result.response.usageMetadata;
    const inputTokens = usageMetadata?.promptTokenCount;
    const outputTokens = usageMetadata?.candidatesTokenCount;
    const totalTokens = usageMetadata?.totalTokenCount;

    logger.info(`Summary generated via Gemini`, {
      videoId: input.metadata.videoId,
      model: modelName,
      tldrLength: parsed.tldr.length,
      inputTokens,
      outputTokens,
      totalTokens
    });

    return {
      ...parsed,
      inputTokens,
      outputTokens,
      totalTokens
    };
  }

  private parseGeminiResponse(text: string): { tldr: string; keyTakeaways: string; summary: string; context: string } {
    try {
      const parsed: SummaryResponse = JSON.parse(text);

      if (!parsed.tldr || !parsed.keyTakeaways || !parsed.summary || !parsed.context) {
        logger.error('Missing required fields in Gemini response', { parsed });
        throw new Error('MALFORMED_GEMINI_RESPONSE');
      }

      // Gemini sometimes returns literal \n instead of actual newlines
      const normalize = (s: string) => s.replace(/\\n/g, '\n');

      return {
        tldr: parsed.tldr.slice(0, 400),
        keyTakeaways: normalize(parsed.keyTakeaways),
        summary: normalize(parsed.summary),
        context: normalize(parsed.context)
      };
    } catch (error) {
      logger.error('Failed to parse Gemini JSON response', { text, error });
      throw new Error('MALFORMED_GEMINI_RESPONSE');
    }
  }

  /**
   * Check if error is recoverable (should try next model in fallback chain)
   * Recoverable errors: quota exceeded (429), model not found (404)
   */
  private isRecoverableGeminiError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Quota exceeded errors
      const isQuotaError = (
        message.includes('429') ||
        message.includes('resource exhausted') ||
        message.includes('quota') ||
        message.includes('rate limit') ||
        message.includes('too many requests') ||
        message.includes('exceeded')
      );

      // Model not found errors (deprecated or invalid model)
      const isModelNotFound = (
        message.includes('404') ||
        message.includes('not found') ||
        message.includes('not supported')
      );

      return isQuotaError || isModelNotFound;
    }
    return false;
  }

  /**
   * Get available models info for diagnostics
   */
  getAvailableModels(): { gemini: string[]; openRouter: string[] } {
    return {
      gemini: this.buildFallbackChain(),
      openRouter: this.openRouterApiKey ? [...OPENROUTER_FREE_MODELS] : []
    };
  }
}

/**
 * Create AI service with fallback capability
 */
export function createAIService(config: AIServiceConfig): AIService {
  return new AIService(config);
}
