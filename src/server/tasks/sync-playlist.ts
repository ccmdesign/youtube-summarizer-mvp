import { defineTask } from 'nitropack/runtime';
import { syncPlaylist } from '../services/sync.service';
import { logger } from '../utils/logger';

/**
 * Scheduled task to sync YouTube playlist
 *
 * Runs every 6 hours to check for new videos and process them.
 * Can also be triggered manually via the Nitro task runner.
 */
export default defineTask({
  meta: {
    name: 'sync:playlist',
    description: 'Sync YouTube playlist and process new videos'
  },
  async run() {
    logger.info('Starting scheduled playlist sync...');

    try {
      const result = await syncPlaylist();

      logger.info('Scheduled sync completed', {
        processed: result.processed,
        skipped: result.skipped,
        failed: result.failed
      });

      return {
        result: {
          processed: result.processed,
          skipped: result.skipped,
          failed: result.failed,
          errors: result.errors.length
        }
      };
    } catch (error) {
      logger.error('Scheduled sync failed', {
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        result: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
});
