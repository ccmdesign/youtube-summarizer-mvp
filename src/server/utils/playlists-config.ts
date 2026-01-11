import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { PlaylistsConfigSchema } from '~/types/playlists';
import type { PlaylistsConfig } from '~/types/playlists';
import { logger } from './logger';

const CONFIG_FILE_PATH = 'src/config/playlists.yaml';

/**
 * Load and validate playlists configuration from YAML file
 * Falls back to YOUTUBE_PLAYLIST_ID env var for backward compatibility
 */
export function loadPlaylistsConfig(): PlaylistsConfig {
  const fullPath = path.join(process.cwd(), CONFIG_FILE_PATH);

  // Check if config file exists
  if (!fs.existsSync(fullPath)) {
    // Fallback: check for YOUTUBE_PLAYLIST_ID env var (backward compatibility)
    if (process.env.YOUTUBE_PLAYLIST_ID) {
      logger.info('No playlists.yaml found, using YOUTUBE_PLAYLIST_ID env var');
      return PlaylistsConfigSchema.parse({
        playlists: [{
          id: process.env.YOUTUBE_PLAYLIST_ID,
          name: 'Default Playlist',
          enabled: true
        }]
      });
    }

    logger.warn('Playlists config file not found, using empty config', { path: fullPath });
    return PlaylistsConfigSchema.parse({});
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = parseYaml(content);

    // Validate with Zod schema
    const config = PlaylistsConfigSchema.parse(parsed);

    logger.info('Loaded playlists config', {
      playlistCount: config.playlists.length,
      enabledPlaylists: config.playlists.filter(p => p.enabled !== false).length
    });

    return config;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.error('Invalid playlists config', { error: error.message });
      throw new Error(`Invalid playlists configuration: ${error.message}`);
    }

    logger.error('Failed to load playlists config', { error });
    throw error;
  }
}

/**
 * Get enabled playlists from config
 */
export function getEnabledPlaylists(): PlaylistsConfig['playlists'] {
  const config = loadPlaylistsConfig();
  return config.playlists.filter(p => p.enabled !== false);
}

/**
 * Get playlist settings from config
 */
export function getPlaylistSettings(): PlaylistsConfig['settings'] {
  const config = loadPlaylistsConfig();
  return config.settings;
}
