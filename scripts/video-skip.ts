#!/usr/bin/env tsx

/**
 * Manually skip a video in the processing log
 *
 * Usage:
 *   npm run video:skip -- <videoId> [--reason "..."]
 *   npx tsx scripts/video-skip.ts <videoId> --reason "No transcript available"
 */

import { createProcessingLogService } from '../src/server/services/processing-log.service';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: npm run video:skip -- <videoId> [--reason "..."]

Arguments:
  videoId     The YouTube video ID to skip (required)
  --reason    Reason for skipping (optional, default: "Manually skipped")

Examples:
  npm run video:skip -- dQw4w9WgXcQ
  npm run video:skip -- dQw4w9WgXcQ --reason "No transcript available"
`);
    process.exit(0);
  }

  const videoId = args[0];
  let reason = 'Manually skipped';

  // Parse --reason argument
  const reasonIndex = args.indexOf('--reason');
  if (reasonIndex !== -1 && args[reasonIndex + 1]) {
    reason = args[reasonIndex + 1];
  }

  const processingLog = createProcessingLogService();

  try {
    // Check if video exists in the log
    const existing = await processingLog.getEntry(videoId);

    if (existing?.status === 'success') {
      console.log(`⚠️  Video ${videoId} was already processed successfully.`);
      console.log(`   If you want to skip it, delete the markdown file first.`);
      process.exit(1);
    }

    if (existing?.skipPermanently) {
      console.log(`ℹ️  Video ${videoId} is already marked as skipped.`);
      console.log(`   Reason: ${existing.skipReason}`);
      process.exit(0);
    }

    // Skip the video
    const entry = await processingLog.skipVideo(videoId, reason);

    console.log(`✅ Video ${videoId} marked as skipped`);
    console.log(`   Reason: ${reason}`);

    if (entry.title) {
      console.log(`   Title: ${entry.title}`);
    }

    console.log(`\n   This video will be skipped on future sync runs.`);
    console.log(`   To retry, run: npm run video:retry -- ${videoId}`);
  } catch (error) {
    console.error('❌ Failed to skip video:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
