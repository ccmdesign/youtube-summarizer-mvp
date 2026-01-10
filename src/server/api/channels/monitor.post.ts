import { createChannelMonitorService } from '~/server/services/channel-monitor.service';
import type { MonitorRequest, MonitorResult } from '~/types/channels';
import { logger } from '~/server/utils/logger';

/**
 * POST /api/channels/monitor
 *
 * Trigger channel monitoring to check for new videos.
 * Protected by CRON_SECRET authorization header.
 *
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Body (optional):
 *   {
 *     "channelIds": ["UCxxxx"],  // Specific channels to check (default: all)
 *     "dryRun": false            // Check without processing (default: false)
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "summary": { ... },
 *     "results": [ ... ],
 *     "errors": [ ... ]
 *   }
 */
export default defineEventHandler(async (event): Promise<MonitorResult> => {
  // Verify cron secret
  const authHeader = getHeader(event, 'authorization');
  const config = useRuntimeConfig(event);

  // Check if cronSecret is configured
  if (!config.cronSecret) {
    logger.error('CRON_SECRET not configured');
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error: CRON_SECRET not set'
    });
  }

  // Validate authorization
  const expectedAuth = `Bearer ${config.cronSecret}`;
  if (authHeader !== expectedAuth) {
    logger.warn('Unauthorized channel monitor request', {
      hasAuth: !!authHeader,
      authPrefix: authHeader?.substring(0, 10)
    });
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }

  // Parse request body (optional)
  let body: MonitorRequest = {};
  try {
    body = await readBody(event) || {};
  } catch {
    // Body is optional, continue with defaults
  }

  const { channelIds, dryRun = false } = body;

  logger.info('Channel monitor request received', {
    channelIds: channelIds?.length || 'all',
    dryRun
  });

  try {
    const monitorService = createChannelMonitorService();
    const result = await monitorService.monitorAllChannels({ channelIds, dryRun });

    logger.info('Channel monitor completed', {
      success: result.success,
      processed: result.summary.videosProcessed,
      failed: result.summary.failedChannels
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Channel monitor failed', { error: errorMessage });

    throw createError({
      statusCode: 500,
      statusMessage: 'Channel monitoring failed',
      data: { error: errorMessage }
    });
  }
});
