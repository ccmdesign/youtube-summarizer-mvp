#!/usr/bin/env tsx

/**
 * Show processing log status and statistics
 *
 * Usage:
 *   npm run video:status
 *   npm run video:status -- --verbose
 *   npm run video:status -- --filter skipped
 *   npx tsx scripts/video-status.ts
 */

import { createProcessingLogService } from '../src/server/services/processing-log.service';
import type { ProcessingStatus } from '../src/types/processing-log';

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const filterIndex = args.indexOf('--filter');
  const filter = filterIndex !== -1 ? args[filterIndex + 1] as ProcessingStatus : undefined;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run video:status [options]

Options:
  --verbose, -v              Show detailed information for each entry
  --filter <status>          Filter by status (success, failed, skipped, pending)
  --help, -h                 Show this help message

Examples:
  npm run video:status
  npm run video:status -- --verbose
  npm run video:status -- --filter skipped
  npm run video:status -- --filter failed --verbose
`);
    process.exit(0);
  }

  const processingLog = createProcessingLogService();

  try {
    const log = await processingLog.read();
    const stats = await processingLog.getStats();
    const entries = Object.values(log.entries);

    console.log(`\n📊 Processing Log Status\n`);
    console.log(`   Last Updated: ${log.lastUpdated}`);
    console.log(`   Version: ${log.version}\n`);

    console.log(`   Summary:`);
    console.log(`   ────────────────────────`);
    console.log(`   ✅ Success:  ${stats.success}`);
    console.log(`   ❌ Failed:   ${stats.failed}`);
    console.log(`   ⏭️  Skipped:  ${stats.skipped}`);
    console.log(`   ⏳ Pending:  ${stats.pending}`);
    console.log(`   ────────────────────────`);
    console.log(`   📝 Total:    ${stats.total}\n`);

    // Filter entries if requested
    let filteredEntries = entries;
    if (filter) {
      filteredEntries = entries.filter(e => e.status === filter);
      console.log(`   Showing ${filteredEntries.length} entries with status: ${filter}\n`);
    }

    // Show detailed entries
    if (verbose || filter) {
      if (filteredEntries.length === 0) {
        console.log(`   No entries found.\n`);
      } else {
        for (const entry of filteredEntries) {
          const statusIcon =
            entry.status === 'success' ? '✅' :
            entry.status === 'failed' ? '❌' :
            entry.status === 'skipped' ? '⏭️ ' :
            '⏳';

          console.log(`   ${statusIcon} ${entry.videoId}`);
          if (entry.title) {
            console.log(`      Title: ${entry.title}`);
          }
          console.log(`      Status: ${entry.status}`);
          console.log(`      Attempts: ${entry.attemptCount}`);

          if (entry.lastAttemptAt) {
            console.log(`      Last Attempt: ${entry.lastAttemptAt}`);
          }

          if (entry.errorCode) {
            console.log(`      Error: ${entry.errorCode}`);
          }

          if (entry.skipReason) {
            console.log(`      Skip Reason: ${entry.skipReason}`);
          }

          console.log();
        }
      }
    } else if (stats.skipped > 0) {
      // Show a summary of skipped videos even in non-verbose mode
      const skipped = entries.filter(e => e.status === 'skipped');
      console.log(`   Permanently Skipped Videos:`);
      for (const entry of skipped) {
        const title = entry.title ? ` - ${entry.title}` : '';
        const reason = entry.skipReason ? ` (${entry.skipReason})` : '';
        console.log(`   ⏭️  ${entry.videoId}${title}${reason}`);
      }
      console.log();
    }

    console.log(`   Use --verbose to see all entries`);
    console.log(`   Use --filter <status> to filter by status\n`);
  } catch (error) {
    console.error('❌ Failed to read processing log:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
