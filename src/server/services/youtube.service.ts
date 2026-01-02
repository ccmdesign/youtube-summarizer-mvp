import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import type { PlaylistItem, VideoMetadata } from '~/types/youtube';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { youtubeApiLimiter } from '~/server/utils/rate-limiter';

export class YouTubeService {
  private youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  /**
   * Fetch all videos from a playlist (with pagination)
   */
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined;

    do {
      await youtubeApiLimiter.acquire();

      const response = await retryWithBackoff(() =>
        this.youtube.playlistItems.list({
          part: ['snippet'],
          playlistId,
          maxResults: 50,
          pageToken
        })
      );

      if (!response.data.items) {
        break;
      }

      items.push(
        ...response.data.items.map(item => ({
          videoId: item.snippet!.resourceId!.videoId!,
          title: item.snippet!.title || 'Untitled',
          position: item.snippet!.position || 0
        }))
      );

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    logger.info(`Fetched ${items.length} videos from playlist ${playlistId}`);
    return items;
  }

  /**
   * Get metadata for a specific video
   */
  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    await youtubeApiLimiter.acquire();

    const response = await retryWithBackoff(() =>
      this.youtube.videos.list({
        part: ['snippet', 'contentDetails'],
        id: [videoId]
      })
    );

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error(`VIDEO_NOT_FOUND: ${videoId}`);
    }

    return {
      videoId,
      title: video.snippet!.title || 'Untitled',
      channel: video.snippet!.channelTitle || 'Unknown Channel',
      channelId: video.snippet!.channelId || '',
      duration: video.contentDetails!.duration || 'PT0S',
      publishedAt: video.snippet!.publishedAt || new Date().toISOString(),
      thumbnailUrl: video.snippet!.thumbnails?.high?.url || video.snippet!.thumbnails?.default?.url || ''
    };
  }

  /**
   * Get transcript for a video
   * @throws Error with code 'TRANSCRIPT_UNAVAILABLE' if transcript cannot be fetched
   */
  async getTranscript(videoId: string): Promise<string> {
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      const transcript = transcriptData.map(entry => entry.text).join(' ');

      logger.info(`Fetched transcript for ${videoId}`, {
        length: transcript.length,
        entries: transcriptData.length
      });

      return transcript;
    } catch (error) {
      logger.warn(`Transcript unavailable for ${videoId}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      const transcriptError = new Error('TRANSCRIPT_UNAVAILABLE');
      transcriptError.cause = error;
      throw transcriptError;
    }
  }
}

/**
 * Create YouTube service instance from config
 */
export function createYouTubeService(apiKey: string): YouTubeService {
  return new YouTubeService(apiKey);
}
