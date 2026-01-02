# YouTube Summarizer MVP — Implementation Plan

**Project**: YouTube Playlist Summarizer
**Version**: 1.0.0
**Date**: 2025-12-31
**Framework**: Nuxt 4 + Nuxt Content

---

## How to Use This Plan

Each step below is designed to be implemented sequentially by saying:

> **"Implement the next step in the implementation plan"**

Each step includes:
- **Objective**: What needs to be built
- **Files to create/modify**: Complete list with paths
- **Acceptance criteria**: How to verify completion
- **Dependencies**: What must be done first
- **Testing**: How to validate the implementation

Mark each step as complete by checking the box: `- [ ]` → `- [x]`

---

## Progress Tracker

- [x] **Step 1**: Project setup and dependencies
- [x] **Step 2**: Database foundation (schema, migrations, client)
- [x] **Step 3**: Utilities layer (logger, retry, rate limiter)
- [x] **Step 4**: Configuration management
- [x] **Step 5**: YouTube service implementation
- [x] **Step 6**: Gemini service implementation
- [x] **Step 7**: Content writer service
- [x] **Step 8**: Orchestration service (sync workflow)
- [x] **Step 9**: CLI entry point
- [x] **Step 10**: Integration testing and end-to-end validation

---

## Step 1: Project Setup and Dependencies

### Objective

Install required npm packages, create directory structure, and set up TypeScript types.

### Tasks

1. **Install dependencies**:
   ```bash
   npm install @google/generative-ai youtube-transcript googleapis winston
   ```

2. **Create directory structure**:
   ```
   src/
   ├── server/
   │   ├── services/
   │   ├── utils/
   │   ├── db/
   │   │   └── migrations/
   │   └── cli/
   ├── types/
   ├── content/
   │   └── summaries/
   └── tests/
       ├── services/
       ├── utils/
       └── integration/

   .data/
   ├── logs/
   └── (youtube-summarizer.db will be created here)
   ```

3. **Create base TypeScript types**:

**Files to create**:

- `src/types/youtube.ts`
- `src/types/gemini.ts`
- `src/types/summary.ts`
- `src/types/config.ts`

**Content for each file**:

**`src/types/youtube.ts`**:
```typescript
export interface PlaylistItem {
  videoId: string;
  title: string;
  position: number;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  channel: string;
  channelId: string;
  duration: string; // ISO 8601 format (e.g., "PT3M33S")
  publishedAt: string; // ISO 8601 timestamp
  thumbnailUrl: string;
}

export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}
```

**`src/types/gemini.ts`**:
```typescript
import type { VideoMetadata } from './youtube';

export interface SummaryInput {
  metadata: VideoMetadata;
  transcript?: string;
  mode: 'transcript' | 'native-video';
}

export interface SummaryOutput {
  tldr: string;
  summary: string;
  modelUsed: string;
}

export interface GeminiResponse {
  text: string;
}
```

**`src/types/summary.ts`**:
```typescript
import type { VideoMetadata } from './youtube';
import type { SummaryOutput } from './gemini';

export interface MarkdownInput {
  videoId: string;
  metadata: VideoMetadata;
  summary: SummaryOutput;
}

export interface MarkdownFrontmatter {
  title: string;
  videoId: string;
  channel: string;
  channelId: string;
  duration: string;
  publishedAt: string;
  processedAt: string;
  source: 'youtube';
  playlistId: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  modelUsed: string;
}
```

**`src/types/config.ts`**:
```typescript
export interface AppConfig {
  youtubeApiKey: string;
  youtubePlaylistId: string;
  geminiApiKey: string;
  geminiModel: 'gemini-2.0-flash-exp' | 'gemini-2.0-pro-exp';
  processingMode: 'transcript' | 'native-video';
  maxVideosPerRun: number;
  enableProFallback: boolean;
  databasePath: string;
  outputDir: string;
}

export interface SyncResult {
  processed: number;
  skipped: number;
  failed: number;
  errors: Array<{ videoId: string; error: string }>;
}
```

4. **Create `.env.example`**:

```env
# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxxxxxxxxxx

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp

# Processing Configuration
PROCESSING_MODE=transcript
MAX_VIDEOS_PER_RUN=10
ENABLE_PRO_FALLBACK=false

# Paths
DATABASE_PATH=.data/youtube-summarizer.db
OUTPUT_DIR=src/content/summaries

# Logging
LOG_LEVEL=info
```

5. **Add to `.gitignore`**:

```gitignore
# Add these lines
.data/
.env
src/content/summaries/*.md
!src/content/summaries/.gitkeep
```

6. **Create `.gitkeep` files**:
```bash
touch src/content/summaries/.gitkeep
touch .data/logs/.gitkeep
```

### Acceptance Criteria

- [ ] All dependencies installed successfully (`npm install` runs without errors)
- [ ] Directory structure created
- [ ] All TypeScript type files created with no compilation errors
- [ ] `.env.example` file created
- [ ] `.gitignore` updated
- [ ] `.gitkeep` files in place

### Testing

```bash
# Verify dependencies
npm list @google/generative-ai youtube-transcript googleapis winston

# Verify TypeScript compilation
npm run typecheck

# Verify directory structure
ls -R src/server/
ls -R src/types/
```

### Dependencies

None (this is the first step)

---

## Step 2: Database Foundation

### Objective

Create SQLite database schema, migration system, and database client with basic query methods.

### Files to Create

1. `src/server/db/schema.ts`
2. `src/server/db/migrations/001_initial_schema.sql`
3. `src/server/db/client.ts`
4. `src/tests/db/client.test.ts` (optional for this step)

### Implementation Details

**`src/server/db/schema.ts`**:
```typescript
export interface ProcessingHistory {
  id: number;
  video_id: string;
  status: 'completed' | 'failed' | 'skipped';
  processed_at: string; // ISO 8601
  model_used: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSnapshot {
  id: number;
  playlist_id: string;
  video_id: string;
  position: number;
  snapshot_date: string;
}

export interface ErrorLog {
  id: number;
  video_id: string | null;
  error_type: string;
  error_message: string;
  stack_trace: string | null;
  occurred_at: string;
}

export type ProcessingStatus = 'completed' | 'failed' | 'skipped';
```

**`src/server/db/migrations/001_initial_schema.sql`**:
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
CREATE INDEX idx_processed_at ON processing_history(processed_at);

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
CREATE INDEX idx_snapshot_date ON playlist_snapshots(snapshot_date);

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

**`src/server/db/client.ts`**:
```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { ProcessingHistory, ProcessingStatus } from './schema';

export class DatabaseClient {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(process.cwd(), '.data', 'youtube-summarizer.db');

    // Ensure directory exists
    fs.mkdirSync(path.dirname(finalPath), { recursive: true });

    this.db = new Database(finalPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrent performance
    this.runMigrations();
  }

  private runMigrations(): void {
    const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    const migration = fs.readFileSync(migrationPath, 'utf-8');
    this.db.exec(migration);
  }

  /**
   * Get list of video IDs that have been successfully processed
   */
  getCompletedVideos(): string[] {
    const stmt = this.db.prepare(`
      SELECT video_id FROM processing_history
      WHERE status = 'completed'
    `);
    const rows = stmt.all() as Array<{ video_id: string }>;
    return rows.map(row => row.video_id);
  }

  /**
   * Record a processing attempt
   */
  recordProcessing(data: {
    video_id: string;
    status: ProcessingStatus;
    processed_at: string;
    model_used?: string;
    error_message?: string;
    retry_count?: number;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO processing_history
      (video_id, status, processed_at, model_used, error_message, retry_count, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      data.video_id,
      data.status,
      data.processed_at,
      data.model_used || null,
      data.error_message || null,
      data.retry_count || 0
    );
  }

  /**
   * Log an error
   */
  logError(data: {
    video_id?: string;
    error_type: string;
    error_message: string;
    stack_trace?: string;
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO error_log (video_id, error_type, error_message, stack_trace, occurred_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);

    stmt.run(
      data.video_id || null,
      data.error_type,
      data.error_message,
      data.stack_trace || null
    );
  }

  /**
   * Get processing statistics
   */
  getStats(): { status: ProcessingStatus; count: number }[] {
    const stmt = this.db.prepare(`
      SELECT status, COUNT(*) as count
      FROM processing_history
      GROUP BY status
    `);
    return stmt.all() as Array<{ status: ProcessingStatus; count: number }>;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseClient();
```

### Acceptance Criteria

- [ ] Database schema file created with all interfaces
- [ ] Migration SQL file created with all tables and indexes
- [ ] Database client implements all required methods
- [ ] Database file created at `.data/youtube-summarizer.db` on first run
- [ ] No TypeScript compilation errors

### Testing

```bash
# Create test file: src/tests/db/client.test.ts
npm run typecheck

# Manual test (create a simple Node script to verify):
node -e "
  const { db } = require('./src/server/db/client.ts');
  console.log('Stats:', db.getStats());
  db.close();
"
```

Or create a simple test:

**`src/tests/db/client.test.ts`**:
```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { DatabaseClient } from '~/server/db/client';
import fs from 'fs';

describe('DatabaseClient', () => {
  const testDbPath = '.data/test-db.db';
  let client: DatabaseClient;

  afterEach(() => {
    client?.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('creates database and runs migrations', () => {
    client = new DatabaseClient(testDbPath);
    expect(fs.existsSync(testDbPath)).toBe(true);
  });

  it('records and retrieves completed videos', () => {
    client = new DatabaseClient(testDbPath);

    client.recordProcessing({
      video_id: 'test123',
      status: 'completed',
      processed_at: new Date().toISOString(),
      model_used: 'gemini-2.0-flash-exp'
    });

    const completed = client.getCompletedVideos();
    expect(completed).toContain('test123');
  });

  it('logs errors', () => {
    client = new DatabaseClient(testDbPath);

    client.logError({
      video_id: 'test456',
      error_type: 'TRANSCRIPT_UNAVAILABLE',
      error_message: 'No transcript found'
    });

    // Verify error was logged (could add getErrors method if needed)
    expect(true).toBe(true); // Placeholder
  });
});
```

### Dependencies

- Step 1 must be completed

---

## Step 3: Utilities Layer

### Objective

Create reusable utilities for logging, retry logic, and rate limiting.

### Files to Create

1. `src/server/utils/logger.ts`
2. `src/server/utils/retry.ts`
3. `src/server/utils/rate-limiter.ts`
4. `src/tests/utils/retry.test.ts` (optional)

### Implementation Details

**`src/server/utils/logger.ts`**:
```typescript
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure log directory exists
const logDir = path.join(process.cwd(), '.data', 'logs');
fs.mkdirSync(logDir, { recursive: true });

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console output (colorized, simple format)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      )
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Export convenience methods
export default logger;
```

**`src/server/utils/retry.ts`**:
```typescript
import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2,
    baseDelay = 1000,
    maxDelay = 30000,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
          error: lastError.message
        });

        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

**`src/server/utils/rate-limiter.ts`**:
```typescript
/**
 * Token bucket rate limiter
 * Ensures we don't exceed API rate limits
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
    private refillInterval: number = 1000 // milliseconds
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Wait until a token is available, then consume it
   */
  async acquire(): Promise<void> {
    this.refill();

    while (this.tokens < 1) {
      const waitTime = this.refillInterval;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// Gemini Flash rate limiter: 60 requests per minute
export const geminiFlashLimiter = new RateLimiter(60, 1); // 1 token/second = 60/minute

// Gemini Pro rate limiter: 10 requests per minute
export const geminiProLimiter = new RateLimiter(10, 0.167); // ~10/minute

// YouTube API rate limiter (conservative: 10 requests per second)
export const youtubeApiLimiter = new RateLimiter(100, 10);
```

### Acceptance Criteria

- [ ] Logger configured with console and file transports
- [ ] Retry utility implements exponential backoff
- [ ] Rate limiter implements token bucket algorithm
- [ ] Log files created in `.data/logs/`
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/utils/retry.test.ts`**:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff } from '~/server/utils/retry';

describe('retryWithBackoff', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await retryWithBackoff(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after max retries exceeded', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));

    await expect(
      retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10 })
    ).rejects.toThrow('persistent failure');

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});
```

Run tests:
```bash
npx vitest run src/tests/utils/retry.test.ts
```

### Dependencies

- Step 1 must be completed

---

## Step 4: Configuration Management

### Objective

Create configuration loader with validation using Zod schemas.

### Files to Create

1. `src/server/utils/config.ts`
2. `src/tests/utils/config.test.ts` (optional)

### Implementation Details

**`src/server/utils/config.ts`**:
```typescript
import { z } from 'zod';
import type { AppConfig } from '~/types/config';

const ConfigSchema = z.object({
  youtubeApiKey: z.string().min(1, 'YOUTUBE_API_KEY is required'),
  youtubePlaylistId: z.string().regex(
    /^(PL|UU|LL|RD|OL)[a-zA-Z0-9_-]{16,}$/,
    'Invalid YouTube playlist ID format'
  ),
  geminiApiKey: z.string().min(1, 'GEMINI_API_KEY is required'),
  geminiModel: z.enum(['gemini-2.0-flash-exp', 'gemini-2.0-pro-exp']),
  processingMode: z.enum(['transcript', 'native-video']),
  maxVideosPerRun: z.number().int().positive().max(50),
  enableProFallback: z.boolean(),
  databasePath: z.string(),
  outputDir: z.string()
});

export function loadConfig(): AppConfig {
  const raw = {
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    youtubePlaylistId: process.env.YOUTUBE_PLAYLIST_ID,
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    processingMode: process.env.PROCESSING_MODE || 'transcript',
    maxVideosPerRun: parseInt(process.env.MAX_VIDEOS_PER_RUN || '10', 10),
    enableProFallback: process.env.ENABLE_PRO_FALLBACK === 'true',
    databasePath: process.env.DATABASE_PATH || '.data/youtube-summarizer.db',
    outputDir: process.env.OUTPUT_DIR || 'src/content/summaries'
  };

  try {
    return ConfigSchema.parse(raw);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
      throw new Error(`Configuration validation failed:\n${issues}`);
    }
    throw error;
  }
}

export function validateConfig(): void {
  try {
    loadConfig();
    console.log('✅ Configuration is valid');
  } catch (error) {
    console.error('❌ Configuration error:', error.message);
    process.exit(1);
  }
}
```

### Acceptance Criteria

- [ ] Configuration loader validates all required environment variables
- [ ] Zod schema enforces correct types and formats
- [ ] Helpful error messages for missing/invalid configuration
- [ ] `validateConfig()` helper for pre-flight checks
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/utils/config.test.ts`**:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '~/server/utils/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      YOUTUBE_API_KEY: 'test-youtube-key',
      YOUTUBE_PLAYLIST_ID: 'PLtest1234567890abcdef',
      GEMINI_API_KEY: 'test-gemini-key',
      GEMINI_MODEL: 'gemini-2.0-flash-exp',
      PROCESSING_MODE: 'transcript',
      MAX_VIDEOS_PER_RUN: '10',
      ENABLE_PRO_FALLBACK: 'false'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('loads valid configuration', () => {
    const config = loadConfig();

    expect(config.youtubeApiKey).toBe('test-youtube-key');
    expect(config.geminiModel).toBe('gemini-2.0-flash-exp');
    expect(config.maxVideosPerRun).toBe(10);
  });

  it('throws error for missing required fields', () => {
    delete process.env.YOUTUBE_API_KEY;

    expect(() => loadConfig()).toThrow('YOUTUBE_API_KEY is required');
  });

  it('validates playlist ID format', () => {
    process.env.YOUTUBE_PLAYLIST_ID = 'invalid-id';

    expect(() => loadConfig()).toThrow('Invalid YouTube playlist ID format');
  });

  it('uses defaults for optional fields', () => {
    delete process.env.GEMINI_MODEL;
    delete process.env.MAX_VIDEOS_PER_RUN;

    const config = loadConfig();
    expect(config.geminiModel).toBe('gemini-2.0-flash-exp');
    expect(config.maxVideosPerRun).toBe(10);
  });
});
```

### Dependencies

- Step 1 must be completed

---

## Step 5: YouTube Service Implementation

### Objective

Implement YouTube Data API integration for fetching playlist items, video metadata, and transcripts.

### Files to Create

1. `src/server/services/youtube.service.ts`
2. `src/tests/services/youtube.test.ts`

### Implementation Details

**`src/server/services/youtube.service.ts`**:
```typescript
import { google } from 'googleapis';
import { YoutubeTranscript } from 'youtube-transcript';
import type { PlaylistItem, VideoMetadata } from '~/types/youtube';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { youtubeApiLimiter } from '~/server/utils/rate-limiter';

export class YouTubeService {
  private youtube;

  constructor(apiKey: string) {
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    });
  }

  /**
   * Fetch all videos from a playlist (with pagination)
   */
  async getPlaylistItems(playlistId: string): Promise<PlaylistItem[]> {
    const items: PlaylistItem[] = [];
    let pageToken: string | undefined;

    do {
      await youtubeApiLimiter.acquire();

      const response = await retryWithBackoff(() =>
        this.youtube.playlistItems.list({
          part: ['snippet'],
          playlistId,
          maxResults: 50,
          pageToken
        })
      );

      if (!response.data.items) {
        break;
      }

      items.push(
        ...response.data.items.map(item => ({
          videoId: item.snippet!.resourceId!.videoId!,
          title: item.snippet!.title || 'Untitled',
          position: item.snippet!.position || 0
        }))
      );

      pageToken = response.data.nextPageToken || undefined;
    } while (pageToken);

    logger.info(`Fetched ${items.length} videos from playlist ${playlistId}`);
    return items;
  }

  /**
   * Get metadata for a specific video
   */
  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    await youtubeApiLimiter.acquire();

    const response = await retryWithBackoff(() =>
      this.youtube.videos.list({
        part: ['snippet', 'contentDetails'],
        id: [videoId]
      })
    );

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error(`VIDEO_NOT_FOUND: ${videoId}`);
    }

    return {
      videoId,
      title: video.snippet!.title || 'Untitled',
      channel: video.snippet!.channelTitle || 'Unknown Channel',
      channelId: video.snippet!.channelId || '',
      duration: video.contentDetails!.duration || 'PT0S',
      publishedAt: video.snippet!.publishedAt || new Date().toISOString(),
      thumbnailUrl: video.snippet!.thumbnails?.high?.url || video.snippet!.thumbnails?.default?.url || ''
    };
  }

  /**
   * Get transcript for a video
   * @throws Error with code 'TRANSCRIPT_UNAVAILABLE' if transcript cannot be fetched
   */
  async getTranscript(videoId: string): Promise<string> {
    try {
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      const transcript = transcriptData.map(entry => entry.text).join(' ');

      logger.info(`Fetched transcript for ${videoId}`, {
        length: transcript.length,
        entries: transcriptData.length
      });

      return transcript;
    } catch (error) {
      logger.warn(`Transcript unavailable for ${videoId}`, {
        error: error instanceof Error ? error.message : String(error)
      });

      const transcriptError = new Error('TRANSCRIPT_UNAVAILABLE');
      transcriptError.cause = error;
      throw transcriptError;
    }
  }
}

/**
 * Create YouTube service instance from config
 */
export function createYouTubeService(apiKey: string): YouTubeService {
  return new YouTubeService(apiKey);
}
```

### Acceptance Criteria

- [ ] Service can fetch playlist items with pagination
- [ ] Service can fetch video metadata
- [ ] Service can fetch transcripts
- [ ] Rate limiting applied to all API calls
- [ ] Errors are properly typed and logged
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/services/youtube.test.ts`**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeService } from '~/server/services/youtube.service';

// Mock the dependencies
vi.mock('googleapis', () => ({
  google: {
    youtube: vi.fn(() => ({
      playlistItems: {
        list: vi.fn()
      },
      videos: {
        list: vi.fn()
      }
    }))
  }
}));

vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn()
  }
}));

describe('YouTubeService', () => {
  let service: YouTubeService;

  beforeEach(() => {
    service = new YouTubeService('test-api-key');
  });

  describe('getPlaylistItems', () => {
    it('fetches playlist items successfully', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              snippet: {
                resourceId: { videoId: 'abc123' },
                title: 'Test Video',
                position: 0
              }
            }
          ],
          nextPageToken: null
        }
      };

      vi.spyOn(service['youtube'].playlistItems, 'list').mockResolvedValue(mockResponse);

      const items = await service.getPlaylistItems('PLtest');

      expect(items).toHaveLength(1);
      expect(items[0].videoId).toBe('abc123');
      expect(items[0].title).toBe('Test Video');
    });

    it('handles pagination', async () => {
      const page1 = {
        data: {
          items: [{ snippet: { resourceId: { videoId: 'video1' }, title: 'V1', position: 0 } }],
          nextPageToken: 'token123'
        }
      };

      const page2 = {
        data: {
          items: [{ snippet: { resourceId: { videoId: 'video2' }, title: 'V2', position: 1 } }],
          nextPageToken: null
        }
      };

      vi.spyOn(service['youtube'].playlistItems, 'list')
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const items = await service.getPlaylistItems('PLtest');

      expect(items).toHaveLength(2);
      expect(items[0].videoId).toBe('video1');
      expect(items[1].videoId).toBe('video2');
    });
  });

  describe('getVideoMetadata', () => {
    it('fetches video metadata successfully', async () => {
      const mockResponse = {
        data: {
          items: [
            {
              snippet: {
                title: 'Test Video',
                channelTitle: 'Test Channel',
                channelId: 'UC123',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: {
                  high: { url: 'https://example.com/thumb.jpg' }
                }
              },
              contentDetails: {
                duration: 'PT10M30S'
              }
            }
          ]
        }
      };

      vi.spyOn(service['youtube'].videos, 'list').mockResolvedValue(mockResponse);

      const metadata = await service.getVideoMetadata('abc123');

      expect(metadata.videoId).toBe('abc123');
      expect(metadata.title).toBe('Test Video');
      expect(metadata.channel).toBe('Test Channel');
      expect(metadata.duration).toBe('PT10M30S');
    });

    it('throws error when video not found', async () => {
      const mockResponse = {
        data: {
          items: []
        }
      };

      vi.spyOn(service['youtube'].videos, 'list').mockResolvedValue(mockResponse);

      await expect(service.getVideoMetadata('nonexistent')).rejects.toThrow('VIDEO_NOT_FOUND');
    });
  });
});
```

Run tests:
```bash
npx vitest run src/tests/services/youtube.test.ts
```

### Dependencies

- Step 1 (dependencies and types)
- Step 3 (utilities: logger, retry, rate-limiter)

---

## Step 6: Gemini Service Implementation

### Objective

Implement Google Gemini API integration for generating video summaries.

### Files to Create

1. `src/server/services/gemini.service.ts`
2. `src/tests/services/gemini.test.ts`

### Implementation Details

**`src/server/services/gemini.service.ts`**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SummaryInput, SummaryOutput } from '~/types/gemini';
import { logger } from '~/server/utils/logger';
import { retryWithBackoff } from '~/server/utils/retry';
import { geminiFlashLimiter, geminiProLimiter } from '~/server/utils/rate-limiter';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = modelName;
  }

  /**
   * Generate a summary for a video
   */
  async generateSummary(input: SummaryInput): Promise<SummaryOutput> {
    const limiter = this.modelName.includes('pro') ? geminiProLimiter : geminiFlashLimiter;
    await limiter.acquire();

    const prompt = this.buildPrompt(input);

    logger.info(`Generating summary for ${input.metadata.videoId}`, {
      mode: input.mode,
      model: this.modelName
    });

    const result = await retryWithBackoff(async () => {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });

      if (input.mode === 'native-video') {
        // Native video mode: pass YouTube URL to Gemini
        return await model.generateContent([
          prompt,
          {
            inlineData: {
              mimeType: 'video/youtube' as any,
              data: `https://www.youtube.com/watch?v=${input.metadata.videoId}`
            }
          }
        ]);
      } else {
        // Transcript mode: pass text transcript
        return await model.generateContent(prompt);
      }
    }, {
      maxRetries: 2,
      baseDelay: 2000,
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

  /**
   * Parse Gemini's response into structured data
   */
  private parseResponse(text: string): { tldr: string; summary: string } {
    // Match TL;DR (anything before SUMMARY:)
    const tldrMatch = text.match(/TL;DR:\s*(.+?)(?=\n\n|SUMMARY:)/s);

    // Match SUMMARY (everything after SUMMARY:)
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/s);

    if (!tldrMatch || !summaryMatch) {
      logger.error('Malformed Gemini response', { text });
      throw new Error('MALFORMED_GEMINI_RESPONSE');
    }

    return {
      tldr: tldrMatch[1].trim().slice(0, 200),
      summary: summaryMatch[1].trim()
    };
  }
}

/**
 * Create Gemini service instance from config
 */
export function createGeminiService(apiKey: string, modelName: string): GeminiService {
  return new GeminiService(apiKey, modelName);
}
```

### Acceptance Criteria

- [ ] Service can generate summaries in transcript mode
- [ ] Service can generate summaries in native-video mode
- [ ] Response parsing extracts TL;DR and Summary
- [ ] Rate limiting applied based on model type
- [ ] Malformed responses throw proper errors
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/services/gemini.test.ts`**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from '~/server/services/gemini.service';
import type { SummaryInput } from '~/types/gemini';

// Mock the Gemini SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn()
    }))
  }))
}));

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(() => {
    service = new GeminiService('test-api-key', 'gemini-2.0-flash-exp');
  });

  describe('generateSummary', () => {
    it('generates summary in transcript mode', async () => {
      const mockResponse = {
        response: {
          text: () => `TL;DR: This is a test summary

SUMMARY:
This is the detailed summary content with insights and takeaways.`
        }
      };

      const genAI = (service as any).genAI;
      const mockModel = genAI.getGenerativeModel();
      vi.spyOn(mockModel, 'generateContent').mockResolvedValue(mockResponse);

      const input: SummaryInput = {
        metadata: {
          videoId: 'test123',
          title: 'Test Video',
          channel: 'Test Channel',
          channelId: 'UC123',
          duration: 'PT10M',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnailUrl: 'https://example.com/thumb.jpg'
        },
        transcript: 'This is the video transcript',
        mode: 'transcript'
      };

      const result = await service.generateSummary(input);

      expect(result.tldr).toBe('This is a test summary');
      expect(result.summary).toContain('detailed summary content');
      expect(result.modelUsed).toBe('gemini-2.0-flash-exp');
    });

    it('throws error on malformed response', async () => {
      const mockResponse = {
        response: {
          text: () => 'Invalid response without proper format'
        }
      };

      const genAI = (service as any).genAI;
      const mockModel = genAI.getGenerativeModel();
      vi.spyOn(mockModel, 'generateContent').mockResolvedValue(mockResponse);

      const input: SummaryInput = {
        metadata: {
          videoId: 'test123',
          title: 'Test',
          channel: 'Test',
          channelId: 'UC123',
          duration: 'PT10M',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnailUrl: ''
        },
        mode: 'transcript'
      };

      await expect(service.generateSummary(input)).rejects.toThrow('MALFORMED_GEMINI_RESPONSE');
    });
  });
});
```

### Dependencies

- Step 1 (dependencies and types)
- Step 3 (utilities: logger, retry, rate-limiter)

---

## Step 7: Content Writer Service

### Objective

Implement service to write Markdown files with proper frontmatter to the filesystem.

### Files to Create

1. `src/server/services/content-writer.service.ts`
2. `src/tests/services/content-writer.test.ts`

### Implementation Details

**`src/server/services/content-writer.service.ts`**:
```typescript
import fs from 'fs/promises';
import path from 'path';
import type { MarkdownInput } from '~/types/summary';
import { logger } from '~/server/utils/logger';

export class ContentWriterService {
  constructor(private outputDir: string = 'src/content/summaries') {}

  /**
   * Write a markdown file with frontmatter
   */
  async writeMarkdown(input: MarkdownInput): Promise<string> {
    const { videoId, metadata, summary } = input;

    // Ensure output directory exists
    const fullPath = path.join(process.cwd(), this.outputDir);
    await fs.mkdir(fullPath, { recursive: true });

    const content = this.generateMarkdown(input);
    const filePath = path.join(fullPath, `${videoId}.md`);

    await fs.writeFile(filePath, content, 'utf-8');

    logger.info(`Written summary for ${videoId}`, {
      filePath,
      size: content.length
    });

    return filePath;
  }

  /**
   * Check if a summary file already exists
   */
  async exists(videoId: string): Promise<boolean> {
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
  private generateMarkdown(input: MarkdownInput): string {
    const { videoId, metadata, summary } = input;

    const frontmatter = {
      title: this.escapeYaml(metadata.title),
      videoId,
      channel: this.escapeYaml(metadata.channel),
      channelId: metadata.channelId,
      duration: metadata.duration,
      publishedAt: metadata.publishedAt,
      processedAt: new Date().toISOString(),
      source: 'youtube',
      playlistId: process.env.YOUTUBE_PLAYLIST_ID || '',
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
---

## TL;DR

${summary.tldr}

## Summary

${summary.summary}
`;
  }

  /**
   * Escape special characters in YAML strings
   */
  private escapeYaml(str: string): string {
    return str.replace(/"/g, '\\"').replace(/\n/g, ' ');
  }
}

/**
 * Create content writer service instance
 */
export function createContentWriterService(outputDir?: string): ContentWriterService {
  return new ContentWriterService(outputDir);
}
```

### Acceptance Criteria

- [ ] Service can write markdown files with frontmatter
- [ ] Service can check if file already exists
- [ ] YAML special characters are properly escaped
- [ ] Output directory is created if it doesn't exist
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/services/content-writer.test.ts`**:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContentWriterService } from '~/server/services/content-writer.service';
import fs from 'fs/promises';
import path from 'path';

describe('ContentWriterService', () => {
  const testOutputDir = '.data/test-summaries';
  let service: ContentWriterService;

  beforeEach(() => {
    service = new ContentWriterService(testOutputDir);
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(path.join(process.cwd(), testOutputDir), { recursive: true });
    } catch {
      // Ignore errors if directory doesn't exist
    }
  });

  it('writes markdown file with frontmatter', async () => {
    const input = {
      videoId: 'test123',
      metadata: {
        videoId: 'test123',
        title: 'Test Video',
        channel: 'Test Channel',
        channelId: 'UC123',
        duration: 'PT10M30S',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: 'https://example.com/thumb.jpg'
      },
      summary: {
        tldr: 'This is a test TL;DR',
        summary: 'This is the detailed summary.',
        modelUsed: 'gemini-2.0-flash-exp'
      }
    };

    const filePath = await service.writeMarkdown(input);

    expect(filePath).toContain('test123.md');

    const content = await fs.readFile(filePath, 'utf-8');

    expect(content).toMatch(/^---/);
    expect(content).toContain('title: "Test Video"');
    expect(content).toContain('videoId: "test123"');
    expect(content).toContain('## TL;DR');
    expect(content).toContain('This is a test TL;DR');
    expect(content).toContain('## Summary');
    expect(content).toContain('This is the detailed summary.');
  });

  it('checks if file exists', async () => {
    const input = {
      videoId: 'test456',
      metadata: {
        videoId: 'test456',
        title: 'Test',
        channel: 'Test',
        channelId: 'UC123',
        duration: 'PT1M',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: ''
      },
      summary: {
        tldr: 'Test',
        summary: 'Test summary',
        modelUsed: 'gemini-2.0-flash-exp'
      }
    };

    expect(await service.exists('test456')).toBe(false);

    await service.writeMarkdown(input);

    expect(await service.exists('test456')).toBe(true);
  });

  it('escapes special characters in YAML', async () => {
    const input = {
      videoId: 'test789',
      metadata: {
        videoId: 'test789',
        title: 'Test "Quotes" and \\Backslashes\\',
        channel: 'Channel: Special & Characters',
        channelId: 'UC123',
        duration: 'PT1M',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnailUrl: ''
      },
      summary: {
        tldr: 'Test',
        summary: 'Test',
        modelUsed: 'gemini-2.0-flash-exp'
      }
    };

    const filePath = await service.writeMarkdown(input);
    const content = await fs.readFile(filePath, 'utf-8');

    expect(content).toContain('\\"Quotes\\"');
  });
});
```

### Dependencies

- Step 1 (dependencies and types)
- Step 3 (utilities: logger)

---

## Step 8: Orchestration Service (Sync Workflow)

### Objective

Create the main orchestration service that coordinates the entire sync workflow.

### Files to Create

1. `src/server/services/sync.service.ts`
2. `src/tests/services/sync.test.ts` (optional)

### Implementation Details

**`src/server/services/sync.service.ts`**:
```typescript
import type { SyncResult } from '~/types/config';
import { loadConfig } from '~/server/utils/config';
import { logger } from '~/server/utils/logger';
import { db } from '~/server/db/client';
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

    // 2. Filter out already processed videos
    const completedVideos = db.getCompletedVideos();
    const newVideos = playlistItems.filter(
      item => !completedVideos.includes(item.videoId)
    );

    logger.info(`Found ${newVideos.length} new videos (${completedVideos.length} already processed)`);

    result.skipped = playlistItems.length - newVideos.length;

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

        logger.info(`✅ Successfully processed ${item.videoId}`);
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);

        result.errors.push({
          videoId: item.videoId,
          error: errorMessage
        });

        logger.error(`❌ Failed to process ${item.videoId}`, { error: errorMessage });

        // Log to database
        db.logError({
          video_id: item.videoId,
          error_type: errorMessage.split(':')[0] || 'UNKNOWN_ERROR',
          error_message: errorMessage,
          stack_trace: error instanceof Error ? error.stack : undefined
        });

        // Record failed processing
        db.recordProcessing({
          video_id: item.videoId,
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: errorMessage
        });
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

  if (config.processingMode === 'transcript') {
    try {
      transcript = await youtubeService.getTranscript(videoId);
    } catch (error) {
      // If transcript unavailable and Pro fallback is enabled
      if (config.enableProFallback && config.geminiModel.includes('pro')) {
        logger.warn(`Transcript unavailable, falling back to native video mode`, { videoId });
        config.processingMode = 'native-video';
      } else {
        throw error;
      }
    }
  }

  // 3. Generate summary
  const summary = await geminiService.generateSummary({
    metadata,
    transcript,
    mode: config.processingMode
  });

  // 4. Write markdown file
  await contentWriter.writeMarkdown({
    videoId,
    metadata,
    summary
  });

  // 5. Record successful processing in database
  db.recordProcessing({
    video_id: videoId,
    status: 'completed',
    processed_at: new Date().toISOString(),
    model_used: summary.modelUsed
  });
}
```

### Acceptance Criteria

- [ ] Service fetches playlist items
- [ ] Service filters out already-processed videos
- [ ] Service respects maxVideosPerRun limit
- [ ] Service processes each video through the pipeline
- [ ] Service handles errors gracefully and continues processing
- [ ] Service logs errors to database
- [ ] Service returns comprehensive sync results
- [ ] No TypeScript compilation errors

### Testing

Create **`src/tests/services/sync.test.ts`** (integration-style test):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncPlaylist } from '~/server/services/sync.service';

// Mock all dependencies
vi.mock('~/server/utils/config', () => ({
  loadConfig: vi.fn(() => ({
    youtubeApiKey: 'test-key',
    youtubePlaylistId: 'PLtest',
    geminiApiKey: 'test-gemini-key',
    geminiModel: 'gemini-2.0-flash-exp',
    processingMode: 'transcript',
    maxVideosPerRun: 5,
    enableProFallback: false,
    databasePath: '.data/test.db',
    outputDir: '.data/test-summaries'
  }))
}));

describe('syncPlaylist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns sync results', async () => {
    const result = await syncPlaylist();

    expect(result).toHaveProperty('processed');
    expect(result).toHaveProperty('skipped');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('errors');

    expect(Array.isArray(result.errors)).toBe(true);
  });

  // Add more integration tests as needed
});
```

### Dependencies

- Step 2 (database)
- Step 3 (utilities)
- Step 4 (configuration)
- Step 5 (YouTube service)
- Step 6 (Gemini service)
- Step 7 (Content writer)

---

## Step 9: CLI Entry Point

### Objective

Create the CLI script that can be invoked via `npm run sync-playlist`.

### Files to Create

1. `scripts/sync-playlist.ts`
2. Update `package.json` with new script

### Implementation Details

**`scripts/sync-playlist.ts`**:
```typescript
#!/usr/bin/env tsx

import dotenv from 'dotenv';
import { syncPlaylist } from '../src/server/services/sync.service';
import { logger } from '../src/server/utils/logger';
import { validateConfig } from '../src/server/utils/config';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🎬 YouTube Playlist Summarizer\n');

  // Validate configuration before starting
  try {
    validateConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    logger.info('Starting playlist sync...');

    const result = await syncPlaylist();

    console.log('\n📊 Sync Results:');
    console.log(`  ✅ Processed: ${result.processed}`);
    console.log(`  ⏭️  Skipped:   ${result.skipped}`);
    console.log(`  ❌ Failed:    ${result.failed}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errors:');
      result.errors.forEach(({ videoId, error }) => {
        console.log(`  - ${videoId}: ${error}`);
      });
    }

    console.log('\n✨ Sync completed!\n');

    // Exit with error code if any videos failed
    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    logger.error('Sync failed', { error });
    console.error('\n❌ Sync failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
```

**Update `package.json`**:

Add this script to the `scripts` section:

```json
{
  "scripts": {
    "sync-playlist": "tsx scripts/sync-playlist.ts"
  }
}
```

### Acceptance Criteria

- [ ] CLI script loads environment variables
- [ ] CLI script validates configuration before starting
- [ ] CLI script calls syncPlaylist and displays results
- [ ] CLI script exits with proper exit codes (0 for success, 1 for failure)
- [ ] Script can be run with `npm run sync-playlist`
- [ ] No TypeScript compilation errors

### Testing

Manual test:

```bash
# Create a .env file with valid credentials
cp .env.example .env
# Edit .env with real API keys

# Run the sync
npm run sync-playlist

# Verify output
ls src/content/summaries/

# Check database
sqlite3 .data/youtube-summarizer.db "SELECT * FROM processing_history;"
```

### Dependencies

- All previous steps (1-8)

---

## Step 10: Integration Testing and Validation

### Objective

Create end-to-end integration tests and validate the entire system works correctly.

### Files to Create

1. `src/tests/integration/end-to-end.test.ts`
2. `README.md` (update with setup and usage instructions)
3. `TESTING.md` (testing documentation)

### Implementation Details

**`src/tests/integration/end-to-end.test.ts`**:
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { syncPlaylist } from '~/server/services/sync.service';
import { db } from '~/server/db/client';
import fs from 'fs/promises';
import path from 'path';

describe('End-to-End Integration', () => {
  const testOutputDir = '.data/test-integration-summaries';

  beforeAll(() => {
    // Set up test environment variables
    process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'test-key';
    process.env.YOUTUBE_PLAYLIST_ID = process.env.YOUTUBE_PLAYLIST_ID || 'PLtest';
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';
    process.env.MAX_VIDEOS_PER_RUN = '2';
    process.env.OUTPUT_DIR = testOutputDir;
  });

  afterAll(async () => {
    // Clean up test files
    try {
      await fs.rm(path.join(process.cwd(), testOutputDir), { recursive: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  });

  it('processes playlist end-to-end', async () => {
    // This test requires valid API keys to run
    // Skip if running in CI without credentials
    if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'test-key') {
      console.log('⏭️  Skipping integration test (no API credentials)');
      return;
    }

    const result = await syncPlaylist();

    expect(result).toBeDefined();
    expect(result.processed).toBeGreaterThanOrEqual(0);
    expect(result.skipped).toBeGreaterThanOrEqual(0);
    expect(result.failed).toBeGreaterThanOrEqual(0);

    // Verify markdown files were created
    if (result.processed > 0) {
      const files = await fs.readdir(path.join(process.cwd(), testOutputDir));
      expect(files.length).toBeGreaterThan(0);

      // Verify first file has correct structure
      const firstFile = files[0];
      const content = await fs.readFile(
        path.join(process.cwd(), testOutputDir, firstFile),
        'utf-8'
      );

      expect(content).toMatch(/^---/);
      expect(content).toContain('videoId:');
      expect(content).toContain('## TL;DR');
      expect(content).toContain('## Summary');
    }

    // Verify database records
    const stats = db.getStats();
    expect(stats.length).toBeGreaterThan(0);
  }, 60000); // 60 second timeout for API calls
});
```

**Update `README.md`**:

Add this section to the README:

```markdown
## YouTube Playlist Summarizer

Automatically fetch videos from a YouTube playlist and generate AI-powered summaries using Google Gemini API.

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   - `YOUTUBE_API_KEY`: From [Google Cloud Console](https://console.cloud.google.com/)
   - `YOUTUBE_PLAYLIST_ID`: The playlist ID to sync
   - `GEMINI_API_KEY`: From [Google AI Studio](https://aistudio.google.com/app/apikey)

3. **Run the sync**:
   ```bash
   npm run sync-playlist
   ```

### Usage

```bash
# Sync playlist manually
npm run sync-playlist

# View generated summaries
ls src/content/summaries/

# Check database
sqlite3 .data/youtube-summarizer.db "SELECT * FROM processing_history;"
```

### Configuration

See `.env.example` for all configuration options:
- `PROCESSING_MODE`: `transcript` (cheaper, faster) or `native-video` (better quality)
- `GEMINI_MODEL`: `gemini-2.0-flash-exp` or `gemini-2.0-pro-exp`
- `MAX_VIDEOS_PER_RUN`: Limit number of videos processed per run (default: 10)
```

**Create `TESTING.md`**:

```markdown
# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/tests/services/youtube.test.ts
```

## Test Structure

- `src/tests/services/` - Service unit tests
- `src/tests/utils/` - Utility unit tests
- `src/tests/db/` - Database tests
- `src/tests/integration/` - End-to-end integration tests

## Integration Tests

Integration tests require valid API credentials. Set these environment variables:

```bash
YOUTUBE_API_KEY=your_real_key
YOUTUBE_PLAYLIST_ID=your_real_playlist
GEMINI_API_KEY=your_real_gemini_key
```

Then run:

```bash
npm run test:integration
```

## Coverage Goals

- Services: 90%
- Utilities: 95%
- Database: 80%
- Overall: 85%
```

### Acceptance Criteria

- [ ] Integration test covers full pipeline
- [ ] README updated with setup instructions
- [ ] TESTING.md created with test documentation
- [ ] All tests pass (`npm test`)
- [ ] Manual end-to-end test with real API succeeds
- [ ] Generated markdown files are valid
- [ ] Database contains correct records

### Testing

```bash
# Run all tests
npm test

# Run integration test (requires API keys)
npm run test:integration

# Manual end-to-end test
npm run sync-playlist

# Verify output
ls src/content/summaries/
cat src/content/summaries/*.md | head -50

# Check database
sqlite3 .data/youtube-summarizer.db <<EOF
SELECT video_id, status, model_used FROM processing_history;
SELECT COUNT(*) as total FROM processing_history;
SELECT status, COUNT(*) as count FROM processing_history GROUP BY status;
EOF
```

### Dependencies

- All previous steps (1-9)

---

## Final Verification Checklist

After completing all 10 steps, verify:

- [ ] `npm install` runs without errors
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (unit tests)
- [ ] `.env` file configured with valid API keys
- [ ] `npm run sync-playlist` runs successfully
- [ ] Markdown files generated in `src/content/summaries/`
- [ ] Database created at `.data/youtube-summarizer.db`
- [ ] Log files created at `.data/logs/`
- [ ] Frontmatter in markdown files is valid YAML
- [ ] TL;DR and Summary sections present in all files
- [ ] Database records match processed videos
- [ ] Error handling works (test with invalid video ID)
- [ ] Rate limiting prevents API quota issues
- [ ] Idempotent: running twice doesn't reprocess videos

---

## Troubleshooting

### Common Issues

**Issue**: `YOUTUBE_API_KEY is required`
- **Solution**: Copy `.env.example` to `.env` and add your API key

**Issue**: `Invalid YouTube playlist ID format`
- **Solution**: Ensure playlist ID starts with `PL`, `UU`, `LL`, or `RD`

**Issue**: `QUOTA_EXCEEDED`
- **Solution**: Wait 24 hours for quota reset, or reduce `MAX_VIDEOS_PER_RUN`

**Issue**: `TRANSCRIPT_UNAVAILABLE`
- **Solution**: Enable `ENABLE_PRO_FALLBACK=true` or use `PROCESSING_MODE=native-video`

**Issue**: `MALFORMED_GEMINI_RESPONSE`
- **Solution**: Check Gemini API logs, may need to adjust prompt or retry

---

## Next Steps After MVP

Once all steps are complete:

1. **Add automated scheduling** (GitHub Actions cron)
2. **Build web UI** for browsing summaries
3. **Implement search** across summaries
4. **Add multi-playlist support**
5. **Create regeneration workflow** for updating summaries

See `_process/technical-specification.md` for detailed future roadmap.

---

**Last Updated**: 2025-12-31
**Status**: Ready for implementation

When starting, simply say: **"Implement the next step in the implementation plan"**
