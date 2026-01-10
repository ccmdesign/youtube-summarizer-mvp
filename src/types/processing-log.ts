/**
 * Processing Log Types
 *
 * Tracks the status of video processing attempts to avoid
 * retrying videos that will never succeed.
 */

export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'failed' | 'skipped';
export type ErrorType = 'transient' | 'permanent';
export type ProcessingSource = 'playlist' | 'channel';

export interface ProcessingLogEntry {
  videoId: string;
  title?: string;
  status: ProcessingStatus;
  source?: ProcessingSource;
  createdAt: string;
  updatedAt: string;
  attemptCount: number;
  lastAttemptAt?: string;
  processedAt?: string;
  errorType?: ErrorType;
  errorCode?: string;
  errorMessage?: string;
  skipPermanently?: boolean;
  skipReason?: string;
}

export interface ProcessingLog {
  version: string;
  lastUpdated: string;
  entries: Record<string, ProcessingLogEntry>;
}

export interface ErrorClassification {
  type: ErrorType;
  code: string;
  isPermanent: boolean;
}
