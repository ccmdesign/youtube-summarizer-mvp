#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { syncPlaylist } from '../src/server/services/sync.service';
import { logger } from '../src/server/utils/logger';
import { validateConfig } from '../src/server/utils/config';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🎬 YouTube Playlist Summarizer\n');

  // Validate configuration before starting
  try {
    validateConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    logger.info('Starting playlist sync...');

    const result = await syncPlaylist();

    console.log('\n📊 Sync Results:');
    console.log(`  ✅ Processed: ${result.processed}`);
    console.log(`  ⏭️  Skipped:   ${result.skipped}`);
    console.log(`  ❌ Failed:    ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(({ videoId, error }) => {
        console.log(`  - ${videoId}: ${error}`);
      });
    }

    console.log('\n✨ Sync completed!\n');

    // Exit with error code if any videos failed
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Sync failed', { error });
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
