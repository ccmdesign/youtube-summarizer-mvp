import { google } from 'googleapis';
import { getSubtitles } from 'youtube-caption-extractor';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PlaylistItem, VideoMetadata } from '~/types/youtube';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { youtubeApiLimiter } from '~/server/utils/rate-limiter';

const execAsync = promisify(exec);

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
   * Get transcript for a video using youtube-caption-extractor
   */
  private async getTranscriptFromCaptionExtractor(videoId: string): Promise<string> {
    const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });

    if (!subtitles || subtitles.length === 0) {
      throw new Error('No transcript segments found');
    }

    const transcript = subtitles
      .map(segment => segment.text)
      .filter(text => text.length > 0)
      .join(' ');

    if (!transcript) {
      throw new Error('Empty transcript');
    }

    return transcript;
  }

  /**
   * Get transcript for a video using yt-dlp (fallback method)
   */
  private async getTranscriptFromYtDlp(videoId: string): Promise<string> {
    const tempDir = tmpdir();
    const outputPath = join(tempDir, `${videoId}`);
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // Download subtitles using yt-dlp
      await execAsync(
        `yt-dlp --skip-download --write-auto-sub --sub-lang en --sub-format vtt --convert-subs srt -o "${outputPath}" "${url}"`,
        { timeout: 60000 }
      );

      // Read the subtitle file
      const srtPath = `${outputPath}.en.srt`;
      const srtContent = await readFile(srtPath, 'utf-8');

      // Parse SRT to extract text
      const transcript = srtContent
        .split('\n')
        .filter((line: string) => {
          // Skip empty lines, sequence numbers, and timestamps
          if (!line.trim()) return false;
          if (/^\d+$/.test(line.trim())) return false;
          if (/^\d{2}:\d{2}:\d{2}/.test(line.trim())) return false;
          return true;
        })
        .map((line: string) => line.replace(/<[^>]*>/g, '').trim()) // Remove HTML tags
        .filter((text: string) => text.length > 0)
        .join(' ');

      // Cleanup temp file
      await unlink(srtPath).catch(() => {});

      if (!transcript) {
        throw new Error('Empty transcript from yt-dlp');
      }

      return transcript;
    } catch (error) {
      // Cleanup any partial files
      await unlink(`${outputPath}.en.srt`).catch(() => {});
      await unlink(`${outputPath}.en.vtt`).catch(() => {});
      throw error;
    }
  }

  /**
   * Get transcript for a video
   * @throws Error with code 'TRANSCRIPT_UNAVAILABLE' if transcript cannot be fetched
   */
  async getTranscript(videoId: string): Promise<string> {
    // Try youtube-caption-extractor first
    try {
      const transcript = await this.getTranscriptFromCaptionExtractor(videoId);
      logger.info(`Fetched transcript for ${videoId} via caption-extractor`, {
        length: transcript.length
      });
      return transcript;
    } catch (extractorError) {
      logger.debug(`Caption extractor failed for ${videoId}, trying yt-dlp`, {
        error: extractorError instanceof Error ? extractorError.message : String(extractorError)
      });
    }

    // Fallback to yt-dlp
    try {
      const transcript = await this.getTranscriptFromYtDlp(videoId);
      logger.info(`Fetched transcript for ${videoId} via yt-dlp`, {
        length: transcript.length
      });
      return transcript;
    } catch (ytdlpError) {
      logger.warn(`Transcript unavailable for ${videoId}`, {
        error: ytdlpError instanceof Error ? ytdlpError.message : String(ytdlpError)
      });

      const transcriptError = new Error('TRANSCRIPT_UNAVAILABLE');
      transcriptError.cause = ytdlpError;
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
