import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '~/server/services/gemini.service';
import type { SummaryInput } from '~/types/gemini';

// Mock the Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn()
    }))
  })),
  SchemaType: {
    OBJECT: 'object',
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN: 'boolean',
    ARRAY: 'array'
  }
}));

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService('test-api-key', 'gemini-2.0-flash-exp');
  });

  describe('generateSummary', () => {
    it('generates summary in transcript mode', async () => {
      const mockJsonResponse = JSON.stringify({
        tldr: 'This is the key takeaway',
        keyTakeaways: 'Key point 1, Key point 2',
        summary: 'This is the detailed summary content with insights and takeaways.',
        context: 'This is the context.'
      });

      const mockResponse = {
        response: {
          text: () => mockJsonResponse
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
