#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { syncAllPlaylists } from '../src/server/services/playlist-sync.service';
import { loadPlaylistsConfig } from '../src/server/utils/playlists-config';
import { logger } from '../src/server/utils/logger';

// Load environment variables
dotenv.config();

function printUsage() {
  console.log(`
Usage: npx tsx scripts/sync-playlists.ts [options]

Options:
  --playlist=ID    Sync specific playlist(s) by ID (can be repeated)
  --dry-run        Preview what would be processed without making changes
  --list           List all configured playlists and exit
  --help           Show this help message

Examples:
  npx tsx scripts/sync-playlists.ts                           # Sync all enabled playlists
  npx tsx scripts/sync-playlists.ts --playlist=PLxxxxxxxx     # Sync specific playlist
  npx tsx scripts/sync-playlists.ts --dry-run                 # Preview mode
  npx tsx scripts/sync-playlists.ts --list                    # List configured playlists
`);
}

function listPlaylists() {
  const config = loadPlaylistsConfig();

  console.log('\n📋 Configured Playlists:\n');

  if (config.playlists.length === 0) {
    console.log('  No playlists configured.');
    console.log('  Add playlists to src/config/playlists.yaml\n');
    return;
  }

  for (const playlist of config.playlists) {
    const status = playlist.enabled !== false ? '✅' : '❌';
    const category = playlist.category ? ` [${playlist.category}]` : '';
    console.log(`  ${status} ${playlist.name}${category}`);
    console.log(`     ID: ${playlist.id}`);
  }

  console.log(`\n  Total: ${config.playlists.length} playlists`);
  console.log(`  Enabled: ${config.playlists.filter(p => p.enabled !== false).length}\n`);
}

async function main() {
  const args = process.argv.slice(2);

  // Handle help flag
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  // Handle list flag
  if (args.includes('--list')) {
    listPlaylists();
    process.exit(0);
  }

  // Parse options
  const dryRun = args.includes('--dry-run');
  const playlistIds = args
    .filter(a => a.startsWith('--playlist='))
    .map(a => a.split('=')[1]);

  console.log('🎬 YouTube Multi-Playlist Sync\n');

  if (dryRun) {
    console.log('  --dry-run: Will preview without processing\n');
  }

  if (playlistIds.length > 0) {
    console.log(`  Syncing specific playlists: ${playlistIds.join(', ')}\n`);
  }

  try {
    const result = await syncAllPlaylists({
      playlistIds: playlistIds.length > 0 ? playlistIds : undefined,
      dryRun,
      onProgress: (event) => {
        if (event.type === 'start') {
          console.log(`📊 Processing ${event.totalPlaylists} playlist(s)...\n`);
        }
        if (event.type === 'playlist') {
          console.log(`\n📋 Playlist ${event.playlistIndex}/${event.totalPlaylists}: ${event.playlistName}`);
        }
        if (event.type === 'video' && event.videoTitle) {
          console.log(`  📹 Processing: ${event.videoTitle} (${event.videoIndex}/${event.totalVideos})`);
        }
      }
    });

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Sync Summary');
    console.log('='.repeat(50));
    console.log(`  Total Playlists:    ${result.summary.totalPlaylists}`);
    console.log(`  Successful:         ${result.summary.successfulPlaylists}`);
    console.log(`  Failed:             ${result.summary.failedPlaylists}`);
    console.log(`  Skipped:            ${result.summary.skippedPlaylists}`);
    console.log('');
    console.log(`  Videos Found:       ${result.summary.videosFound}`);
    console.log(`  Videos Processed:   ${result.summary.videosProcessed}`);
    console.log(`  Videos Skipped:     ${result.summary.videosSkipped}`);

    // Print per-playlist results
    if (result.results.length > 0) {
      console.log('\n' + '-'.repeat(50));
      console.log('Per-Playlist Results:');
      console.log('-'.repeat(50));

      for (const playlistResult of result.results) {
        const statusIcon = playlistResult.status === 'success' ? '✅' :
                          playlistResult.status === 'failed' ? '❌' : '⏭️';
        console.log(`\n  ${statusIcon} ${playlistResult.playlistName}`);
        console.log(`     Found: ${playlistResult.videosFound}, Processed: ${playlistResult.videosProcessed}, Skipped: ${playlistResult.videosSkipped}`);
        if (playlistResult.error) {
          console.log(`     Error: ${playlistResult.error}`);
        }
      }
    }

    // Print errors if any
    if (result.errors.length > 0) {
      console.log('\n' + '-'.repeat(50));
      console.log('❌ Errors:');
      console.log('-'.repeat(50));
      for (const error of result.errors) {
        console.log(`  • ${error}`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(result.success ? '✨ Sync completed successfully!' : '⚠️ Sync completed with errors');
    console.log('='.repeat(50) + '\n');

    process.exit(result.success ? 0 : 1);

  } catch (error) {
    logger.error('Sync failed', { error });
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
