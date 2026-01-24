import type { VideoMetadata } from './youtube';
import type { SummaryOutput } from './gemini';
import type { LengthCategory } from '~/server/prompts/taxonomy';

// Re-export for convenience
export type { VideoMetadata } from './youtube';
export type { LengthCategory } from '~/server/prompts/taxonomy';

/**
 * Tool/resource extracted from video transcript and description
 */
export interface Tool {
  name: string;
  url: string | null;
}

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

/**
 * Video metadata from YouTube API
 * Stored under the 'metadata' key in frontmatter
 */
export interface FrontmatterMetadata {
  videoId: string;
  title: string;
  description?: string;
  channel: string;
  channelId: string;
  duration: string;
  publishedAt: string;
  thumbnailUrl: string;
  youtubeUrl: string;
}

/**
 * AI processing metrics
 * Stored under the 'ai' key in frontmatter
 */
export interface FrontmatterAiMetrics {
  provider: string;
  model: string;
  apiCalls: number;
  fallbackAttempts: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  processingTimeMs: number;
}

/**
 * Frontmatter structure for summary markdown files
 */
export interface MarkdownFrontmatter {
  // Video metadata from YouTube (nested)
  metadata: FrontmatterMetadata;
  // Processing info
  processedAt: string;
  source: 'youtube';
  // Playlist/category info
  playlistId?: string;
  playlistName?: string;
  category?: string;
  // AI-generated content
  tldr: string;
  // Extracted tools/resources
  tools: Tool[];
  // AI processing metrics (nested)
  ai: FrontmatterAiMetrics;
}
