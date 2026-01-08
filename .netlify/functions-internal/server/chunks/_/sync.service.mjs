import { y as youtubeApiLimiter, a as retryWithBackoff, l as logger, g as geminiProLimiter, b as geminiFlashLimiter, e as loadConfig } from '../nitro/nitro.mjs';
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

var __defProp$2 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, key + "" , value);
class YouTubeService {
  constructor(apiKey) {
    __publicField$2(this, "youtube");
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
    tldr: {
      type: "string",
      description: "A single sentence (max 400 chars) capturing the most important insight. Be specific - include names, numbers, or key terms. Can use bullet points (\u2022) for 2-3 related points.",
      nullable: false
    },
    keyTakeaways: {
      type: "string",
      description: "The 2-4 most important points from the video. Use markdown: start with a brief intro sentence, then bullet points (* or -) for each takeaway. Use **bold** for key terms. Multiple paragraphs OK.",
      nullable: false
    },
    summary: {
      type: "string",
      description: "Detailed summary of the video content. Use markdown: paragraphs, bullet lists, **bold** for key terms, ### for subsections if needed. Multiple paragraphs encouraged. 300-600 words.",
      nullable: false
    },
    context: {
      type: "string",
      description: "Background context and why this matters. Use markdown paragraphs. Explain the broader significance, who should care, or how this connects to larger trends. 50-150 words.",
      nullable: false
    }
  },
  required: ["tldr", "keyTakeaways", "summary", "context"]
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

Provide a summary with these four fields:

## tldr (max 400 characters)
- The single most important insight or actionable lesson
- Be specific: include names, numbers, methods, or key terminology
- Use bullet points (\u2022) only if there are 2-3 tightly related points
- Example BAD: "This video shares important productivity tips"
- Example GOOD: "The Pomodoro Technique: \u2022 25min work + 5min break \u2022 Start with hardest task \u2022 Track sessions"

## keyTakeaways
- Start with a brief intro sentence explaining the core message
- Then 2-4 bullet points with the key insights
- Use **bold** for important terms
- Answer: What should the reader know immediately?

## summary (300-600 words)
- Expand on the key points with supporting details
- Use multiple paragraphs - short ones (2-3 sentences each)
- Use bullet lists for steps, tips, or related points
- Use **bold** for key terms being introduced
- Use ### subsection headers if covering distinct topics
- Be information-dense, no filler

## context (50-150 words)
- Background: Why does this matter?
- Who should care about this?
- How does it connect to broader trends or applications?

Formatting rules:
- Use markdown within each field: **bold**, bullet points (* or -), ### headers
- Paragraphs should be separated by blank lines
- Keep paragraphs short and scannable
- DO NOT include the section headers (## Key Takeaways, etc.) - just the content`;
}

var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
const OPENROUTER_FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-r1-0528:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free"
];
class OpenRouterService {
  constructor(apiKey) {
    __publicField$1(this, "apiKey");
    __publicField$1(this, "baseUrl", "https://openrouter.ai/api/v1");
    this.apiKey = apiKey;
  }
  /**
   * Generate a summary using OpenRouter free models
   * Tries models in sequence until one succeeds
   */
  async generateSummary(input, preferredModel) {
    const modelsToTry = preferredModel ? [preferredModel, ...OPENROUTER_FREE_MODELS.filter((m) => m !== preferredModel)] : [...OPENROUTER_FREE_MODELS];
    let lastError = null;
    for (const model of modelsToTry) {
      try {
        logger.info(`Trying OpenRouter model: ${model}`, {
          videoId: input.metadata.videoId
        });
        const result = await this.callModel(model, input);
        return result;
      } catch (error) {
        lastError = error;
        const isQuotaError = this.isQuotaExceeded(error);
        logger.warn(`OpenRouter model ${model} failed`, {
          videoId: input.metadata.videoId,
          error: lastError.message,
          isQuotaError
        });
        if (!isQuotaError) {
          throw error;
        }
      }
    }
    throw new Error(`All OpenRouter models exhausted. Last error: ${lastError == null ? void 0 : lastError.message}`);
  }
  async callModel(model, input) {
    var _a, _b, _c, _d, _e;
    const prompt = buildSummaryPrompt({
      metadata: input.metadata,
      transcript: input.transcript
    });
    const systemPrompt = `You are a helpful assistant that summarizes YouTube videos.
You MUST respond with valid JSON in this exact format:
{
  "tldr": "A single sentence (max 400 chars) capturing the main point",
  "keyTakeaways": "Markdown bullet points with the 2-4 key insights",
  "summary": "Detailed summary paragraphs with markdown formatting",
  "context": "Background context paragraph explaining why this matters"
}
Do not include any text outside the JSON object.`;
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];
    const result = await retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://youtube-summarizer.app",
          "X-Title": "YouTube Summarizer"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4096
        })
      });
      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(`OpenRouter API error: ${response.status} - ${errorBody}`);
        error.status = response.status;
        error.body = errorBody;
        throw error;
      }
      return response.json();
    }, {
      maxRetries: 1,
      baseDelay: 2e3,
      onRetry: (error, attempt) => {
        logger.warn(`OpenRouter retry ${attempt}`, {
          model,
          videoId: input.metadata.videoId,
          error: error.message
        });
      }
    });
    const text = (_b = (_a = result.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content;
    if (!text) {
      throw new Error("Empty response from OpenRouter");
    }
    const parsed = this.parseResponse(text);
    const inputTokens = (_c = result.usage) == null ? void 0 : _c.prompt_tokens;
    const outputTokens = (_d = result.usage) == null ? void 0 : _d.completion_tokens;
    const totalTokens = (_e = result.usage) == null ? void 0 : _e.total_tokens;
    logger.info(`Summary generated via OpenRouter`, {
      videoId: input.metadata.videoId,
      model: result.model,
      tldrLength: parsed.tldr.length,
      inputTokens,
      outputTokens,
      totalTokens
    });
    return {
      ...parsed,
      modelUsed: `openrouter/${result.model}`,
      inputTokens,
      outputTokens,
      totalTokens
    };
  }
  parseResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.tldr || !parsed.keyTakeaways || !parsed.summary || !parsed.context) {
        logger.error("Missing required fields in OpenRouter response", { parsed });
        throw new Error("MALFORMED_OPENROUTER_RESPONSE");
      }
      const normalize = (s) => s.replace(/\\n/g, "\n");
      return {
        tldr: parsed.tldr.slice(0, 400),
        keyTakeaways: normalize(parsed.keyTakeaways),
        summary: normalize(parsed.summary),
        context: normalize(parsed.context)
      };
    } catch (error) {
      logger.error("Failed to parse OpenRouter JSON response", { text, error });
      throw new Error("MALFORMED_OPENROUTER_RESPONSE");
    }
  }
  isQuotaExceeded(error) {
    if (error instanceof Error) {
      const status = error.status;
      const message = error.message.toLowerCase();
      return status === 429 || status === 402 || message.includes("rate limit") || message.includes("quota") || message.includes("exceeded") || message.includes("too many requests");
    }
    return false;
  }
}
function createOpenRouterService(apiKey) {
  return new OpenRouterService(apiKey);
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-pro",
  // Best quality, 5 RPM free tier
  "gemini-2.5-flash",
  // Good balance, 10 RPM free tier
  "gemini-2.0-flash"
  // Most available, 15 RPM free tier
];
const MODEL_ATTEMPT_DELAY = 2e3;
class AIService {
  constructor(config) {
    __publicField(this, "genAI");
    __publicField(this, "primaryModel");
    __publicField(this, "openRouterApiKey");
    __publicField(this, "enableFallback");
    var _a;
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.primaryModel = config.primaryModel;
    this.openRouterApiKey = config.openRouterApiKey;
    this.enableFallback = (_a = config.enableFallback) != null ? _a : true;
  }
  /**
   * Generate a summary with automatic fallback on quota exhaustion
   * Fallback chain: Primary Model → Gemini Fallbacks → OpenRouter Free Models
   */
  async generateSummary(input) {
    const startTime = Date.now();
    const modelsToTry = this.buildFallbackChain();
    let lastError = null;
    let apiCalls = 0;
    let fallbackAttempts = 0;
    for (const modelName of modelsToTry) {
      try {
        logger.info(`Attempting Gemini model: ${modelName}`, {
          videoId: input.metadata.videoId,
          mode: input.mode,
          attempt: fallbackAttempts + 1
        });
        apiCalls++;
        const result = await this.callGemini(modelName, input);
        const metrics = {
          modelUsed: modelName,
          apiCalls,
          fallbackAttempts,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          processingTimeMs: Date.now() - startTime,
          provider: "gemini"
        };
        logger.info(`Summary generated with metrics`, {
          videoId: input.metadata.videoId,
          ...metrics
        });
        return {
          tldr: result.tldr,
          keyTakeaways: result.keyTakeaways,
          summary: result.summary,
          context: result.context,
          modelUsed: modelName,
          metrics
        };
      } catch (error) {
        lastError = error;
        fallbackAttempts++;
        const isRecoverableError = this.isRecoverableGeminiError(error);
        logger.warn(`Gemini model ${modelName} failed`, {
          videoId: input.metadata.videoId,
          error: lastError.message,
          isRecoverableError,
          willFallback: isRecoverableError && this.enableFallback,
          apiCalls,
          fallbackAttempts
        });
        if (!isRecoverableError || !this.enableFallback) {
          throw error;
        }
        logger.info(`Waiting ${MODEL_ATTEMPT_DELAY}ms before trying next model...`);
        await new Promise((resolve) => setTimeout(resolve, MODEL_ATTEMPT_DELAY));
      }
    }
    if (this.openRouterApiKey && this.enableFallback) {
      logger.info("All Gemini models exhausted, falling back to OpenRouter", {
        videoId: input.metadata.videoId,
        apiCalls,
        fallbackAttempts
      });
      try {
        apiCalls++;
        const openRouterService = createOpenRouterService(this.openRouterApiKey);
        const result = await openRouterService.generateSummary(input);
        const metrics = {
          modelUsed: result.modelUsed,
          apiCalls,
          fallbackAttempts,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          totalTokens: result.totalTokens,
          processingTimeMs: Date.now() - startTime,
          provider: "openrouter"
        };
        return {
          tldr: result.tldr,
          keyTakeaways: result.keyTakeaways,
          summary: result.summary,
          context: result.context,
          modelUsed: result.modelUsed,
          metrics
        };
      } catch (error) {
        logger.error("OpenRouter fallback also failed", {
          videoId: input.metadata.videoId,
          error: error.message,
          apiCalls,
          fallbackAttempts
        });
        throw error;
      }
    }
    throw new Error(
      `All AI models exhausted after ${apiCalls} API calls and ${fallbackAttempts} fallback attempts. Last error: ${lastError == null ? void 0 : lastError.message}. Configure OPEN_ROUTER_API_KEY for additional fallback options.`
    );
  }
  buildFallbackChain() {
    const chain = [this.primaryModel];
    if (this.enableFallback) {
      for (const model of GEMINI_FALLBACK_MODELS) {
        if (!chain.includes(model)) {
          chain.push(model);
        }
      }
    }
    return chain;
  }
  async callGemini(modelName, input) {
    const limiter = modelName.includes("pro") ? geminiProLimiter : geminiFlashLimiter;
    await limiter.acquire();
    const prompt = buildSummaryPrompt({
      metadata: input.metadata,
      transcript: input.transcript
    });
    const result = await retryWithBackoff(async () => {
      const model = this.genAI.getGenerativeModel({
        model: modelName,
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
      maxRetries: 1,
      // Fewer retries since we have fallback
      baseDelay: 2e3,
      onRetry: (error, attempt) => {
        logger.warn(`Gemini API retry ${attempt}`, {
          videoId: input.metadata.videoId,
          model: modelName,
          error: error.message
        });
      }
    });
    const text = result.response.text();
    const parsed = this.parseGeminiResponse(text);
    const usageMetadata = result.response.usageMetadata;
    const inputTokens = usageMetadata == null ? void 0 : usageMetadata.promptTokenCount;
    const outputTokens = usageMetadata == null ? void 0 : usageMetadata.candidatesTokenCount;
    const totalTokens = usageMetadata == null ? void 0 : usageMetadata.totalTokenCount;
    logger.info(`Summary generated via Gemini`, {
      videoId: input.metadata.videoId,
      model: modelName,
      tldrLength: parsed.tldr.length,
      inputTokens,
      outputTokens,
      totalTokens
    });
    return {
      ...parsed,
      inputTokens,
      outputTokens,
      totalTokens
    };
  }
  parseGeminiResponse(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed.tldr || !parsed.keyTakeaways || !parsed.summary || !parsed.context) {
        logger.error("Missing required fields in Gemini response", { parsed });
        throw new Error("MALFORMED_GEMINI_RESPONSE");
      }
      const normalize = (s) => s.replace(/\\n/g, "\n");
      return {
        tldr: parsed.tldr.slice(0, 400),
        keyTakeaways: normalize(parsed.keyTakeaways),
        summary: normalize(parsed.summary),
        context: normalize(parsed.context)
      };
    } catch (error) {
      logger.error("Failed to parse Gemini JSON response", { text, error });
      throw new Error("MALFORMED_GEMINI_RESPONSE");
    }
  }
  /**
   * Check if error is recoverable (should try next model in fallback chain)
   * Recoverable errors: quota exceeded (429), model not found (404)
   */
  isRecoverableGeminiError(error) {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const isQuotaError = message.includes("429") || message.includes("resource exhausted") || message.includes("quota") || message.includes("rate limit") || message.includes("too many requests") || message.includes("exceeded");
      const isModelNotFound = message.includes("404") || message.includes("not found") || message.includes("not supported");
      return isQuotaError || isModelNotFound;
    }
    return false;
  }
  /**
   * Get available models info for diagnostics
   */
  getAvailableModels() {
    return {
      gemini: this.buildFallbackChain(),
      openRouter: this.openRouterApiKey ? [...OPENROUTER_FREE_MODELS] : []
    };
  }
}
function createAIService(config) {
  return new AIService(config);
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
    const { metrics } = summary;
    const metricsLines = [];
    metricsLines.push(`aiProvider: "${metrics.provider}"`);
    metricsLines.push(`apiCalls: ${metrics.apiCalls}`);
    metricsLines.push(`fallbackAttempts: ${metrics.fallbackAttempts}`);
    if (metrics.inputTokens !== void 0) {
      metricsLines.push(`inputTokens: ${metrics.inputTokens}`);
    }
    if (metrics.outputTokens !== void 0) {
      metricsLines.push(`outputTokens: ${metrics.outputTokens}`);
    }
    if (metrics.totalTokens !== void 0) {
      metricsLines.push(`totalTokens: ${metrics.totalTokens}`);
    }
    metricsLines.push(`processingTimeMs: ${metrics.processingTimeMs}`);
    const body = this.assembleMarkdownBody(summary);
    return `---
title: "${this.escapeYaml(metadata.title)}"
videoId: "${videoId}"
channel: "${this.escapeYaml(metadata.channel)}"
channelId: "${metadata.channelId}"
duration: "${metadata.duration}"
publishedAt: "${metadata.publishedAt}"
processedAt: "${(/* @__PURE__ */ new Date()).toISOString()}"
source: "youtube"
playlistId: "${process.env.YOUTUBE_PLAYLIST_ID || ""}"
thumbnailUrl: "${metadata.thumbnailUrl}"
youtubeUrl: "https://www.youtube.com/watch?v=${videoId}"
modelUsed: "${summary.modelUsed}"
tldr: "${this.escapeYaml(summary.tldr)}"
# AI Processing Metrics
${metricsLines.join("\n")}
---

${body}
`;
  }
  /**
   * Assemble markdown body from structured sections.
   * We control the headers, AI provides the content.
   */
  assembleMarkdownBody(summary) {
    var _a, _b, _c;
    const sections = [];
    if ((_a = summary.keyTakeaways) == null ? void 0 : _a.trim()) {
      sections.push(`## Key Takeaways

${this.normalizeSectionContent(summary.keyTakeaways)}`);
    }
    if ((_b = summary.summary) == null ? void 0 : _b.trim()) {
      sections.push(`## Summary

${this.normalizeSectionContent(summary.summary)}`);
    }
    if ((_c = summary.context) == null ? void 0 : _c.trim()) {
      sections.push(`## Context

${this.normalizeSectionContent(summary.context)}`);
    }
    return sections.join("\n\n");
  }
  /**
   * Normalize section content to ensure proper line breaks.
   * Fixes: bullet points on same line, missing paragraph breaks, ### headers.
   */
  normalizeSectionContent(content) {
    let normalized = content.trim();
    normalized = normalized.replace(/([.!?:])(\s+)([-*])\s/g, "$1\n\n$3 ").replace(/([a-z])(\s+)([-*])\s/g, "$1\n\n$3 ");
    normalized = normalized.replace(/([^\n])(###\s)/g, "$1\n\n$2");
    normalized = normalized.replace(/([a-z])([A-Z][a-z])/g, "$1\n\n$2");
    normalized = normalized.replace(/\n{3,}/g, "\n\n");
    return normalized;
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

async function syncPlaylist(onProgress) {
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
    const aiService = createAIService({
      geminiApiKey: config.geminiApiKey,
      primaryModel: config.geminiModel,
      openRouterApiKey: config.openRouterApiKey,
      enableFallback: config.enableModelFallback
    });
    const contentWriter = createContentWriterService(config.outputDir);
    const availableModels = aiService.getAvailableModels();
    logger.info("AI service initialized with fallback chain", {
      primary: config.geminiModel,
      geminiFallbacks: availableModels.gemini.slice(1),
      openRouterFallbacks: availableModels.openRouter.length > 0 ? availableModels.openRouter : "not configured"
    });
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
    const VIDEO_PROCESSING_DELAY = 3e4;
    onProgress == null ? void 0 : onProgress({
      type: "start",
      total: videosToProcess.length
    });
    for (const [index, item] of videosToProcess.entries()) {
      if (index > 0) {
        logger.info(`Waiting ${VIDEO_PROCESSING_DELAY / 1e3}s before next video (rate limiting)...`);
        await new Promise((resolve) => setTimeout(resolve, VIDEO_PROCESSING_DELAY));
      }
      logger.info(`Processing video ${index + 1}/${videosToProcess.length}: ${item.videoId}`);
      onProgress == null ? void 0 : onProgress({
        type: "processing",
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
    onProgress == null ? void 0 : onProgress({
      type: "complete",
      result
    });
    logger.info("Sync completed", result);
    return result;
  } catch (error) {
    onProgress == null ? void 0 : onProgress({
      type: "error",
      error: error instanceof Error ? error.message : String(error)
    });
    logger.error("Sync failed catastrophically", { error });
    throw error;
  }
}
async function processVideo(videoId, config, youtubeService, aiService, contentWriter) {
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
  const summary = await aiService.generateSummary({
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

export { syncPlaylist as s };
//# sourceMappingURL=sync.service.mjs.map
