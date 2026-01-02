import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SummaryInput, SummaryOutput } from '~/types/gemini';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { geminiFlashLimiter, geminiProLimiter } from '~/server/utils/rate-limiter';

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
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

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
      summaryLength: parsed.summary.length
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
    const { metadata, transcript } = input;

    return `You are summarizing a YouTube video for a personal knowledge base.

Video Title: ${metadata.title}
Channel: ${metadata.channel}
Duration: ${metadata.duration}
Published: ${metadata.publishedAt}

${transcript ? `Transcript:\n${transcript}\n\n` : ''}

Provide:
1. KEY TAKEAWAY: The single most important insight or actionable lesson from this video (max 200 characters, no quotes). This should be the one thing someone should remember if they only read this line.
2. A comprehensive summary (up to 1000 words, but shorter if the content is simple)

Focus on:
- Key insights and main arguments
- Actionable takeaways
- Notable quotes or statistics (paraphrased)

Do not include filler. Be direct and information-dense.

Respond in this exact format:
KEY TAKEAWAY: [the single most important insight or lesson]

SUMMARY:
[your summary here]`;
  }

  /**
   * Parse Gemini's response into structured data
   */
  private parseResponse(text: string): { tldr: string; summary: string } {
    // Match KEY TAKEAWAY (anything before SUMMARY:)
    const takeawayMatch = text.match(/KEY TAKEAWAY:\s*(.+?)(?=\n\n|SUMMARY:)/s);

    // Match SUMMARY (everything after SUMMARY:)
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/s);

    if (!takeawayMatch || !summaryMatch) {
      logger.error('Malformed Gemini response', { text });
      throw new Error('MALFORMED_GEMINI_RESPONSE');
    }

    return {
      tldr: takeawayMatch[1].trim().slice(0, 200),
      summary: summaryMatch[1].trim()
    };
  }
}

/**
 * Create Gemini service instance from config
 */
export function createGeminiService(apiKey: string, modelName: string): GeminiService {
  return new GeminiService(apiKey, modelName);
}
