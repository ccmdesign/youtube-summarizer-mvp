import { z } from 'zod';

/**
 * Schema for a single playlist configuration
 */
export const PlaylistConfigSchema = z.object({
  id: z.string().regex(
    /^(PL|UU|LL|RD|OL)[a-zA-Z0-9_-]{16,}$/,
    'Invalid YouTube playlist ID format (should start with PL, UU, LL, RD, or OL)'
  ),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  category: z.string().optional(),
  maxVideosPerRun: z.number().int().positive().optional()
});

/**
 * Schema for playlist sync settings
 */
export const PlaylistSettingsSchema = z.object({
  maxVideosPerPlaylist: z.number().int().positive().max(50).default(10),
  skipShortsUnderSeconds: z.number().int().positive().default(60),
  playlistDelayMs: z.number().int().positive().default(2000)
});

/**
 * Schema for the entire playlists.yaml config file
 */
export const PlaylistsConfigSchema = z.object({
  version: z.string().default('1.0'),
  playlists: z.array(PlaylistConfigSchema).default([]),
  settings: PlaylistSettingsSchema.default({})
});

// Inferred types from schemas
export type PlaylistConfig = z.infer<typeof PlaylistConfigSchema>;
export type PlaylistSettings = z.infer<typeof PlaylistSettingsSchema>;
export type PlaylistsConfig = z.infer<typeof PlaylistsConfigSchema>;

/**
 * Result of syncing a single playlist
 */
export interface PlaylistSyncResult {
  playlistId: string;
  playlistName: string;
  status: 'success' | 'failed' | 'skipped';
  videosFound: number;
  videosProcessed: number;
  videosSkipped: number;
  error?: string;
}

/**
 * Aggregated result of syncing all playlists
 */
export interface MultiPlaylistSyncResult {
  success: boolean;
  summary: {
    totalPlaylists: number;
    successfulPlaylists: number;
    failedPlaylists: number;
    skippedPlaylists: number;
    videosFound: number;
    videosProcessed: number;
    videosSkipped: number;
  };
  results: PlaylistSyncResult[];
  errors: string[];
}

/**
 * Request body for the sync playlists endpoint
 */
export interface PlaylistSyncRequest {
  playlistIds?: string[];
  dryRun?: boolean;
}

/**
 * Progress event for playlist sync SSE stream
 */
export interface PlaylistProgressEvent {
  type: 'start' | 'playlist' | 'video' | 'complete' | 'error';
  playlistName?: string;
  playlistIndex?: number;
  totalPlaylists?: number;
  videoTitle?: string;
  videoIndex?: number;
  totalVideos?: number;
  result?: MultiPlaylistSyncResult;
  error?: string;
}

/**
 * Callback type for playlist sync progress
 */
export type PlaylistProgressCallback = (event: PlaylistProgressEvent) => void;

/**
 * Options for syncing playlists
 */
export interface PlaylistSyncOptions {
  playlistIds?: string[];
  dryRun?: boolean;
  onProgress?: PlaylistProgressCallback;
}
