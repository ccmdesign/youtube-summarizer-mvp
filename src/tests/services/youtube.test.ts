import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeService } from '~/server/services/youtube.service';

// Mock the dependencies
vi.mock('googleapis', () => ({
  google: {
    youtube: vi.fn(() => ({
      playlistItems: {
        list: vi.fn()
      },
      videos: {
        list: vi.fn()
      }
    }))
  }
}));

vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn()
  }
}));

describe('YouTubeService', () => {
  let service: YouTubeService;

  beforeEach(() => {
    service = new YouTubeService('test-api-key');
  });

  describe('getPlaylistItems', () => {
    it('fetches playlist items successfully', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              snippet: {
                resourceId: { videoId: 'abc123' },
                title: 'Test Video',
                position: 0
              }
            }
          ],
          nextPageToken: null
        }
      };

      vi.spyOn(service['youtube'].playlistItems, 'list').mockResolvedValue(mockResponse);

      const items = await service.getPlaylistItems('PLtest');

      expect(items).toHaveLength(1);
      expect(items[0].videoId).toBe('abc123');
      expect(items[0].title).toBe('Test Video');
    });

    it('handles pagination', async () => {
      const page1 = {
        data: {
          items: [{ snippet: { resourceId: { videoId: 'video1' }, title: 'V1', position: 0 } }],
          nextPageToken: 'token123'
        }
      };

      const page2 = {
        data: {
          items: [{ snippet: { resourceId: { videoId: 'video2' }, title: 'V2', position: 1 } }],
          nextPageToken: null
        }
      };

      vi.spyOn(service['youtube'].playlistItems, 'list')
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const items = await service.getPlaylistItems('PLtest');

      expect(items).toHaveLength(2);
      expect(items[0].videoId).toBe('video1');
      expect(items[1].videoId).toBe('video2');
    });
  });

  describe('getVideoMetadata', () => {
    it('fetches video metadata successfully', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              snippet: {
                title: 'Test Video',
                channelTitle: 'Test Channel',
                channelId: 'UC123',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: {
                  high: { url: 'https://example.com/thumb.jpg' }
                }
              },
              contentDetails: {
                duration: 'PT10M30S'
              }
            }
          ]
        }
      };

      vi.spyOn(service['youtube'].videos, 'list').mockResolvedValue(mockResponse);

      const metadata = await service.getVideoMetadata('abc123');

      expect(metadata.videoId).toBe('abc123');
      expect(metadata.title).toBe('Test Video');
      expect(metadata.channel).toBe('Test Channel');
      expect(metadata.duration).toBe('PT10M30S');
    });

    it('throws error when video not found', async () => {
      const mockResponse = {
        data: {
          items: []
        }
      };

      vi.spyOn(service['youtube'].videos, 'list').mockResolvedValue(mockResponse);

      await expect(service.getVideoMetadata('nonexistent')).rejects.toThrow('VIDEO_NOT_FOUND');
    });
  });
});
