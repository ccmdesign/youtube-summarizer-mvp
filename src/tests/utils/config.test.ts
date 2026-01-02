import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '~/server/utils/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      YOUTUBE_API_KEY: 'test-youtube-key',
      YOUTUBE_PLAYLIST_ID: 'PLtest1234567890abcdef',
      GEMINI_API_KEY: 'test-gemini-key',
      GEMINI_MODEL: 'gemini-2.0-flash-exp',
      PROCESSING_MODE: 'transcript',
      MAX_VIDEOS_PER_RUN: '10',
      ENABLE_PRO_FALLBACK: 'false'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads valid configuration', () => {
    const config = loadConfig();

    expect(config.youtubeApiKey).toBe('test-youtube-key');
    expect(config.geminiModel).toBe('gemini-2.0-flash-exp');
    expect(config.maxVideosPerRun).toBe(10);
  });

  it('throws error for missing required fields', () => {
    delete process.env.YOUTUBE_API_KEY;

    expect(() => loadConfig()).toThrow('Configuration validation failed');
  });

  it('validates playlist ID format', () => {
    process.env.YOUTUBE_PLAYLIST_ID = 'invalid-id';

    expect(() => loadConfig()).toThrow('Invalid YouTube playlist ID format');
  });

  it('uses defaults for optional fields', () => {
    delete process.env.GEMINI_MODEL;
    delete process.env.MAX_VIDEOS_PER_RUN;

    const config = loadConfig();
    expect(config.geminiModel).toBe('gemini-2.0-flash-exp');
    expect(config.maxVideosPerRun).toBe(10);
  });
});
