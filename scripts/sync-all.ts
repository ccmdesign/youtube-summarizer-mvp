#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { syncAllPlaylists } from '../src/server/services/playlist-sync.service';
import { ChannelMonitorService } from '../src/server/services/channel-monitor.service';
import { logger } from '../src/server/utils/logger';
import { validateConfig } from '../src/server/utils/config';

// Load environment variables
dotenv.config();

interface SyncStats {
  playlists: { processed: number; skipped: number; failed: number };
  channels: { processed: number; skipped: number; failed: number };
}

function runGitCommand(command: string, description: string): boolean {
  try {
    console.log(`  ${description}...`);
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ⚠️  ${description} failed: ${message}`);
    return false;
  }
}

function getChangedFiles(): string[] {
  try {
    const output = execSync('git status --porcelain src/content/summaries/', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.slice(3)); // Remove status prefix (e.g., "?? " or " M ")
  } catch {
    return [];
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skipCommit = args.includes('--no-commit');
  const skipPush = args.includes('--no-push');
  const playlistOnly = args.includes('--playlist-only');
  const channelsOnly = args.includes('--channels-only');

  console.log('🎬 YouTube Sync All\n');

  if (skipCommit) console.log('  --no-commit: Will not commit changes');
  if (skipPush) console.log('  --no-push: Will not push to remote');
  if (playlistOnly) console.log('  --playlist-only: Syncing playlists only');
  if (channelsOnly) console.log('  --channels-only: Syncing channels only');
  console.log('');

  // Validate configuration before starting
  try {
    validateConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const stats: SyncStats = {
    playlists: { processed: 0, skipped: 0, failed: 0 },
    channels: { processed: 0, skipped: 0, failed: 0 }
  };

  try {
    // 1. Sync Playlists (unless --channels-only)
    if (!channelsOnly) {
      console.log('📋 Syncing Playlists...\n');
      const playlistResult = await syncAllPlaylists({
        onProgress: (event) => {
          if (event.type === 'playlist') {
            console.log(`  Playlist ${event.playlistIndex}/${event.totalPlaylists}: ${event.playlistName}`);
          } else if (event.type === 'video' && event.videoTitle) {
            console.log(`    Processing: ${event.videoTitle} (${event.videoIndex}/${event.totalVideos})`);
          }
        }
      });

      stats.playlists = {
        processed: playlistResult.summary.videosProcessed,
        skipped: playlistResult.summary.videosSkipped,
        failed: playlistResult.summary.failedPlaylists
      };

      console.log(`\n  ✅ Playlists: ${playlistResult.summary.videosProcessed} processed, ${playlistResult.summary.videosSkipped} skipped\n`);
    }

    // 2. Sync Channels (unless --playlist-only)
    if (!playlistOnly) {
      console.log('📺 Syncing Channels...\n');
      const channelMonitor = new ChannelMonitorService();
      const channelResult = await channelMonitor.monitorAllChannels({
        onProgress: (event) => {
          if (event.type === 'channel') {
            console.log(`  Checking channel: ${event.channelName} (${event.channelIndex}/${event.totalChannels})`);
          } else if (event.type === 'video' && event.videoTitle) {
            console.log(`    Processing: ${event.videoTitle}`);
          }
        }
      });

      stats.channels = {
        processed: channelResult.summary.videosProcessed,
        skipped: channelResult.summary.videosSkipped,
        failed: 0 // Channel monitor doesn't track failures the same way
      };

      console.log(`\n  ✅ Channels: ${channelResult.summary.videosProcessed} processed, ${channelResult.summary.videosSkipped} skipped\n`);
    }

    // 3. Summary
    const totalProcessed = stats.playlists.processed + stats.channels.processed;
    const totalSkipped = stats.playlists.skipped + stats.channels.skipped;
    const totalFailed = stats.playlists.failed + stats.channels.failed;

    console.log('📊 Sync Summary:');
    console.log(`  Total Processed: ${totalProcessed}`);
    console.log(`  Total Skipped:   ${totalSkipped}`);
    console.log(`  Total Failed:    ${totalFailed}`);
    console.log('');

    // 4. Git operations (if anything was processed)
    if (totalProcessed > 0 && !skipCommit) {
      console.log('📝 Git Operations:\n');

      // Check what files changed
      const changedFiles = getChangedFiles();

      if (changedFiles.length === 0) {
        console.log('  No new files to commit.\n');
      } else {
        console.log(`  Found ${changedFiles.length} new/modified files.\n`);

        // Stage all summary files
        runGitCommand('git add src/content/summaries/', 'Staging summary files');

        // Also stage the processing log
        runGitCommand('git add src/data/processing-log.json', 'Staging processing log');

        // Create commit
        const commitMessage = `sync: Add ${totalProcessed} video summaries

Playlists: ${stats.playlists.processed} new
Channels: ${stats.channels.processed} new
Skipped: ${totalSkipped} (already processed)`;

        const commitSuccess = runGitCommand(
          `git commit -m "${commitMessage}"`,
          'Creating commit'
        );

        if (commitSuccess && !skipPush) {
          // Push to remote
          const pushSuccess = runGitCommand('git push', 'Pushing to remote');

          if (pushSuccess) {
            console.log('\n  ✅ Changes pushed! Netlify will auto-deploy.\n');
          }
        } else if (commitSuccess) {
          console.log('\n  ✅ Changes committed (not pushed due to --no-push).\n');
        }
      }
    } else if (totalProcessed === 0) {
      console.log('ℹ️  No new videos processed. Nothing to commit.\n');
    }

    console.log('✨ Sync complete!\n');
    process.exit(0);
  } catch (error) {
    logger.error('Sync failed', { error });
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
