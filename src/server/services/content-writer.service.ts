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
tldr: "${this.escapeYaml(summary.tldr)}"
---

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
