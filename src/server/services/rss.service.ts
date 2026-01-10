import { XMLParser } from 'fast-xml-parser';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';

const RSS_BASE_URL = 'https://www.youtube.com/feeds/videos.xml';

/**
 * Video entry from YouTube RSS feed
 */
export interface RssVideoEntry {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  publishedAt: Date;
  thumbnailUrl: string;
}

/**
 * Service for fetching YouTube channel RSS feeds
 */
export class RssService {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
  }

  /**
   * Fetch videos from a channel's RSS feed
   */
  async getChannelVideos(channelId: string): Promise<RssVideoEntry[]> {
    const url = `${RSS_BASE_URL}?channel_id=${channelId}`;

    logger.info('Fetching RSS feed', { channelId, url });

    try {
      const response = await retryWithBackoff(
        () => fetch(url, {
          headers: {
            'User-Agent': 'YouTube-Summarizer/1.0'
          }
        }),
        3,  // max retries
        1000 // initial delay
      );

      if (!response.ok) {
        throw new Error(`RSS fetch failed with status ${response.status}`);
      }

      const xml = await response.text();
      const parsed = this.parser.parse(xml);

      // Handle case where feed has no entries
      if (!parsed.feed || !parsed.feed.entry) {
        logger.info('No videos found in RSS feed', { channelId });
        return [];
      }

      // Ensure entries is always an array (single entry comes as object)
      const entries = Array.isArray(parsed.feed.entry)
        ? parsed.feed.entry
        : [parsed.feed.entry];

      const videos = this.parseEntries(entries);

      logger.info('Fetched RSS feed successfully', {
        channelId,
        videoCount: videos.length
      });

      return videos;
    } catch (error) {
      logger.error('Failed to fetch RSS feed', {
        channelId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Parse RSS feed entries into structured video data
   */
  private parseEntries(entries: unknown[]): RssVideoEntry[] {
    return entries.map((entry: any) => {
      // Extract video ID from yt:videoId element
      const videoId = entry['yt:videoId'];

      // Extract channel info
      const channelId = entry['yt:channelId'];
      const channelName = entry.author?.name || 'Unknown Channel';

      // Extract title
      const title = entry.title || 'Untitled';

      // Extract publish date
      const publishedAt = new Date(entry.published);

      // Extract thumbnail URL from media:group
      let thumbnailUrl = '';
      if (entry['media:group']?.['media:thumbnail']) {
        const thumbnail = entry['media:group']['media:thumbnail'];
        thumbnailUrl = thumbnail['@_url'] || '';
      }

      return {
        videoId,
        title,
        channelId,
        channelName,
        publishedAt,
        thumbnailUrl
      };
    }).filter((video): video is RssVideoEntry => {
      // Filter out invalid entries
      return !!video.videoId && !!video.channelId;
    });
  }
}

/**
 * Create RSS service instance
 */
export function createRssService(): RssService {
  return new RssService();
}
