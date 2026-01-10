#!/usr/bin/env tsx

/**
 * Reset a video for retry in the processing log
 *
 * Usage:
 *   npm run video:retry -- <videoId>
 *   npx tsx scripts/video-retry.ts <videoId>
 */

import { createProcessingLogService } from '../src/server/services/processing-log.service';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: npm run video:retry -- <videoId>

Arguments:
  videoId     The YouTube video ID to reset for retry (required)

Examples:
  npm run video:retry -- dQw4w9WgXcQ
`);
    process.exit(0);
  }

  const videoId = args[0];
  const processingLog = createProcessingLogService();

  try {
    // Check if video exists in the log
    const existing = await processingLog.getEntry(videoId);

    if (!existing) {
      console.log(`ℹ️  Video ${videoId} is not in the processing log.`);
      console.log(`   It will be processed on the next sync run if it's in the playlist.`);
      process.exit(0);
    }

    if (existing.status === 'success') {
      console.log(`⚠️  Video ${videoId} was already processed successfully.`);
      console.log(`   To reprocess, delete the markdown file first.`);
      process.exit(1);
    }

    if (existing.status === 'pending') {
      console.log(`ℹ️  Video ${videoId} is already pending processing.`);
      console.log(`   It will be processed on the next sync run.`);
      process.exit(0);
    }

    // Reset for retry
    const entry = await processingLog.resetForRetry(videoId);

    console.log(`✅ Video ${videoId} reset for retry`);

    if (entry.title) {
      console.log(`   Title: ${entry.title}`);
    }

    console.log(`\n   Previous status: ${existing.status}`);
    if (existing.skipReason) {
      console.log(`   Previous reason: ${existing.skipReason}`);
    }

    console.log(`\n   This video will be processed on the next sync run.`);
  } catch (error) {
    console.error('❌ Failed to reset video:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
