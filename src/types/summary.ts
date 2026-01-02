import type { VideoMetadata } from './youtube';
import type { SummaryOutput } from './gemini';

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
}
