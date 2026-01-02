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
