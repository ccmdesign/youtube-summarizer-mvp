import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { ProcessingHistory, ProcessingStatus } from './schema';

const MIGRATION_SQL = `
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

CREATE INDEX IF NOT EXISTS idx_video_id ON processing_history(video_id);
CREATE INDEX IF NOT EXISTS idx_status ON processing_history(status);
CREATE INDEX IF NOT EXISTS idx_processed_at ON processing_history(processed_at);

-- Playlist snapshots (for future multi-playlist support)
CREATE TABLE IF NOT EXISTS playlist_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  playlist_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  snapshot_date TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(playlist_id, video_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_playlist_id ON playlist_snapshots(playlist_id);
CREATE INDEX IF NOT EXISTS idx_snapshot_date ON playlist_snapshots(snapshot_date);

-- Error log
CREATE TABLE IF NOT EXISTS error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_error_type ON error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_occurred_at ON error_log(occurred_at);
`;

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
    this.db.exec(MIGRATION_SQL);
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
