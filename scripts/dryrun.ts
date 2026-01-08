#!/usr/bin/env tsx

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { loadConfig, validateConfig } from '../src/server/utils/config';
import { createYouTubeService } from '../src/server/services/youtube.service';
import { createAIService } from '../src/server/services/ai.service';
import { logger } from '../src/server/utils/logger';
import type { SummaryOutput } from '../src/types/gemini';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🧪 Dry Run - Regenerate Last Video\n');

  // Validate configuration
  try {
    validateConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const config = loadConfig();

  try {
    const youtubeService = createYouTubeService(config.youtubeApiKey);
    const aiService = createAIService({
      geminiApiKey: config.geminiApiKey,
      primaryModel: config.geminiModel,
      openRouterApiKey: config.openRouterApiKey,
      enableFallback: config.enableModelFallback
    });

    // Log fallback chain info
    const models = aiService.getAvailableModels();
    console.log(`🔄 Fallback chain: ${models.gemini.join(' → ')}`);
    if (models.openRouter.length > 0) {
      console.log(`   + OpenRouter: ${models.openRouter.slice(0, 3).join(', ')}...`);
    }

    // 1. Fetch playlist and get the last added video (position 0)
    console.log('📋 Fetching playlist...');
    const playlistItems = await youtubeService.getPlaylistItems(config.youtubePlaylistId);

    if (playlistItems.length === 0) {
      console.error('❌ No videos found in playlist');
      process.exit(1);
    }

    // Position 0 is the most recently added video
    const lastVideo = playlistItems.find(item => item.position === 0) || playlistItems[0];
    console.log(`\n🎬 Last video: "${lastVideo.title}"`);
    console.log(`   Video ID: ${lastVideo.videoId}`);

    // 2. Get video metadata
    console.log('\n📊 Fetching metadata...');
    const metadata = await youtubeService.getVideoMetadata(lastVideo.videoId);

    // 3. Get transcript (if in transcript mode)
    let transcript: string | undefined;
    let processingMode = config.processingMode;

    if (processingMode === 'transcript') {
      console.log('📝 Fetching transcript...');
      try {
        transcript = await youtubeService.getTranscript(lastVideo.videoId);
        console.log(`   Transcript length: ${transcript.length} characters`);
      } catch (error) {
        console.log('⚠️  Transcript unavailable, using native-video mode');
        processingMode = 'native-video';
      }
    }

    // 4. Generate summary (with automatic fallback on quota exhaustion)
    console.log(`\n🤖 Generating summary (${processingMode} mode)...`);
    const summary = await aiService.generateSummary({
      metadata,
      transcript,
      mode: processingMode
    });

    // 5. Write to a timestamped file for comparison
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), config.outputDir);
    const dryrunFilename = `${lastVideo.videoId}_dryrun_${timestamp}.md`;
    const dryrunPath = path.join(outputDir, dryrunFilename);

    const content = generateMarkdown(lastVideo.videoId, metadata, summary);
    await fs.writeFile(dryrunPath, content, 'utf-8');

    // 6. Compare with original if it exists
    const originalPath = path.join(outputDir, `${lastVideo.videoId}.md`);
    let originalExists = false;
    let originalSize = 0;

    try {
      const originalStats = await fs.stat(originalPath);
      originalExists = true;
      originalSize = originalStats.size;
    } catch {
      // Original doesn't exist
    }

    // Results
    console.log('\n✅ Dry run complete!\n');
    console.log('📄 Output:');
    console.log(`   File: ${dryrunFilename}`);
    console.log(`   Size: ${content.length} bytes`);
    console.log(`   TLDR: ${summary.tldr.slice(0, 100)}...`);

    // Display metrics
    console.log('\n📊 AI Metrics:');
    console.log(`   Provider: ${summary.metrics.provider}`);
    console.log(`   Model: ${summary.modelUsed}`);
    console.log(`   API Calls: ${summary.metrics.apiCalls}`);
    console.log(`   Fallback Attempts: ${summary.metrics.fallbackAttempts}`);
    if (summary.metrics.totalTokens) {
      console.log(`   Tokens: ${summary.metrics.inputTokens} in / ${summary.metrics.outputTokens} out (${summary.metrics.totalTokens} total)`);
    }
    console.log(`   Processing Time: ${summary.metrics.processingTimeMs}ms`);

    if (originalExists) {
      const sizeDiff = content.length - originalSize;
      const diffLabel = sizeDiff > 0 ? `+${sizeDiff}` : sizeDiff.toString();
      console.log(`\n📊 Comparison with original:`);
      console.log(`   Original: ${originalSize} bytes`);
      console.log(`   New:      ${content.length} bytes (${diffLabel})`);
      console.log(`\n💡 Compare files:`);
      console.log(`   diff "${originalPath}" "${dryrunPath}"`);
    }

    console.log('\n');
  } catch (error) {
    logger.error('Dry run failed', { error });
    console.error('\n❌ Failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Normalize section content to ensure proper line breaks.
 * Fixes: bullet points on same line, missing paragraph breaks, ### headers.
 */
function normalizeSectionContent(content: string): string {
  let normalized = content.trim();

  // Ensure bullet points are on separate lines
  // Match: end of sentence/item + space + bullet marker
  normalized = normalized
    .replace(/([.!?:])(\s+)([-*])\s/g, '$1\n\n$3 ')  // After punctuation
    .replace(/([a-z])(\s+)([-*])\s/g, '$1\n\n$3 ');   // After lowercase (list continuation)

  // Ensure ### headers have blank lines before and after
  // Add newline before ### if not present
  normalized = normalized.replace(/([^\n])(###\s)/g, '$1\n\n$2');

  // Fix run-together text: lowercase immediately followed by uppercase
  // Pattern: "StrategyThe" -> "Strategy\n\nThe"
  // This catches headers running into content and sentences without space
  normalized = normalized.replace(/([a-z])([A-Z][a-z])/g, '$1\n\n$2');

  // Collapse multiple blank lines
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  return normalized;
}

/**
 * Assemble markdown body from structured sections.
 * We control the headers, AI provides the content.
 */
function assembleMarkdownBody(summary: SummaryOutput): string {
  const sections: string[] = [];

  // Key Takeaways section
  if (summary.keyTakeaways?.trim()) {
    sections.push(`## Key Takeaways\n\n${normalizeSectionContent(summary.keyTakeaways)}`);
  }

  // Summary section
  if (summary.summary?.trim()) {
    sections.push(`## Summary\n\n${normalizeSectionContent(summary.summary)}`);
  }

  // Context section
  if (summary.context?.trim()) {
    sections.push(`## Context\n\n${normalizeSectionContent(summary.context)}`);
  }

  return sections.join('\n\n');
}

function generateMarkdown(
  videoId: string,
  metadata: { title: string; channel: string; channelId: string; duration: string; publishedAt: string; thumbnailUrl: string },
  summary: SummaryOutput
): string {
  const escapeYaml = (str: string) => str.replace(/"/g, '\\"').replace(/\n/g, ' ');
  const { metrics } = summary;

  // Build metrics section (only include defined values)
  const metricsLines: string[] = [];
  metricsLines.push(`aiProvider: "${metrics.provider}"`);
  metricsLines.push(`apiCalls: ${metrics.apiCalls}`);
  metricsLines.push(`fallbackAttempts: ${metrics.fallbackAttempts}`);
  if (metrics.inputTokens !== undefined) {
    metricsLines.push(`inputTokens: ${metrics.inputTokens}`);
  }
  if (metrics.outputTokens !== undefined) {
    metricsLines.push(`outputTokens: ${metrics.outputTokens}`);
  }
  if (metrics.totalTokens !== undefined) {
    metricsLines.push(`totalTokens: ${metrics.totalTokens}`);
  }
  metricsLines.push(`processingTimeMs: ${metrics.processingTimeMs}`);

  // Assemble markdown body from structured sections
  const body = assembleMarkdownBody(summary);

  return `---
title: "${escapeYaml(metadata.title)}"
videoId: "${videoId}"
channel: "${escapeYaml(metadata.channel)}"
channelId: "${metadata.channelId}"
duration: "${metadata.duration}"
publishedAt: "${metadata.publishedAt}"
processedAt: "${new Date().toISOString()}"
source: "youtube"
playlistId: "${process.env.YOUTUBE_PLAYLIST_ID || ''}"
thumbnailUrl: "${metadata.thumbnailUrl}"
youtubeUrl: "https://www.youtube.com/watch?v=${videoId}"
modelUsed: "${summary.modelUsed}"
tldr: "${escapeYaml(summary.tldr)}"
# AI Processing Metrics
${metricsLines.join('\n')}
---

${body}
`;
}

main();
