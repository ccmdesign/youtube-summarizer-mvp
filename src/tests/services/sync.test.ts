import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncPlaylist } from '~/server/services/sync.service';

// Mock all dependencies
vi.mock('~/server/utils/config', () => ({
  loadConfig: vi.fn(() => ({
    youtubeApiKey: 'test-key',
    youtubePlaylistId: 'PLtest',
    geminiApiKey: 'test-gemini-key',
    geminiModel: 'gemini-2.0-flash-exp',
    processingMode: 'transcript',
    maxVideosPerRun: 5,
    enableProFallback: false,
    databasePath: '.data/test.db',
    outputDir: '.data/test-summaries'
  }))
}));

vi.mock('~/server/db/client', () => ({
  db: {
    getCompletedVideos: vi.fn(() => []),
    recordProcessing: vi.fn(),
    logError: vi.fn()
  }
}));

vi.mock('~/server/services/youtube.service', () => ({
  createYouTubeService: vi.fn(() => ({
    getPlaylistItems: vi.fn(() => Promise.resolve([])),
    getVideoMetadata: vi.fn(),
    getTranscript: vi.fn()
  }))
}));

vi.mock('~/server/services/gemini.service', () => ({
  createGeminiService: vi.fn(() => ({
    generateSummary: vi.fn()
  }))
}));

vi.mock('~/server/services/content-writer.service', () => ({
  createContentWriterService: vi.fn(() => ({
    writeMarkdown: vi.fn()
  }))
}));

describe('syncPlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sync results', async () => {
    const result = await syncPlaylist();

    expect(result).toHaveProperty('processed');
    expect(result).toHaveProperty('skipped');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('errors');

    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('handles empty playlist', async () => {
    const result = await syncPlaylist();

    expect(result.processed).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.failed).toBe(0);
  });
});
