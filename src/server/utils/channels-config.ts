import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';
import { ChannelsConfigSchema } from '~/types/channels';
import type { ChannelsConfig } from '~/types/channels';
import { logger } from './logger';

const CONFIG_FILE_PATH = 'src/config/channels.yaml';

/**
 * Load and validate channels configuration from YAML file
 */
export function loadChannelsConfig(): ChannelsConfig {
  const fullPath = path.join(process.cwd(), CONFIG_FILE_PATH);

  // Check if config file exists
  if (!fs.existsSync(fullPath)) {
    logger.warn('Channels config file not found, using empty config', { path: fullPath });
    return ChannelsConfigSchema.parse({});
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = parseYaml(content);

    // Validate with Zod schema
    const config = ChannelsConfigSchema.parse(parsed);

    logger.info('Loaded channels config', {
      channelCount: config.channels.length,
      enabledChannels: config.channels.filter(c => c.enabled !== false).length
    });

    return config;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      logger.error('Invalid channels config', { error: error.message });
      throw new Error(`Invalid channels configuration: ${error.message}`);
    }

    logger.error('Failed to load channels config', { error });
    throw error;
  }
}

/**
 * Get enabled channels from config
 */
export function getEnabledChannels(): ChannelsConfig['channels'] {
  const config = loadChannelsConfig();
  return config.channels.filter(c => c.enabled !== false);
}
