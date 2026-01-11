import type { VideoMetadata } from './youtube';
import type { SummaryOutput } from './gemini';
import type { LengthCategory } from '~/server/prompts/taxonomy';

// Re-export for convenience
export type { VideoMetadata } from './youtube';
export type { LengthCategory } from '~/server/prompts/taxonomy';

export interface PlaylistMetadata {
  playlistId: string;
  playlistName?: string;
  category?: string;
}

export interface MarkdownInput {
  videoId: string;
  metadata: VideoMetadata;
  summary: SummaryOutput;
  lengthCategory?: LengthCategory;
  playlist?: PlaylistMetadata;
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
  playlistName?: string;
  category?: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  modelUsed: string;
  tldr: string;
  // Video Taxonomy
  lengthCategory?: LengthCategory;
  // AI Processing Metrics
  aiProvider: string;
  apiCalls: number;
  fallbackAttempts: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  processingTimeMs: number;
}
