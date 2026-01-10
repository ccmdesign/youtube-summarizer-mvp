import { z } from 'zod';

/**
 * Schema for a single channel configuration
 */
export const ChannelConfigSchema = z.object({
  id: z.string().regex(
    /^UC[a-zA-Z0-9_-]{22}$/,
    'Invalid YouTube channel ID format (should start with UC and be 24 characters)'
  ),
  name: z.string().optional(),
  enabled: z.boolean().default(true)
});

/**
 * Schema for channel monitoring settings
 */
export const ChannelSettingsSchema = z.object({
  maxVideosPerChannel: z.number().int().positive().max(15).default(5),
  skipShortsUnderSeconds: z.number().int().positive().default(60)
});

/**
 * Schema for the entire channels.yaml config file
 */
export const ChannelsConfigSchema = z.object({
  version: z.string().default('1.0'),
  channels: z.array(ChannelConfigSchema).default([]),
  settings: ChannelSettingsSchema.default({})
});

// Inferred types from schemas
export type ChannelConfig = z.infer<typeof ChannelConfigSchema>;
export type ChannelSettings = z.infer<typeof ChannelSettingsSchema>;
export type ChannelsConfig = z.infer<typeof ChannelsConfigSchema>;

/**
 * Result of checking a single channel
 */
export interface ChannelCheckResult {
  channelId: string;
  channelName: string;
  status: 'success' | 'failed' | 'skipped';
  videosFound: number;
  videosProcessed: number;
  videosSkipped: number;
  error?: string;
}

/**
 * Aggregated result of monitoring all channels
 */
export interface MonitorResult {
  success: boolean;
  summary: {
    totalChannels: number;
    successfulChannels: number;
    failedChannels: number;
    skippedChannels: number;
    videosFound: number;
    videosProcessed: number;
    videosSkipped: number;
  };
  results: ChannelCheckResult[];
  errors: string[];
}

/**
 * Request body for the monitor endpoint
 */
export interface MonitorRequest {
  channelIds?: string[];
  dryRun?: boolean;
}
