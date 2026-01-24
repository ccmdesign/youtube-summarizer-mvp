import type { VideoMetadata } from './youtube';
import type { Tool } from './summary';

export interface SummaryInput {
  metadata: VideoMetadata;
  transcript?: string;
  mode: 'transcript' | 'native-video';
}

export interface SummaryMetrics {
  modelUsed: string;
  apiCalls: number;           // Total API calls (including retries/fallbacks)
  fallbackAttempts: number;   // Number of fallback model attempts
  inputTokens?: number;       // Tokens in prompt
  outputTokens?: number;      // Tokens in response
  totalTokens?: number;       // Total tokens used
  processingTimeMs: number;   // Time to generate summary
  provider: 'gemini' | 'openrouter';
}

export interface SummaryOutput {
  tldr: string;
  keyTakeaways: string;
  summary: string;
  context: string;
  tools: Tool[];
  modelUsed: string;
  metrics: SummaryMetrics;
}
