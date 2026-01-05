import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { syncPlaylist } from '~/server/services/sync.service';
import fs from 'fs/promises';
import path from 'path';

describe('End-to-End Integration', () => {
  const testOutputDir = '.data/test-integration-summaries';

  beforeAll(() => {
    // Set up test environment variables
    process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'test-key';
    process.env.YOUTUBE_PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID || 'PLtest';
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';
    process.env.MAX_VIDEOS_PER_RUN = '2';
    process.env.OUTPUT_DIR = testOutputDir;
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(path.join(process.cwd(), testOutputDir), { recursive: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  });

  it('processes playlist end-to-end', async () => {
    // This test requires valid API keys to run
    // Skip if running in CI without credentials
    if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'test-key') {
      console.log('⏭️  Skipping integration test (no API credentials)');
      return;
    }

    const result = await syncPlaylist();

    expect(result).toBeDefined();
    expect(result.processed).toBeGreaterThanOrEqual(0);
    expect(result.skipped).toBeGreaterThanOrEqual(0);
    expect(result.failed).toBeGreaterThanOrEqual(0);

    // Verify markdown files were created
    if (result.processed > 0) {
      const files = await fs.readdir(path.join(process.cwd(), testOutputDir));
      expect(files.length).toBeGreaterThan(0);

      // Verify first file has correct structure
      const firstFile = files[0];
      const content = await fs.readFile(
        path.join(process.cwd(), testOutputDir, firstFile),
        'utf-8'
      );

      expect(content).toMatch(/^---/);
      expect(content).toContain('videoId:');
      expect(content).toContain('tldr:');
    }
  }, 60000); // 60 second timeout for API calls
});
