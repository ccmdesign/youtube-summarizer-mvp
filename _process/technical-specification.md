# YouTube Summarizer MVP — Technical Specification

**Project**: YouTube Playlist Summarizer
**Version**: 1.0.0
**Date**: 2025-12-31
**Framework**: Nuxt 4 + Nuxt Content
**Scope**: CLI-triggered backend pipeline (no UI for MVP)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Module Specifications](#module-specifications)
5. [Database Schema](#database-schema)
6. [API Integration](#api-integration)
7. [Configuration](#configuration)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Future Considerations](#future-considerations)

---

## System Overview

### Purpose

Automatically fetch videos from a YouTube playlist, generate AI-powered summaries using Google Gemini API, and save them as Markdown files compatible with Nuxt Content for future web interface integration.

### Key Features

- **CLI-triggered processing**: Manual execution via `npm run sync-playlist`
- **Idempotent operations**: Skip already-processed videos (file existence check)
- **Dual processing modes**: Transcript-based (Flash) and Native video (Pro)
- **Structured output**: Markdown files with frontmatter for Nuxt Content
- **State persistence**: SQLite database for tracking processing history
- **Rate limit protection**: Configurable batch processing

### Non-Goals (MVP)

- Web UI for triggering sync
- Automated scheduling (cron jobs)
- Real-time playlist monitoring
- Multi-playlist support
- Summary regeneration workflow

---

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                       CLI Entry Point                        │
│                  (npm run sync-playlist)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Orchestration Layer                        │
│              (src/server/services/sync.ts)                   │
│  • Coordinate workflow                                       │
│  • Manage state transitions                                  │
│  • Aggregate results                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌──────────────┐
│  YouTube    │ │  Gemini     │ │  Content     │
│  Service    │ │  Service    │ │  Writer      │
│             │ │             │ │              │
│ • Playlist  │ │ • Summarize │ │ • Generate   │
│   fetching  │ │   content   │ │   markdown   │
│ • Video     │ │ • Parse     │ │ • Write to   │
│   metadata  │ │   response  │ │   filesystem │
│ • Transcript│ │             │ │              │
└─────────────┘ └─────────────┘ └──────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │    SQLite Database      │
        │  (state persistence)    │
        │                         │
        │  • processing_history   │
        │  • playlist_snapshots   │
        │  • error_log            │
        └─────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   Content Directory     │
        │ src/content/summaries/  │
        │                         │
        │  • {videoId}.md files   │
        │  • Auto-indexed by      │
        │    Nuxt Content         │
        └─────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Nuxt 4.2.0 | SSR framework, future UI host |
| Content Engine | @nuxt/content 3.7.1 | Markdown file management, querying |
| Runtime | Node.js 18+ | Script execution environment |
| Database | better-sqlite3 | Local state persistence |
| AI Provider | @google/generative-ai | Gemini 2.5 Flash/Pro API |
| YouTube API | googleapis | YouTube Data API v3 client |
| Transcripts | youtube-transcript | Extract video transcripts |
| Validation | zod | Schema validation |
| Testing | Vitest + @nuxt/test-utils | Unit and integration tests |

### Directory Structure

```
src/
├── server/
│   ├── services/
│   │   ├── sync.ts                    # Main orchestration service
│   │   ├── youtube.service.ts          # YouTube API integration
│   │   ├── gemini.service.ts           # Gemini API integration
│   │   └── content-writer.service.ts   # Markdown file generation
│   ├── utils/
│   │   ├── logger.ts                   # Structured logging
│   │   ├── rate-limiter.ts             # API rate limiting
│   │   └── retry.ts                    # Exponential backoff retry
│   ├── db/
│   │   ├── schema.ts                   # Database schema definitions
│   │   ├── migrations/                 # SQLite migrations
│   │   └── client.ts                   # Database connection
│   └── cli/
│       └── sync-playlist.ts            # CLI entry point
├── content/
│   └── summaries/                      # Generated markdown files
│       └── {videoId}.md
├── types/
│   ├── youtube.ts                      # YouTube API types
│   ├── gemini.ts                       # Gemini API types
│   └── summary.ts                      # Summary data structures
└── tests/
    ├── services/
    │   ├── sync.test.ts
    │   ├── youtube.test.ts
    │   ├── gemini.test.ts
    │   └── content-writer.test.ts
    └── integration/
        └── end-to-end.test.ts

scripts/
└── sync-playlist.ts                    # npm script wrapper
```

---

## Data Flow

### Primary Workflow

```
START: npm run sync-playlist
  │
  ▼
1. Load configuration from .env + nuxt.config
  │
  ▼
2. Initialize database connection
  │
  ▼
3. Fetch playlist items from YouTube Data API
  │  - GET /youtube/v3/playlistItems?playlistId={ID}
  │  - Pagination handling (max 50 per page)
  │
  ▼
4. Check existing summaries
  │  - Query: SELECT video_id FROM processing_history WHERE status = 'completed'
  │  - File existence check: fs.existsSync(`content/summaries/${videoId}.md`)
  │
  ▼
5. Filter new videos (not in DB or no file)
  │
  ▼
6. For each video (up to maxVideosPerRun):
  │
  ├─▶ 6a. Fetch video metadata
  │   │   - GET /youtube/v3/videos?id={videoId}
  │   │   - Extract: title, channel, duration, publishedAt
  │   │
  │   ▼
  ├─▶ 6b. Get transcript
  │   │   - If mode = 'transcript': Use youtube-transcript package
  │   │   - If mode = 'native-video': Skip (Gemini handles)
  │   │   - Handle errors: retry once, fallback to native if Pro enabled
  │   │
  │   ▼
  ├─▶ 6c. Generate summary via Gemini
  │   │   - Flash mode: Send transcript text
  │   │   - Pro mode: Send YouTube URL
  │   │   - Parse structured response (TL;DR + Summary)
  │   │
  │   ▼
  ├─▶ 6d. Write markdown file
  │   │   - Generate frontmatter with metadata
  │   │   - Write to content/summaries/{videoId}.md
  │   │
  │   ▼
  └─▶ 6e. Update database
      │   - INSERT processing_history (video_id, status, processed_at, model_used)
      │   - Log success
      │
      ▼
7. Generate summary report
  │  - Videos processed: X
  │  - Videos skipped: Y
  │  - Errors: Z
  │
  ▼
END: Exit with code 0 (success) or 1 (partial failure)
```

### Error Handling Flow

```
Error Occurs
  │
  ├─▶ Transcript unavailable
  │   │
  │   ├─▶ If Pro mode enabled → Fallback to native video
  │   └─▶ Else → Log warning, skip video, continue
  │
  ├─▶ Gemini API error (rate limit, timeout)
  │   │
  │   └─▶ Retry with exponential backoff (max 2 retries)
  │       │
  │       ├─▶ Success → Continue
  │       └─▶ Failure → Log error, mark as failed, continue
  │
  ├─▶ YouTube API quota exceeded
  │   │
  │   └─▶ Stop processing, log error with quota reset time, exit
  │
  ├─▶ Malformed Gemini response
  │   │
  │   └─▶ Log raw response, mark as failed, continue
  │
  └─▶ File write error
      │
      └─▶ Log error, mark as failed, continue
```

---

## Module Specifications

### 1. CLI Entry Point

**File**: `scripts/sync-playlist.ts`

**Purpose**: Wrapper script invoked by `npm run sync-playlist`

**Responsibilities**:
- Load environment variables
- Initialize logger
- Call orchestration service
- Handle process exit codes

**Implementation**:

```typescript
import dotenv from 'dotenv';
import { syncPlaylist } from '~/server/services/sync';
import { logger } from '~/server/utils/logger';

dotenv.config();

async function main() {
  try {
    logger.info('Starting playlist sync...');
    const result = await syncPlaylist();

    logger.info('Sync completed', {
      processed: result.processed,
      skipped: result.skipped,
      failed: result.failed
    });

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Sync failed', { error });
    process.exit(1);
  }
}

main();
```

**Package.json script**:

```json
{
  "scripts": {
    "sync-playlist": "tsx scripts/sync-playlist.ts"
  }
}
```

---

### 2. Orchestration Service

**File**: `src/server/services/sync.ts`

**Purpose**: Coordinate the entire sync workflow

**Public API**:

```typescript
interface SyncResult {
  processed: number;
  skipped: number;
  failed: number;
  errors: Array<{ videoId: string; error: string }>;
}

export async function syncPlaylist(): Promise<SyncResult>;
```

**Core Logic**:

```typescript
export async function syncPlaylist(): Promise<SyncResult> {
  const config = loadConfig();
  const db = initializeDatabase();

  // 1. Fetch playlist items
  const playlistItems = await youtubeService.getPlaylistItems(
    config.playlistId
  );

  // 2. Filter new videos
  const existingSummaries = await db.getCompletedVideos();
  const newVideos = playlistItems.filter(
    item => !existingSummaries.includes(item.videoId)
  );

  // 3. Process videos (respecting maxVideosPerRun)
  const videosToProcess = newVideos.slice(0, config.maxVideosPerRun);

  const result: SyncResult = {
    processed: 0,
    skipped: newVideos.length - videosToProcess.length,
    failed: 0,
    errors: []
  };

  for (const video of videosToProcess) {
    try {
      await processVideo(video, config);
      result.processed++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        videoId: video.videoId,
        error: error.message
      });
    }
  }

  return result;
}

async function processVideo(video: PlaylistItem, config: Config) {
  // 1. Get metadata
  const metadata = await youtubeService.getVideoMetadata(video.videoId);

  // 2. Get transcript (if needed)
  let transcript: string | null = null;
  if (config.processingMode === 'transcript') {
    transcript = await youtubeService.getTranscript(video.videoId);
  }

  // 3. Generate summary
  const summary = await geminiService.generateSummary({
    metadata,
    transcript,
    mode: config.processingMode
  });

  // 4. Write markdown
  await contentWriterService.writeMarkdown({
    videoId: video.videoId,
    metadata,
    summary
  });

  // 5. Update database
  await db.recordProcessing({
    videoId: video.videoId,
    status: 'completed',
    modelUsed: config.geminiModel,
    processedAt: new Date()
  });
}
```

---

### 3. YouTube Service

**File**: `src/server/services/youtube.service.ts`

**Purpose**: Interact with YouTube Data API v3

**Public API**:

```typescript
interface PlaylistItem {
  videoId: string;
  title: string;
  position: number;
}

interface VideoMetadata {
  videoId: string;
  title: string;
  channel: string;
  channelId: string;
  duration: string; // ISO 8601 format
  publishedAt: string; // ISO 8601
  thumbnailUrl: string;
}

class YouTubeService {
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]>;
  async getVideoMetadata(videoId: string): Promise<VideoMetadata>;
  async getTranscript(videoId: string): Promise<string>;
}

export const youtubeService = new YouTubeService();
```

**Implementation Details**:

```typescript
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';

export class YouTubeService {
  private youtube;

  constructor() {
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined;

    do {
      const response = await retryWithBackoff(() =>
        this.youtube.playlistItems.list({
          part: ['snippet'],
          playlistId,
          maxResults: 50,
          pageToken
        })
      );

      items.push(...response.data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        position: item.snippet.position
      })));

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    logger.info(`Fetched ${items.length} videos from playlist ${playlistId}`);
    return items;
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    });

    const video = response.data.items[0];
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    return {
      videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      duration: video.contentDetails.duration,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails.high.url
    };
  }

  async getTranscript(videoId: string): Promise<string> {
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map(entry => entry.text).join(' ');
    } catch (error) {
      logger.warn(`Transcript unavailable for ${videoId}`, { error });
      throw new Error('TRANSCRIPT_UNAVAILABLE');
    }
  }
}
```

**Error Handling**:
- **Quota exceeded**: Throw `QUOTA_EXCEEDED` error, stop processing
- **Video not found**: Log warning, skip video
- **Network errors**: Retry with exponential backoff (max 2 retries)

---

### 4. Gemini Service

**File**: `src/server/services/gemini.service.ts`

**Purpose**: Generate summaries using Google Gemini API

**Public API**:

```typescript
interface SummaryInput {
  metadata: VideoMetadata;
  transcript?: string;
  mode: 'transcript' | 'native-video';
}

interface SummaryOutput {
  tldr: string;
  summary: string;
  modelUsed: string;
}

class GeminiService {
  async generateSummary(input: SummaryInput): Promise<SummaryOutput>;
}

export const geminiService = new GeminiService();
```

**Implementation**:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';

export class GeminiService {
  private genAI;
  private model;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
    });
  }

  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    const prompt = this.buildPrompt(input);

    const result = await retryWithBackoff(async () => {
      if (input.mode === 'native-video') {
        return await this.model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'video/youtube',
              data: `https://www.youtube.com/watch?v=${input.metadata.videoId}`
            }
          }
        ]);
      } else {
        return await this.model.generateContent(prompt);
      }
    });

    const text = result.response.text();
    const parsed = this.parseResponse(text);

    return {
      ...parsed,
      modelUsed: this.model.model
    };
  }

  private buildPrompt(input: SummaryInput): string {
    const { metadata, transcript } = input;

    return `You are summarizing a YouTube video for a personal knowledge base.

Video Title: ${metadata.title}
Channel: ${metadata.channel}
Duration: ${metadata.duration}
Published: ${metadata.publishedAt}

${transcript ? `Transcript:\n${transcript}\n\n` : ''}

Provide:
1. A TL;DR (max 200 characters, no quotes)
2. A comprehensive summary (up to 1000 words, but shorter if the content is simple)

Focus on:
- Key insights and main arguments
- Actionable takeaways
- Notable quotes or statistics (paraphrased)

Do not include filler. Be direct and information-dense.

Respond in this exact format:
TL;DR: [your tldr here]

SUMMARY:
[your summary here]`;
  }

  private parseResponse(text: string): { tldr: string; summary: string } {
    const tldrMatch = text.match(/TL;DR:\s*(.+?)(?=\n\n|SUMMARY:)/s);
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/s);

    if (!tldrMatch || !summaryMatch) {
      throw new Error('MALFORMED_GEMINI_RESPONSE');
    }

    return {
      tldr: tldrMatch[1].trim().slice(0, 200),
      summary: summaryMatch[1].trim()
    };
  }
}
```

**Prompt Engineering**:
- Clear structure: TL;DR + Summary
- Length constraints enforced
- Focus on actionable insights
- No filler language

**Rate Limiting**:
- Implement token-bucket algorithm
- Respect Gemini API rate limits (60 requests/minute for Flash)

---

### 5. Content Writer Service

**File**: `src/server/services/content-writer.service.ts`

**Purpose**: Generate and write Markdown files to filesystem

**Public API**:

```typescript
interface MarkdownInput {
  videoId: string;
  metadata: VideoMetadata;
  summary: SummaryOutput;
}

class ContentWriterService {
  async writeMarkdown(input: MarkdownInput): Promise<void>;
}

export const contentWriterService = new ContentWriterService();
```

**Implementation**:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { logger } from '~/server/utils/logger';

export class ContentWriterService {
  private outputDir = path.join(process.cwd(), 'src/content/summaries');

  async writeMarkdown(input: MarkdownInput): Promise<void> {
    const { videoId, metadata, summary } = input;

    // Ensure directory exists
    await fs.mkdir(this.outputDir, { recursive: true });

    const content = this.generateMarkdown(input);
    const filePath = path.join(this.outputDir, `${videoId}.md`);

    await fs.writeFile(filePath, content, 'utf-8');

    logger.info(`Written summary for ${videoId}`, { filePath });
  }

  private generateMarkdown(input: MarkdownInput): string {
    const { videoId, metadata, summary } = input;

    return `---
title: "${this.escapeYaml(metadata.title)}"
videoId: "${videoId}"
channel: "${this.escapeYaml(metadata.channel)}"
channelId: "${metadata.channelId}"
duration: "${metadata.duration}"
publishedAt: "${metadata.publishedAt}"
processedAt: "${new Date().toISOString()}"
source: "youtube"
playlistId: "${process.env.YOUTUBE_PLAYLIST_ID}"
thumbnailUrl: "${metadata.thumbnailUrl}"
youtubeUrl: "https://www.youtube.com/watch?v=${videoId}"
modelUsed: "${summary.modelUsed}"
---

## TL;DR

${summary.tldr}

## Summary

${summary.summary}
`;
  }

  private escapeYaml(str: string): string {
    return str.replace(/"/g, '\\"');
  }
}
```

**Frontmatter Schema**:

```yaml
title: string          # Video title
videoId: string        # YouTube video ID
channel: string        # Channel name
channelId: string      # Channel ID
duration: string       # ISO 8601 duration
publishedAt: string    # ISO 8601 timestamp
processedAt: string    # ISO 8601 timestamp
source: "youtube"      # Fixed value
playlistId: string     # Source playlist
thumbnailUrl: string   # Video thumbnail
youtubeUrl: string     # Full YouTube URL
modelUsed: string      # Gemini model used
```

---

## Database Schema

### Technology Choice

**SQLite** via `better-sqlite3` (already in dependencies)

**Rationale**:
- Local file-based database (no server needed)
- Sufficient for MVP scale (< 10,000 videos)
- Simple backup (copy .db file)
- Zero configuration
- Compatible with Nuxt environment

### Schema Definition

**File**: `src/server/db/schema.ts`

```typescript
export interface ProcessingHistory {
  id: number;
  video_id: string;
  status: 'completed' | 'failed' | 'skipped';
  processed_at: string; // ISO 8601
  model_used: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSnapshot {
  id: number;
  playlist_id: string;
  video_id: string;
  position: number;
  snapshot_date: string; // ISO 8601
}

export interface ErrorLog {
  id: number;
  video_id: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  occurred_at: string;
}
```

### Migration Script

**File**: `src/server/db/migrations/001_initial_schema.sql`

```sql
-- Processing history table
CREATE TABLE IF NOT EXISTS processing_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('completed', 'failed', 'skipped')),
  processed_at TEXT NOT NULL,
  model_used TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_video_id ON processing_history(video_id);
CREATE INDEX idx_status ON processing_history(status);

-- Playlist snapshots (for future multi-playlist support)
CREATE TABLE IF NOT EXISTS playlist_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  snapshot_date TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(playlist_id, video_id, snapshot_date)
);

CREATE INDEX idx_playlist_id ON playlist_snapshots(playlist_id);

-- Error log
CREATE TABLE IF NOT EXISTS error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_error_type ON error_log(error_type);
CREATE INDEX idx_occurred_at ON error_log(occurred_at);
```

### Database Client

**File**: `src/server/db/client.ts`

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { ProcessingHistory } from './schema';

class DatabaseClient {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), '.data', 'youtube-summarizer.db');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    this.db = new Database(dbPath);
    this.runMigrations();
  }

  private runMigrations() {
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    this.db.exec(migration);
  }

  getCompletedVideos(): string[] {
    const stmt = this.db.prepare(`
      SELECT video_id FROM processing_history
      WHERE status = 'completed'
    `);
    return stmt.all().map((row: any) => row.video_id);
  }

  recordProcessing(data: Omit<ProcessingHistory, 'id' | 'created_at' | 'updated_at'>) {
    const stmt = this.db.prepare(`
      INSERT INTO processing_history
      (video_id, status, processed_at, model_used, error_message, retry_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.video_id,
      data.status,
      data.processed_at,
      data.model_used,
      data.error_message,
      data.retry_count
    );
  }

  logError(videoId: string, errorType: string, errorMessage: string, stackTrace?: string) {
    const stmt = this.db.prepare(`
      INSERT INTO error_log (video_id, error_type, error_message, stack_trace, occurred_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(videoId, errorType, errorMessage, stackTrace);
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseClient();
```

---

## API Integration

### YouTube Data API v3

**Authentication**: API key (server-side only)

**Endpoints Used**:

| Endpoint | Purpose | Quota Cost |
|----------|---------|------------|
| `playlistItems.list` | Fetch all videos in playlist | 1 unit/request |
| `videos.list` | Get video metadata (title, duration, etc.) | 1 unit/request |

**Rate Limits**:
- Default quota: 10,000 units/day
- Can request increase via Google Cloud Console

**Quota Management**:
```typescript
class QuotaManager {
  private dailyQuota = 10000;
  private used = 0;

  checkQuota(cost: number) {
    if (this.used + cost > this.dailyQuota) {
      throw new Error('QUOTA_EXCEEDED');
    }
    this.used += cost;
  }
}
```

### Google Gemini API

**Authentication**: API key from Google AI Studio

**Models**:

| Model | Use Case | Cost (per 1M tokens) | Rate Limit |
|-------|----------|---------------------|------------|
| `gemini-2.0-flash-exp` | Transcript-based summaries | Free (current) | 60 RPM |
| `gemini-2.0-pro-exp` | Native video processing | TBD | 10 RPM |

**Request Format (Transcript Mode)**:

```typescript
{
  model: "gemini-2.0-flash-exp",
  contents: [{
    parts: [{
      text: `${prompt}\n\nTranscript: ${transcript}`
    }]
  }]
}
```

**Request Format (Native Video Mode)**:

```typescript
{
  model: "gemini-2.0-pro-exp",
  contents: [{
    parts: [
      { text: prompt },
      {
        inlineData: {
          mimeType: "video/youtube",
          data: "https://www.youtube.com/watch?v={videoId}"
        }
      }
    ]
  }]
}
```

**Error Handling**:
- `429 RESOURCE_EXHAUSTED`: Rate limit hit → Retry with exponential backoff
- `400 INVALID_ARGUMENT`: Malformed request → Log and skip
- `500 INTERNAL`: Server error → Retry once

---

## Configuration

### Environment Variables

**File**: `.env` (not committed)

```env
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxxxxxxxxxx

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Processing Configuration
PROCESSING_MODE=transcript  # or 'native-video'
MAX_VIDEOS_PER_RUN=10
ENABLE_PRO_FALLBACK=false

# Database
DATABASE_PATH=.data/youtube-summarizer.db

# Output
OUTPUT_DIR=src/content/summaries
```

### Nuxt Configuration

**File**: `src/nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    youtubePlaylistId: process.env.YOUTUBE_PLAYLIST_ID,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',

    public: {
      // Public config for future UI
    }
  },

  content: {
    sources: {
      summaries: {
        driver: 'fs',
        prefix: '/summaries',
        base: resolve(__dirname, 'content/summaries')
      }
    }
  }
});
```

### Configuration Schema Validation

**File**: `src/server/utils/config.ts`

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  youtubeApiKey: z.string().min(1),
  youtubePlaylistId: z.string().regex(/^PL[a-zA-Z0-9_-]{32}$/),
  geminiApiKey: z.string().min(1),
  geminiModel: z.enum(['gemini-2.0-flash-exp', 'gemini-2.0-pro-exp']),
  processingMode: z.enum(['transcript', 'native-video']),
  maxVideosPerRun: z.number().int().positive().max(50),
  enableProFallback: z.boolean()
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const config = {
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    youtubePlaylistId: process.env.YOUTUBE_PLAYLIST_ID,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    processingMode: process.env.PROCESSING_MODE || 'transcript',
    maxVideosPerRun: parseInt(process.env.MAX_VIDEOS_PER_RUN || '10'),
    enableProFallback: process.env.ENABLE_PRO_FALLBACK === 'true'
  };

  return ConfigSchema.parse(config);
}
```

---

## Error Handling

### Error Types

```typescript
enum ErrorType {
  TRANSCRIPT_UNAVAILABLE = 'TRANSCRIPT_UNAVAILABLE',
  GEMINI_RATE_LIMIT = 'GEMINI_RATE_LIMIT',
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  YOUTUBE_QUOTA_EXCEEDED = 'YOUTUBE_QUOTA_EXCEEDED',
  YOUTUBE_VIDEO_NOT_FOUND = 'YOUTUBE_VIDEO_NOT_FOUND',
  MALFORMED_RESPONSE = 'MALFORMED_RESPONSE',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### Error Handling Matrix

| Error Type | Action | Retry | Log Level | Skip Video |
|------------|--------|-------|-----------|------------|
| TRANSCRIPT_UNAVAILABLE | Fallback to Pro (if enabled) | No | WARN | Yes (if no fallback) |
| GEMINI_RATE_LIMIT | Exponential backoff | Yes (2x) | WARN | No |
| GEMINI_API_ERROR | Retry once | Yes (1x) | ERROR | Yes (after retry) |
| YOUTUBE_QUOTA_EXCEEDED | Stop processing | No | ERROR | N/A (halt) |
| YOUTUBE_VIDEO_NOT_FOUND | Skip video | No | WARN | Yes |
| MALFORMED_RESPONSE | Log raw response | No | ERROR | Yes |
| FILE_WRITE_ERROR | Retry write | Yes (1x) | ERROR | Yes (after retry) |
| DATABASE_ERROR | Retry transaction | Yes (2x) | ERROR | No |

### Retry Utility

**File**: `src/server/utils/retry.ts`

```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        const delay = baseDelay * Math.pow(2, i);
        logger.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`, { error });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### Structured Logging

**File**: `src/server/utils/logger.ts`

```typescript
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({
      filename: '.data/logs/error.log',
      level: 'error'
    }),
    new transports.File({
      filename: '.data/logs/combined.log'
    })
  ]
});
```

---

## Testing Strategy

### Test Coverage Goals

| Layer | Coverage Target | Priority |
|-------|----------------|----------|
| Services | 90% | High |
| Utilities | 95% | High |
| Database | 80% | Medium |
| Integration | 70% | Medium |

### Unit Tests

**Test Files**:
- `src/tests/services/youtube.test.ts`
- `src/tests/services/gemini.test.ts`
- `src/tests/services/content-writer.test.ts`
- `src/tests/utils/retry.test.ts`
- `src/tests/utils/logger.test.ts`

**Example: YouTube Service Test**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeService } from '~/server/services/youtube.service';

describe('YouTubeService', () => {
  let service: YouTubeService;

  beforeEach(() => {
    service = new YouTubeService();
  });

  describe('getPlaylistItems', () => {
    it('fetches all items with pagination', async () => {
      // Mock youtube.playlistItems.list
      const mockResponse = {
        data: {
          items: [
            { snippet: { resourceId: { videoId: 'abc123' }, title: 'Test Video', position: 0 } }
          ],
          nextPageToken: null
        }
      };

      vi.spyOn(service['youtube'].playlistItems, 'list').mockResolvedValue(mockResponse);

      const items = await service.getPlaylistItems('PLtest');

      expect(items).toHaveLength(1);
      expect(items[0].videoId).toBe('abc123');
    });

    it('handles quota exceeded error', async () => {
      vi.spyOn(service['youtube'].playlistItems, 'list').mockRejectedValue(
        new Error('QUOTA_EXCEEDED')
      );

      await expect(service.getPlaylistItems('PLtest')).rejects.toThrow('QUOTA_EXCEEDED');
    });
  });

  describe('getTranscript', () => {
    it('returns transcript text', async () => {
      // Mock YoutubeTranscript
      const mockTranscript = [
        { text: 'Hello', start: 0, duration: 1 },
        { text: 'World', start: 1, duration: 1 }
      ];

      vi.mock('youtube-transcript', () => ({
        YoutubeTranscript: {
          fetchTranscript: vi.fn().mockResolvedValue(mockTranscript)
        }
      }));

      const transcript = await service.getTranscript('abc123');
      expect(transcript).toBe('Hello World');
    });

    it('throws TRANSCRIPT_UNAVAILABLE when not found', async () => {
      vi.mock('youtube-transcript', () => ({
        YoutubeTranscript: {
          fetchTranscript: vi.fn().mockRejectedValue(new Error('Not found'))
        }
      }));

      await expect(service.getTranscript('abc123')).rejects.toThrow('TRANSCRIPT_UNAVAILABLE');
    });
  });
});
```

### Integration Tests

**File**: `src/tests/integration/end-to-end.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { syncPlaylist } from '~/server/services/sync';
import fs from 'fs/promises';
import path from 'path';

describe('End-to-End Sync', () => {
  beforeAll(async () => {
    // Set up test environment
    process.env.YOUTUBE_PLAYLIST_ID = 'PLtest';
    process.env.MAX_VIDEOS_PER_RUN = '2';
  });

  afterAll(async () => {
    // Clean up test files
    const testDir = path.join(process.cwd(), 'src/content/summaries');
    const files = await fs.readdir(testDir);
    await Promise.all(
      files
        .filter(f => f.startsWith('test_'))
        .map(f => fs.unlink(path.join(testDir, f)))
    );
  });

  it('processes new videos and skips existing', async () => {
    const result = await syncPlaylist();

    expect(result.processed).toBeGreaterThan(0);
    expect(result.failed).toBe(0);

    // Verify markdown files created
    const files = await fs.readdir('src/content/summaries');
    expect(files.length).toBeGreaterThan(0);

    // Verify frontmatter structure
    const content = await fs.readFile(
      path.join('src/content/summaries', files[0]),
      'utf-8'
    );

    expect(content).toMatch(/^---/);
    expect(content).toContain('videoId:');
    expect(content).toContain('## TL;DR');
    expect(content).toContain('## Summary');
  });
});
```

### Test Commands

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

---

## Deployment

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd youtube-summarizer-mvp

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run initial sync
npm run sync-playlist

# 5. Verify output
ls src/content/summaries/

# 6. Query summaries via Nuxt Content
npm run dev
# Visit /api/_content/query?path=/summaries
```

### CI/CD (Future)

**GitHub Actions Workflow** (`.github/workflows/sync.yml`):

```yaml
name: Sync YouTube Playlist

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'

      - run: npm ci

      - name: Sync playlist
        env:
          YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
          YOUTUBE_PLAYLIST_ID: ${{ secrets.YOUTUBE_PLAYLIST_ID }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run sync-playlist

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add src/content/summaries/
          git commit -m "chore: sync playlist summaries [skip ci]" || exit 0
          git push
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database directory created (`.data/`)
- [ ] Output directory writable (`src/content/summaries/`)
- [ ] API keys valid and quota sufficient
- [ ] Log directory exists (`.data/logs/`)
- [ ] Nuxt build successful (`npm run build`)
- [ ] Initial sync test passed (`npm run sync-playlist`)

---

## Future Considerations

### Phase 2: Web UI

**Features to add**:
- Summary browser (grid/list view)
- Search and filtering
- Video embedding
- Manual re-summarization
- Playlist management UI

**Required changes**:
- Add pages in `src/pages/summaries/`
- Create UI components for summary display
- Add Nuxt Content queries in composables
- Implement search with Fuse.js or similar

### Phase 3: Automation

**Cron job setup**:
- GitHub Actions workflow (shown above)
- Or Vercel cron job using `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "0 2 * * *"
  }]
}
```

**API endpoint** (`src/server/api/cron/sync.ts`):

```typescript
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    throw createError({ statusCode: 401 });
  }

  const result = await syncPlaylist();
  return result;
});
```

### Phase 4: Advanced Features

- [ ] Multi-playlist support
- [ ] Summary regeneration (different models/prompts)
- [ ] Tag extraction and auto-categorization
- [ ] Related video suggestions
- [ ] Export to PDF/Markdown bundle
- [ ] Webhook notifications (Discord, Slack)
- [ ] Transcript search across all videos
- [ ] Video timestamp extraction (chapters)

---

## Dependencies to Install

Add to `package.json`:

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.1.3",
    "youtube-transcript": "^1.0.6",
    "googleapis": "^130.0.0",
    "winston": "^3.11.0"
  }
}
```

Already present:
- `better-sqlite3`: Database
- `dotenv`: Environment variables
- `zod`: Schema validation
- `date-fns`: Date manipulation
- `@nuxt/content`: Markdown content engine

---

## Success Criteria

MVP is complete when:

1. ✅ User can run `npm run sync-playlist` successfully
2. ✅ Script fetches videos from configured YouTube playlist
3. ✅ New videos (not in database) are processed
4. ✅ Gemini Flash generates TL;DR + Summary for each video
5. ✅ Markdown files created in `src/content/summaries/` with correct frontmatter
6. ✅ Database records processing history
7. ✅ Nuxt Content can query summaries via API
8. ✅ Error handling gracefully handles API failures
9. ✅ Test coverage > 80% for core services
10. ✅ Documentation complete (README + this spec)

---

## Appendix: Example Outputs

### Example Markdown File

**File**: `src/content/summaries/dQw4w9WgXcQ.md`

```markdown
---
title: "Rick Astley - Never Gonna Give You Up (Official Video)"
videoId: "dQw4w9WgXcQ"
channel: "Rick Astley"
channelId: "UCuAXFkgsw1L7xaCfnd5JJOw"
duration: "PT3M33S"
publishedAt: "2009-10-25T06:57:33Z"
processedAt: "2025-12-31T18:30:00.000Z"
source: "youtube"
playlistId: "PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"
thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
modelUsed: "gemini-2.0-flash-exp"
---

## TL;DR

Rick Astley's iconic 1987 pop hit with a memorable music video that has become an internet phenomenon through the "Rickrolling" meme.

## Summary

"Never Gonna Give You Up" is Rick Astley's debut single from 1987, produced by Stock Aitken Waterman. The song became a global hit, reaching number one in 25 countries and earning Astley the 1988 Brit Award for Best British Single.

The music video features Astley's signature deep voice contrasted with his youthful appearance, performing in a distinctive setting with dancers and bold 80s aesthetics. The video's unique style and the song's catchy melody have given it enduring cultural relevance.

In the mid-2000s, the video became the centerpiece of the "Rickrolling" internet meme, where users are tricked into clicking links that lead to the music video. This phenomenon introduced the song to new generations and has resulted in over 1 billion views on YouTube.

The song exemplifies the high-energy pop production style of the 1980s, with its driving beat, synthesizer hooks, and earnest lyrics about commitment and devotion in relationships.
```

### Example Database Query

```sql
-- Get processing statistics
SELECT
  status,
  COUNT(*) as count,
  model_used
FROM processing_history
GROUP BY status, model_used;

-- Output:
-- status    | count | model_used
-- completed | 142   | gemini-2.0-flash-exp
-- failed    | 3     | gemini-2.0-flash-exp
-- skipped   | 5     | NULL
```

### Example API Response (Nuxt Content)

**Request**: `GET /api/_content/query?path=/summaries&limit=5`

**Response**:

```json
{
  "results": [
    {
      "id": "content:summaries:dQw4w9WgXcQ.md",
      "title": "Rick Astley - Never Gonna Give You Up (Official Video)",
      "videoId": "dQw4w9WgXcQ",
      "channel": "Rick Astley",
      "publishedAt": "2009-10-25T06:57:33Z",
      "processedAt": "2025-12-31T18:30:00.000Z",
      "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "body": {
        "type": "root",
        "children": [...]
      }
    }
  ],
  "total": 150
}
```

---

**End of Technical Specification**

**Next Steps**:
1. Install dependencies (`npm install @google/generative-ai youtube-transcript googleapis winston`)
2. Create directory structure
3. Implement services in order: YouTube → Gemini → Content Writer → Orchestrator
4. Set up database schema and migrations
5. Write unit tests alongside implementation
6. Create CLI wrapper script
7. Test end-to-end with real playlist
8. Document setup process in README
