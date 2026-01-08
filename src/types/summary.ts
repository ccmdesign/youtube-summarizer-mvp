import type { VideoMetadata } from './youtube';
import type { SummaryOutput } from './gemini';

// Re-export for convenience
export type { VideoMetadata } from './youtube';

export interface MarkdownInput {
  videoId: string;
  metadata: VideoMetadata;
  summary: SummaryOutput;
}

export interface MarkdownFrontmatter {
  title: string;
  videoId: string;
  channel: string;
  channelId: string;
  duration: string;
  publishedAt: string;
  processedAt: string;
  source: 'youtube';
  playlistId: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  modelUsed: string;
  tldr: string;
  // AI Processing Metrics
  aiProvider: string;
  apiCalls: number;
  fallbackAttempts: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  processingTimeMs: number;
}
