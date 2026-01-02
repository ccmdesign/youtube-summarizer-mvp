import type { VideoMetadata } from './youtube';

export interface SummaryInput {
  metadata: VideoMetadata;
  transcript?: string;
  mode: 'transcript' | 'native-video';
}

export interface SummaryOutput {
  tldr: string;
  summary: string;
  modelUsed: string;
}

export interface GeminiResponse {
  text: string;
}
