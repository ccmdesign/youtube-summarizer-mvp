#!/usr/bin/env tsx
/**
 * Backfill script: Fetch descriptions and transcripts for existing videos
 *
 * This script goes through all migrated video folders and:
 * 1. Fetches the video description from YouTube API
 * 2. Fetches the transcript with timestamps
 * 3. Updates metadata.yml with the description
 * 4. Creates transcript.json if not present
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import { config as dotenvConfig } from 'dotenv';
import { createYouTubeService } from '../src/server/services/youtube.service';

// Load environment variables
dotenvConfig();

const SUMMARIES_DIR = 'src/content/summaries';
const DELAY_BETWEEN_VIDEOS = 500; // 500ms delay to respect rate limits

interface BackfillResult {
  total: number;
  updatedDescription: number;
  addedTranscript: number;
  skippedDescription: number;
  skippedTranscript: number;
  errors: string[];
}

interface BackfillOptions {
  skipExistingDescription?: boolean;
  skipExistingTranscript?: boolean;
  limit?: number;
  videoIds?: string[];
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function backfill(options: BackfillOptions = {}): Promise<BackfillResult> {
  const {
    skipExistingDescription = true,
    skipExistingTranscript = true,
    limit,
    videoIds
  } = options;

  const result: BackfillResult = {
    total: 0,
    updatedDescription: 0,
    addedTranscript: 0,
    skippedDescription: 0,
    skippedTranscript: 0,
    errors: []
  };

  // Check for API key
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('ERROR: YOUTUBE_API_KEY environment variable not set');
    process.exit(1);
  }

  const youtubeService = createYouTubeService(apiKey);
  const summariesPath = path.join(process.cwd(), SUMMARIES_DIR);

  // Get list of video directories
  const entries = await fs.readdir(summariesPath, { withFileTypes: true });
  let videoDirs = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name);

  // Filter by specific videoIds if provided
  if (videoIds && videoIds.length > 0) {
    videoDirs = videoDirs.filter(id => videoIds.includes(id));
  }

  // Apply limit if provided
  if (limit && limit > 0) {
    videoDirs = videoDirs.slice(0, limit);
  }

  result.total = videoDirs.length;
  console.log(`Found ${videoDirs.length} video directories to process\n`);

  for (let i = 0; i < videoDirs.length; i++) {
    const videoId = videoDirs[i];
    const videoDir = path.join(summariesPath, videoId);
    const metadataPath = path.join(videoDir, 'metadata.yml');
    const transcriptPath = path.join(videoDir, 'transcript.json');

    console.log(`[${i + 1}/${videoDirs.length}] Processing ${videoId}...`);

    try {
      // Check if metadata.yml exists
      let metadata: Record<string, unknown> = {};
      try {
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        metadata = YAML.parse(metadataContent) || {};
      } catch {
        console.log(`  ⚠ No metadata.yml found, creating new one`);
      }

      // Check if we need to fetch description
      const hasDescription = metadata.description && (metadata.description as string).length > 0;
      const needsDescription = !skipExistingDescription || !hasDescription;

      // Check if we need to fetch transcript
      let hasTranscript = false;
      try {
        await fs.access(transcriptPath);
        hasTranscript = true;
      } catch {
        // File doesn't exist
      }
      const needsTranscript = !skipExistingTranscript || !hasTranscript;

      // Skip if nothing needs to be done
      if (!needsDescription && !needsTranscript) {
        console.log(`  ⏭ Skipping (already has description and transcript)`);
        result.skippedDescription++;
        result.skippedTranscript++;
        continue;
      }

      // Fetch from YouTube API
      let description = '';
      if (needsDescription) {
        try {
          const videoMetadata = await youtubeService.getVideoMetadata(videoId);
          description = videoMetadata.description;

          if (description) {
            metadata.description = description;
            // Remove migration note since we now have data
            delete metadata._migrationNote;
            await fs.writeFile(metadataPath, YAML.stringify(metadata), 'utf-8');
            console.log(`  ✓ Updated description (${description.length} chars)`);
            result.updatedDescription++;
          } else {
            console.log(`  ⚠ Video has empty description`);
            result.skippedDescription++;
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('VIDEO_NOT_FOUND')) {
            console.log(`  ⚠ Video not found on YouTube (may be deleted/private)`);
            result.skippedDescription++;
          } else {
            console.log(`  ✗ Failed to fetch description: ${msg}`);
            result.errors.push(`${videoId} (description): ${msg}`);
          }
        }
      } else {
        result.skippedDescription++;
      }

      // Fetch transcript
      if (needsTranscript) {
        try {
          const transcriptData = await youtubeService.getTranscriptWithTimestamps(videoId);
          await fs.writeFile(transcriptPath, JSON.stringify(transcriptData, null, 2), 'utf-8');
          console.log(`  ✓ Added transcript (${transcriptData.segments.length} segments)`);
          result.addedTranscript++;
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('TRANSCRIPT_UNAVAILABLE')) {
            console.log(`  ⚠ Transcript unavailable for this video`);
          } else {
            console.log(`  ✗ Failed to fetch transcript: ${msg}`);
          }
          result.skippedTranscript++;
        }
      } else {
        result.skippedTranscript++;
      }

      // Rate limiting delay
      if (i < videoDirs.length - 1) {
        await sleep(DELAY_BETWEEN_VIDEOS);
      }

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ Error: ${msg}`);
      result.errors.push(`${videoId}: ${msg}`);
    }
  }

  return result;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Backfill: Fetch Descriptions & Transcripts for Existing Videos');
  console.log('='.repeat(60));
  console.log();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: BackfillOptions = {
    skipExistingDescription: !args.includes('--force-description'),
    skipExistingTranscript: !args.includes('--force-transcript'),
  };

  // Check for --limit flag
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && args[limitIndex + 1]) {
    options.limit = parseInt(args[limitIndex + 1], 10);
    console.log(`Limiting to ${options.limit} videos`);
  }

  // Check for specific video IDs
  const videoIndex = args.indexOf('--video');
  if (videoIndex !== -1 && args[videoIndex + 1]) {
    options.videoIds = args[videoIndex + 1].split(',');
    console.log(`Processing specific videos: ${options.videoIds.join(', ')}`);
  }

  console.log('Options:');
  console.log(`  Skip existing descriptions: ${options.skipExistingDescription}`);
  console.log(`  Skip existing transcripts: ${options.skipExistingTranscript}`);
  console.log();
  console.log('-'.repeat(60));
  console.log();

  const result = await backfill(options);

  console.log();
  console.log('='.repeat(60));
  console.log('Backfill Complete');
  console.log('='.repeat(60));
  console.log();
  console.log(`  Total videos:          ${result.total}`);
  console.log(`  Descriptions updated:  ${result.updatedDescription}`);
  console.log(`  Descriptions skipped:  ${result.skippedDescription}`);
  console.log(`  Transcripts added:     ${result.addedTranscript}`);
  console.log(`  Transcripts skipped:   ${result.skippedTranscript}`);
  console.log(`  Errors:                ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log();
    console.log('Errors:');
    result.errors.slice(0, 20).forEach(e => console.log(`  - ${e}`));
    if (result.errors.length > 20) {
      console.log(`  ... and ${result.errors.length - 20} more`);
    }
  }

  console.log();
}

main().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
