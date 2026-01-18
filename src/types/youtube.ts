export interface PlaylistItem {
  videoId: string;
  title: string;
  position: number;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  channel: string;
  channelId: string;
  duration: string; // ISO 8601 format (e.g., "PT3M33S")
  publishedAt: string; // ISO 8601 timestamp
  thumbnailUrl: string;
}
