import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { SummaryInput, SummaryOutput } from '~/types/gemini';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { geminiFlashLimiter, geminiProLimiter } from '~/server/utils/rate-limiter';
import { buildSummaryPrompt, summaryResponseSchema, type SummaryResponse } from '~/server/prompts';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  /**
   * Generate a summary for a video
   */
  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    const limiter = this.modelName.includes('pro') ? geminiProLimiter : geminiFlashLimiter;
    await limiter.acquire();

    const prompt = this.buildPrompt(input);

    logger.info(`Generating summary for ${input.metadata.videoId}`, {
      mode: input.mode,
      model: this.modelName
    });

    const result = await retryWithBackoff(async () => {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
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
        // Native video mode: pass YouTube URL to Gemini
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
        // Transcript mode: pass text transcript
        return await model.generateContent(prompt);
      }
    }, {
      maxRetries: 2,
      baseDelay: 2000,
      onRetry: (error, attempt) => {
        logger.warn(`Gemini API retry ${attempt}`, {
          videoId: input.metadata.videoId,
          error: error.message
        });
      }
    });

    const text = result.response.text();
    const parsed = this.parseResponse(text);

    logger.info(`Summary generated for ${input.metadata.videoId}`, {
      tldrLength: parsed.tldr.length,
      keyTakeawaysLength: parsed.keyTakeaways.length,
      summaryLength: parsed.summary.length,
      contextLength: parsed.context.length
    });

    return {
      ...parsed,
      modelUsed: this.modelName
    };
  }

  /**
   * Build the prompt for Gemini
   */
  private buildPrompt(input: SummaryInput): string {
    return buildSummaryPrompt({
      metadata: input.metadata,
      transcript: input.transcript
    });
  }

  /**
   * Parse Gemini's structured JSON response
   */
  private parseResponse(text: string): { tldr: string; keyTakeaways: string; summary: string; context: string } {
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
}

/**
 * Create Gemini service instance from config
 */
export function createGeminiService(apiKey: string, modelName: string): GeminiService {
  return new GeminiService(apiKey, modelName);
}
