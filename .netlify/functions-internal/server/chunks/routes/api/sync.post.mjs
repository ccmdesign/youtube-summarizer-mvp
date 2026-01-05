import { y as youtubeApiLimiter, a as retryWithBackoff, l as logger, g as geminiProLimiter, b as geminiFlashLimiter, e as loadConfig, d as defineEventHandler } from '../../nitro/nitro.mjs';
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import 'zod';
import 'winston';
import 'fs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, key + "" , value);
class YouTubeService {
  constructor(apiKey) {
    __publicField$1(this, "youtube");
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey
    });
  }
  /**
   * Fetch all videos from a playlist (with pagination)
   */
  async getPlaylistItems(playlistId) {
    const items = [];
    let pageToken;
    do {
      await youtubeApiLimiter.acquire();
      const response = await retryWithBackoff(
        () => this.youtube.playlistItems.list({
          part: ["snippet"],
          playlistId,
          maxResults: 50,
          pageToken
        })
      );
      if (!response.data.items) {
        break;
      }
      items.push(
        ...response.data.items.map((item) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title || "Untitled",
          position: item.snippet.position || 0
        }))
      );
      pageToken = response.data.nextPageToken || void 0;
    } while (pageToken);
    logger.info(`Fetched ${items.length} videos from playlist ${playlistId}`);
    return items;
  }
  /**
   * Get metadata for a specific video
   */
  async getVideoMetadata(videoId) {
    var _a, _b, _c, _d, _e;
    await youtubeApiLimiter.acquire();
    const response = await retryWithBackoff(
      () => this.youtube.videos.list({
        part: ["snippet", "contentDetails"],
        id: [videoId]
      })
    );
    const video = (_a = response.data.items) == null ? void 0 : _a[0];
    if (!video) {
      throw new Error(`VIDEO_NOT_FOUND: ${videoId}`);
    }
    return {
      videoId,
      title: video.snippet.title || "Untitled",
      channel: video.snippet.channelTitle || "Unknown Channel",
      channelId: video.snippet.channelId || "",
      duration: video.contentDetails.duration || "PT0S",
      publishedAt: video.snippet.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
      thumbnailUrl: ((_c = (_b = video.snippet.thumbnails) == null ? void 0 : _b.high) == null ? void 0 : _c.url) || ((_e = (_d = video.snippet.thumbnails) == null ? void 0 : _d.default) == null ? void 0 : _e.url) || ""
    };
  }
  /**
   * Get transcript for a video
   * @throws Error with code 'TRANSCRIPT_UNAVAILABLE' if transcript cannot be fetched
   */
  async getTranscript(videoId) {
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      const transcript = transcriptData.map((entry) => entry.text).join(" ");
      logger.info(`Fetched transcript for ${videoId}`, {
        length: transcript.length,
        entries: transcriptData.length
      });
      return transcript;
    } catch (error) {
      logger.warn(`Transcript unavailable for ${videoId}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      const transcriptError = new Error("TRANSCRIPT_UNAVAILABLE");
      transcriptError.cause = error;
      throw transcriptError;
    }
  }
}
function createYouTubeService(apiKey) {
  return new YouTubeService(apiKey);
}

const summaryResponseSchema = {
  type: "object",
  properties: {
    keyTakeaway: {
      type: "string",
      description: "The single most important insight or actionable lesson from this video (max 200 characters). This should be the one thing someone should remember if they only read this line.",
      nullable: false
    },
    summary: {
      type: "string",
      description: "A comprehensive summary of the video content (up to 1000 words, but shorter if the content is simple). Focus on key insights, main arguments, actionable takeaways, and notable quotes or statistics.",
      nullable: false
    }
  },
  required: ["keyTakeaway", "summary"]
};
function buildSummaryPrompt(input) {
  const { metadata, transcript } = input;
  return `You are summarizing a YouTube video for a personal knowledge base.

Video Title: ${metadata.title}
Channel: ${metadata.channel}
Duration: ${metadata.duration}
Published: ${metadata.publishedAt}

${transcript ? `Transcript:
${transcript}

` : ""}

Provide a summary following these guidelines:

For keyTakeaway:
- The single most important insight or actionable lesson
- Maximum 200 characters, no quotes
- Should be the one thing someone remembers if they only read this line

For summary:
- Comprehensive but concise (up to 1000 words, shorter if content is simple)
- Focus on key insights and main arguments
- Include actionable takeaways
- Paraphrase notable quotes or statistics
- No filler - be direct and information-dense`;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class GeminiService {
  constructor(apiKey, modelName = "gemini-2.0-flash-exp") {
    __publicField(this, "genAI");
    __publicField(this, "modelName");
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }
  /**
   * Generate a summary for a video
   */
  async generateSummary(input) {
    const limiter = this.modelName.includes("pro") ? geminiProLimiter : geminiFlashLimiter;
    await limiter.acquire();
    const prompt = this.buildPrompt(input);
    logger.info(`Generating summary for ${input.metadata.videoId}`, {
      mode: input.mode,
      model: this.modelName
    });
    const result = await retryWithBackoff(async () => {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: summaryResponseSchema.properties,
            required: summaryResponseSchema.required
          }
        }
      });
      if (input.mode === "native-video") {
        return await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: "video/youtube",
              data: `https://www.youtube.com/watch?v=${input.metadata.videoId}`
            }
          }
        ]);
      } else {
        return await model.generateContent(prompt);
      }
    }, {
      maxRetries: 2,
      baseDelay: 2e3,
      onRetry: (error, attempt) => {
        logger.warn(`Gemini API retry ${attempt}`, {
          videoId: input.metadata.videoId,
          error: error.message
        });
      }
    });
    const text = result.response.text();
    const parsed = this.parseResponse(text);
    logger.info(`Summary generated for ${input.metadata.videoId}`, {
      tldrLength: parsed.tldr.length,
      summaryLength: parsed.summary.length
    });
    return {
      ...parsed,
      modelUsed: this.modelName
    };
  }
  /**
   * Build the prompt for Gemini
   */
  buildPrompt(input) {
    return buildSummaryPrompt({
      metadata: input.metadata,
      transcript: input.transcript
    });
  }
  /**
   * Parse Gemini's structured JSON response
   */
  parseResponse(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.keyTakeaway || !parsed.summary) {
        logger.error("Missing required fields in Gemini response", { parsed });
        throw new Error("MALFORMED_GEMINI_RESPONSE");
      }
      return {
        tldr: parsed.keyTakeaway.slice(0, 200),
        summary: parsed.summary
      };
    } catch (error) {
      logger.error("Failed to parse Gemini JSON response", { text, error });
      throw new Error("MALFORMED_GEMINI_RESPONSE");
    }
  }
}
function createGeminiService(apiKey, modelName) {
  return new GeminiService(apiKey, modelName);
}

class ContentWriterService {
  constructor(outputDir = "src/content/summaries") {
    this.outputDir = outputDir;
  }
  /**
   * Write a markdown file with frontmatter
   */
  async writeMarkdown(input) {
    const { videoId, metadata, summary } = input;
    const fullPath = path.join(process.cwd(), this.outputDir);
    await fs.mkdir(fullPath, { recursive: true });
    const content = this.generateMarkdown(input);
    const filePath = path.join(fullPath, `${videoId}.md`);
    await fs.writeFile(filePath, content, "utf-8");
    logger.info(`Written summary for ${videoId}`, {
      filePath,
      size: content.length
    });
    return filePath;
  }
  /**
   * Check if a summary file already exists
   */
  async exists(videoId) {
    const fullPath = path.join(process.cwd(), this.outputDir, `${videoId}.md`);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Generate markdown content with frontmatter
   */
  generateMarkdown(input) {
    const { videoId, metadata, summary } = input;
    const frontmatter = {
      title: this.escapeYaml(metadata.title),
      videoId,
      channel: this.escapeYaml(metadata.channel),
      channelId: metadata.channelId,
      duration: metadata.duration,
      publishedAt: metadata.publishedAt,
      processedAt: (/* @__PURE__ */ new Date()).toISOString(),
      source: "youtube",
      playlistId: process.env.YOUTUBE_PLAYLIST_ID || "",
      thumbnailUrl: metadata.thumbnailUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      modelUsed: summary.modelUsed
    };
    return `---
title: "${frontmatter.title}"
videoId: "${frontmatter.videoId}"
channel: "${frontmatter.channel}"
channelId: "${frontmatter.channelId}"
duration: "${frontmatter.duration}"
publishedAt: "${frontmatter.publishedAt}"
processedAt: "${frontmatter.processedAt}"
source: "${frontmatter.source}"
playlistId: "${frontmatter.playlistId}"
thumbnailUrl: "${frontmatter.thumbnailUrl}"
youtubeUrl: "${frontmatter.youtubeUrl}"
modelUsed: "${frontmatter.modelUsed}"
tldr: "${this.escapeYaml(summary.tldr)}"
---

${summary.summary}
`;
  }
  /**
   * Escape special characters in YAML strings
   */
  escapeYaml(str) {
    return str.replace(/"/g, '\\"').replace(/\n/g, " ");
  }
}
function createContentWriterService(outputDir) {
  return new ContentWriterService(outputDir);
}

async function syncPlaylist() {
  const config = loadConfig();
  logger.info("Starting playlist sync", {
    playlistId: config.youtubePlaylistId,
    processingMode: config.processingMode,
    maxVideos: config.maxVideosPerRun
  });
  const result = {
    processed: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  try {
    const youtubeService = createYouTubeService(config.youtubeApiKey);
    const geminiService = createGeminiService(config.geminiApiKey, config.geminiModel);
    const contentWriter = createContentWriterService(config.outputDir);
    logger.info("Fetching playlist items...");
    const playlistItems = await youtubeService.getPlaylistItems(config.youtubePlaylistId);
    if (playlistItems.length === 0) {
      logger.warn("No videos found in playlist");
      return result;
    }
    const processedChecks = await Promise.all(
      playlistItems.map((item) => contentWriter.exists(item.videoId))
    );
    const newVideos = playlistItems.filter(
      (item, index) => !processedChecks[index]
    );
    const alreadyProcessed = playlistItems.length - newVideos.length;
    logger.info(`Found ${newVideos.length} new videos (${alreadyProcessed} already processed)`);
    result.skipped = alreadyProcessed;
    const videosToProcess = newVideos.slice(0, config.maxVideosPerRun);
    if (videosToProcess.length < newVideos.length) {
      logger.info(`Processing ${videosToProcess.length} of ${newVideos.length} new videos (rate limit)`);
      result.skipped += newVideos.length - videosToProcess.length;
    }
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
    logger.info("Sync completed", result);
    return result;
  } catch (error) {
    logger.error("Sync failed catastrophically", { error });
    throw error;
  }
}
async function processVideo(videoId, config, youtubeService, geminiService, contentWriter) {
  const metadata = await youtubeService.getVideoMetadata(videoId);
  let transcript;
  let processingMode = config.processingMode;
  if (processingMode === "transcript") {
    try {
      transcript = await youtubeService.getTranscript(videoId);
    } catch (error) {
      if (config.enableProFallback && config.geminiModel.includes("pro")) {
        logger.warn(`Transcript unavailable, falling back to native video mode`, { videoId });
        processingMode = "native-video";
      } else {
        throw error;
      }
    }
  }
  const summary = await geminiService.generateSummary({
    metadata,
    transcript,
    mode: processingMode
  });
  await contentWriter.writeMarkdown({
    videoId,
    metadata,
    summary
  });
}

const sync_post = defineEventHandler(async () => {
  const result = await syncPlaylist();
  return result;
});

export { sync_post as default };
//# sourceMappingURL=sync.post.mjs.map
