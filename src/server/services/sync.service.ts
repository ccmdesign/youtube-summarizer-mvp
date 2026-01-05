import type { SyncResult } from '~/types/config';
import { loadConfig } from '~/server/utils/config';
import { logger } from '~/server/utils/logger';
import { createYouTubeService } from './youtube.service';
import { createGeminiService } from './gemini.service';
import { createContentWriterService } from './content-writer.service';

/**
 * Main orchestration function for syncing YouTube playlist
 */
export async function syncPlaylist(): Promise<SyncResult> {
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
    const geminiService = createGeminiService(config.geminiApiKey, config.geminiModel);
    const contentWriter = createContentWriterService(config.outputDir);

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

    // 4. Process each video
    for (const [index, item] of videosToProcess.entries()) {
      logger.info(`Processing video ${index + 1}/${videosToProcess.length}: ${item.videoId}`);

      try {
        await processVideo(
          item.videoId,
          config,
          youtubeService,
          geminiService,
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

    logger.info('Sync completed', result);
    return result;
  } catch (error) {
    logger.error('Sync failed catastrophically', { error });
    throw error;
  }
}

/**
 * Process a single video
 */
async function processVideo(
  videoId: string,
  config: ReturnType<typeof loadConfig>,
  youtubeService: ReturnType<typeof createYouTubeService>,
  geminiService: ReturnType<typeof createGeminiService>,
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

  // 3. Generate summary
  const summary = await geminiService.generateSummary({
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
