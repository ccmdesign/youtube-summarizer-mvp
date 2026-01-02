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
