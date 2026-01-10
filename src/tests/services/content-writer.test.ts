import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentWriterService } from '~/server/services/content-writer.service';
import fs from 'fs/promises';
import path from 'path';

describe('ContentWriterService', () => {
  const testOutputDir = '.data/test-summaries';
  let service: ContentWriterService;

  beforeEach(() => {
    service = new ContentWriterService(testOutputDir);
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(path.join(process.cwd(), testOutputDir), { recursive: true });
    } catch {
      // Ignore errors if directory doesn't exist
    }
  });

  it('writes markdown file with frontmatter', async () => {
    const input = {
      videoId: 'test123',
      metadata: {
        videoId: 'test123',
        title: 'Test Video',
        channel: 'Test Channel',
        channelId: 'UC123',
        duration: 'PT10M30S',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://example.com/thumb.jpg'
      },
      summary: {
        tldr: 'This is a test TL;DR',
        summary: 'This is the detailed summary.',
        modelUsed: 'gemini-2.0-flash-exp',
        keyTakeaways: 'Test takeaways',
        context: 'Test context',
        metrics: {
          modelUsed: 'gemini-2.0-flash-exp',
          apiCalls: 1,
          fallbackAttempts: 0,
          processingTimeMs: 1000,
          provider: 'gemini'
        }
      }
    };

    const filePath = await service.writeMarkdown(input);

    expect(filePath).toContain('test123.md');

    const content = await fs.readFile(filePath, 'utf-8');

    expect(content).toMatch(/^---/);
    expect(content).toContain('title: "Test Video"');
    expect(content).toContain('videoId: "test123"');
    expect(content).toContain('tldr: "This is a test TL;DR"');
    expect(content).toContain('This is the detailed summary.');
    // TL;DR should be in frontmatter, not as heading
    expect(content).not.toContain('## TL;DR');
  });

  it('checks if file exists', async () => {
    const input = {
      videoId: 'test456',
      metadata: {
        videoId: 'test456',
        title: 'Test',
        channel: 'Test',
        channelId: 'UC123',
        duration: 'PT1M',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: ''
      },
      summary: {
        tldr: 'Test',
        summary: 'Test summary',
        modelUsed: 'gemini-2.0-flash-exp',
        keyTakeaways: 'Test takeaways',
        context: 'Test context',
        metrics: {
          modelUsed: 'gemini-2.0-flash-exp',
          apiCalls: 1,
          fallbackAttempts: 0,
          processingTimeMs: 500,
          provider: 'gemini'
        }
      }
    };

    expect(await service.exists('test456')).toBe(false);

    await service.writeMarkdown(input);

    expect(await service.exists('test456')).toBe(true);
  });

  it('escapes special characters in YAML', async () => {
    const input = {
      videoId: 'test789',
      metadata: {
        videoId: 'test789',
        title: 'Test "Quotes" and \\Backslashes\\',
        channel: 'Channel: Special & Characters',
        channelId: 'UC123',
        duration: 'PT1M',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: ''
      },
      summary: {
        tldr: 'Test',
        summary: 'Test',
        modelUsed: 'gemini-2.0-flash-exp',
        keyTakeaways: 'Test takeaways',
        context: 'Test context',
        metrics: {
          modelUsed: 'gemini-2.0-flash-exp',
          apiCalls: 1,
          fallbackAttempts: 0,
          processingTimeMs: 300,
          provider: 'gemini'
        }
      }
    };

    const filePath = await service.writeMarkdown(input);
    const content = await fs.readFile(filePath, 'utf-8');

    expect(content).toContain('\\"Quotes\\"');
  });
});
