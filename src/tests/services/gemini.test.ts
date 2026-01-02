import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '~/server/services/gemini.service';
import type { SummaryInput } from '~/types/gemini';

// Mock the Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn()
    }))
  }))
}));

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService('test-api-key', 'gemini-2.0-flash-exp');
  });

  describe('generateSummary', () => {
    it('generates summary in transcript mode', async () => {
      const mockResponse = {
        response: {
          text: () => `KEY TAKEAWAY: This is the key takeaway

SUMMARY:
This is the detailed summary content with insights and takeaways.`
        }
      };

      const genAI = (service as any).genAI;
      const mockGetModel = vi.fn(() => ({
        generateContent: vi.fn().mockResolvedValue(mockResponse)
      }));
      genAI.getGenerativeModel = mockGetModel;

      const input: SummaryInput = {
        metadata: {
          videoId: 'test123',
          title: 'Test Video',
          channel: 'Test Channel',
          channelId: 'UC123',
          duration: 'PT10M',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnailUrl: 'https://example.com/thumb.jpg'
        },
        transcript: 'This is the video transcript',
        mode: 'transcript'
      };

      const result = await service.generateSummary(input);

      expect(result.tldr).toBe('This is the key takeaway');
      expect(result.summary).toContain('detailed summary content');
      expect(result.modelUsed).toBe('gemini-2.0-flash-exp');
    });

    it('throws error on malformed response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid response without proper format'
        }
      };

      const genAI = (service as any).genAI;
      const mockGetModel = vi.fn(() => ({
        generateContent: vi.fn().mockResolvedValue(mockResponse)
      }));
      genAI.getGenerativeModel = mockGetModel;

      const input: SummaryInput = {
        metadata: {
          videoId: 'test123',
          title: 'Test',
          channel: 'Test',
          channelId: 'UC123',
          duration: 'PT10M',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnailUrl: ''
        },
        mode: 'transcript'
      };

      await expect(service.generateSummary(input)).rejects.toThrow('MALFORMED_GEMINI_RESPONSE');
    });
  });
});
