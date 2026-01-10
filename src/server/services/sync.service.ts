import type { SyncResult } from '~/types/config';
import { loadConfig } from '~/server/utils/config';
import { logger } from '~/server/utils/logger';
import { createYouTubeService } from './youtube.service';
import { createAIService } from './ai.service';
import { createContentWriterService } from './content-writer.service';

export interface SyncProgressEvent {
  type: 'start' | 'processing' | 'complete' | 'error';
  videoId?: string;
  videoTitle?: string;
  current?: number;
  total?: number;
  result?: SyncResult;
  error?: string;
}

export type SyncProgressCallback = (event: SyncProgressEvent) => void;

/**
 * Main orchestration function for syncing YouTube playlist
 */
export async function syncPlaylist(onProgress?: SyncProgressCallback): Promise<SyncResult> {
  const config = loadConfig();

  logger.info('Starting playlist sync', {
    playlistId: config.youtubePlaylistId,
    processingMode: config.processingMode,
    maxVideos: config.maxVideosPerRun
  });

  const result: SyncResult = {
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  try {
    // Initialize services
    const youtubeService = createYouTubeService(config.youtubeApiKey);
    const aiService = createAIService({
      geminiApiKey: config.geminiApiKey,
      primaryModel: config.geminiModel,
      openRouterApiKey: config.openRouterApiKey,
      enableFallback: config.enableModelFallback
    });
    const contentWriter = createContentWriterService(config.outputDir);

    // Log available models for debugging
    const availableModels = aiService.getAvailableModels();
    logger.info('AI service initialized with fallback chain', {
      primary: config.geminiModel,
      geminiFallbacks: availableModels.gemini.slice(1),
      openRouterFallbacks: availableModels.openRouter.length > 0 ? availableModels.openRouter : 'not configured'
    });

    // 1. Fetch playlist items
    logger.info('Fetching playlist items...');
    const playlistItems = await youtubeService.getPlaylistItems(config.youtubePlaylistId);

    if (playlistItems.length === 0) {
      logger.warn('No videos found in playlist');
      return result;
    }

    // 2. Filter out already processed videos (check if markdown file exists)
    const processedChecks = await Promise.all(
      playlistItems.map(item => contentWriter.exists(item.videoId))
    );
    const newVideos = playlistItems.filter(
      (item, index) => !processedChecks[index]
    );

    const alreadyProcessed = playlistItems.length - newVideos.length;
    logger.info(`Found ${newVideos.length} new videos (${alreadyProcessed} already processed)`);

    result.skipped = alreadyProcessed;

    // 3. Limit to maxVideosPerRun
    const videosToProcess = newVideos.slice(0, config.maxVideosPerRun);

    if (videosToProcess.length < newVideos.length) {
      logger.info(`Processing ${videosToProcess.length} of ${newVideos.length} new videos (rate limit)`);
      result.skipped += newVideos.length - videosToProcess.length;
    }

    // 4. Process each video with delays to respect rate limits
    // Free tier: ~2 videos/minute to stay under 5-15 RPM limits
    const VIDEO_PROCESSING_DELAY = 30000; // 30 seconds between videos

    // Emit start event
    onProgress?.({
      type: 'start',
      total: videosToProcess.length
    });

    for (const [index, item] of videosToProcess.entries()) {
      // Add delay between videos (skip first one)
      if (index > 0) {
        logger.info(`Waiting ${VIDEO_PROCESSING_DELAY / 1000}s before next video (rate limiting)...`);
        await new Promise(resolve => setTimeout(resolve, VIDEO_PROCESSING_DELAY));
      }

      logger.info(`Processing video ${index + 1}/${videosToProcess.length}: ${item.videoId}`);

      // Emit processing event with video title
      onProgress?.({
        type: 'processing',
        videoId: item.videoId,
        videoTitle: item.title,
        current: index + 1,
        total: videosToProcess.length
      });

      try {
        await processVideo(
          item.videoId,
          config,
          youtubeService,
          aiService,
          contentWriter
        );

        result.processed++;

        logger.info(`Successfully processed ${item.videoId}`);
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        result.errors.push({
          videoId: item.videoId,
          error: errorMessage
        });

        logger.error(`Failed to process ${item.videoId}`, { error: errorMessage });
      }
    }

    // Emit complete event
    onProgress?.({
      type: 'complete',
      result
    });

    logger.info('Sync completed', result);
    return result;
  } catch (error) {
    // Emit error event
    onProgress?.({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    });

    logger.error('Sync failed catastrophically', { error });
    throw error;
  }
}

/**
 * Process a single video
 * Exported for reuse by channel monitoring service
 */
export async function processVideo(
  videoId: string,
  config: ReturnType<typeof loadConfig>,
  youtubeService: ReturnType<typeof createYouTubeService>,
  aiService: ReturnType<typeof createAIService>,
  contentWriter: ReturnType<typeof createContentWriterService>
): Promise<void> {
  // 1. Get video metadata
  const metadata = await youtubeService.getVideoMetadata(videoId);

  // 2. Get transcript (if in transcript mode)
  let transcript: string | undefined;
  let processingMode = config.processingMode;

  if (processingMode === 'transcript') {
    try {
      transcript = await youtubeService.getTranscript(videoId);
    } catch (error) {
      // If transcript unavailable and Pro fallback is enabled
      if (config.enableProFallback && config.geminiModel.includes('pro')) {
        logger.warn(`Transcript unavailable, falling back to native video mode`, { videoId });
        processingMode = 'native-video';
      } else {
        throw error;
      }
    }
  }

  // 3. Generate summary (with automatic fallback on quota exhaustion)
  const summary = await aiService.generateSummary({
    metadata,
    transcript,
    mode: processingMode
  });

  // 4. Write markdown file (filesystem is source of truth for "processed")
  await contentWriter.writeMarkdown({
    videoId,
    metadata,
    summary
  });
}
