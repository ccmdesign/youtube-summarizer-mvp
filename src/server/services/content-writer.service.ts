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
    const { metrics } = summary;

    // Build metrics section (only include defined values)
    const metricsLines: string[] = [];
    metricsLines.push(`aiProvider: "${metrics.provider}"`);
    metricsLines.push(`apiCalls: ${metrics.apiCalls}`);
    metricsLines.push(`fallbackAttempts: ${metrics.fallbackAttempts}`);
    if (metrics.inputTokens !== undefined) {
      metricsLines.push(`inputTokens: ${metrics.inputTokens}`);
    }
    if (metrics.outputTokens !== undefined) {
      metricsLines.push(`outputTokens: ${metrics.outputTokens}`);
    }
    if (metrics.totalTokens !== undefined) {
      metricsLines.push(`totalTokens: ${metrics.totalTokens}`);
    }
    metricsLines.push(`processingTimeMs: ${metrics.processingTimeMs}`);

    // Assemble markdown body from structured sections
    // We control the headers, AI provides the content
    const body = this.assembleMarkdownBody(summary);

    return `---
title: "${this.escapeYaml(metadata.title)}"
videoId: "${videoId}"
channel: "${this.escapeYaml(metadata.channel)}"
channelId: "${metadata.channelId}"
duration: "${metadata.duration}"
publishedAt: "${metadata.publishedAt}"
processedAt: "${new Date().toISOString()}"
source: "youtube"
playlistId: "${process.env.YOUTUBE_PLAYLIST_ID || ''}"
thumbnailUrl: "${metadata.thumbnailUrl}"
youtubeUrl: "https://www.youtube.com/watch?v=${videoId}"
modelUsed: "${summary.modelUsed}"
tldr: "${this.escapeYaml(summary.tldr)}"
# AI Processing Metrics
${metricsLines.join('\n')}
---

${body}
`;
  }

  /**
   * Assemble markdown body from structured sections.
   * We control the headers, AI provides the content.
   */
  private assembleMarkdownBody(summary: MarkdownInput['summary']): string {
    const sections: string[] = [];

    // Key Takeaways section
    if (summary.keyTakeaways?.trim()) {
      sections.push(`## Key Takeaways\n\n${this.normalizeSectionContent(summary.keyTakeaways)}`);
    }

    // Summary section
    if (summary.summary?.trim()) {
      sections.push(`## Summary\n\n${this.normalizeSectionContent(summary.summary)}`);
    }

    // Context section
    if (summary.context?.trim()) {
      sections.push(`## Context\n\n${this.normalizeSectionContent(summary.context)}`);
    }

    return sections.join('\n\n');
  }

  /**
   * Normalize section content to ensure proper line breaks.
   * Fixes: bullet points on same line, missing paragraph breaks, ### headers.
   */
  private normalizeSectionContent(content: string): string {
    let normalized = content.trim();

    // Ensure bullet points are on separate lines
    // Match: end of sentence/item + space + bullet marker
    normalized = normalized
      .replace(/([.!?:])(\s+)([-*])\s/g, '$1\n\n$3 ')  // After punctuation
      .replace(/([a-z])(\s+)([-*])\s/g, '$1\n\n$3 ');   // After lowercase (list continuation)

    // Ensure ### headers have blank lines before and after
    // Add newline before ### if not present
    normalized = normalized.replace(/([^\n])(###\s)/g, '$1\n\n$2');

    // Fix run-together text: lowercase immediately followed by uppercase
    // Pattern: "StrategyThe" -> "Strategy\n\nThe"
    // This catches headers running into content and sentences without space
    normalized = normalized.replace(/([a-z])([A-Z][a-z])/g, '$1\n\n$2');

    // Collapse multiple blank lines
    normalized = normalized.replace(/\n{3,}/g, '\n\n');

    return normalized;
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
