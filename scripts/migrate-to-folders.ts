#!/usr/bin/env tsx
/**
 * Migration script: Convert flat markdown files to folder-based structure
 *
 * Before: src/content/summaries/{videoId}.md
 * After:  src/content/summaries/{videoId}/summary.md
 *                                         /metadata.yml
 *
 * Note: transcript.json will not be created for existing files
 * (would require re-fetching from YouTube API)
 */

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

const SUMMARIES_DIR = 'src/content/summaries';

interface MigrationResult {
  total: number;
  migrated: number;
  skipped: number;
  errors: string[];
}

interface ParsedFrontmatter {
  title?: string;
  videoId?: string;
  channel?: string;
  channelId?: string;
  duration?: string;
  publishedAt?: string;
  processedAt?: string;
  source?: string;
  playlistId?: string;
  playlistName?: string;
  category?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  modelUsed?: string;
  tldr?: string;
  lengthCategory?: string;
  aiProvider?: string;
  apiCalls?: number;
  fallbackAttempts?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  processingTimeMs?: number;
}

function parseFrontmatter(content: string): { frontmatter: ParsedFrontmatter | null; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  try {
    const frontmatter = YAML.parse(match[1]) as ParsedFrontmatter;
    return { frontmatter, body: match[2] };
  } catch {
    return { frontmatter: null, body: content };
  }
}

async function migrate(): Promise<MigrationResult> {
  const result: MigrationResult = {
    total: 0,
    migrated: 0,
    skipped: 0,
    errors: []
  };

  const summariesPath = path.join(process.cwd(), SUMMARIES_DIR);

  // Ensure directory exists
  try {
    await fs.access(summariesPath);
  } catch {
    console.error(`Directory not found: ${summariesPath}`);
    process.exit(1);
  }

  const entries = await fs.readdir(summariesPath, { withFileTypes: true });

  // Filter for .md files (not directories)
  const mdFiles = entries.filter(e => e.isFile() && e.name.endsWith('.md'));
  result.total = mdFiles.length;

  console.log(`Found ${mdFiles.length} markdown files to migrate\n`);

  for (const file of mdFiles) {
    const videoId = file.name.replace('.md', '');
    const oldPath = path.join(summariesPath, file.name);
    const newDir = path.join(summariesPath, videoId);
    const newSummaryPath = path.join(newDir, 'summary.md');
    const newMetadataPath = path.join(newDir, 'metadata.yml');

    try {
      // Check if already migrated (directory exists with summary.md)
      try {
        await fs.access(newSummaryPath);
        console.log(`  [SKIP] ${videoId} - already migrated`);
        result.skipped++;
        continue;
      } catch {
        // Directory doesn't exist or no summary.md, proceed with migration
      }

      // Read existing markdown content
      const content = await fs.readFile(oldPath, 'utf-8');
      const { frontmatter } = parseFrontmatter(content);

      // Create video directory
      await fs.mkdir(newDir, { recursive: true });

      // Write summary.md (entire content as-is)
      await fs.writeFile(newSummaryPath, content, 'utf-8');

      // Create metadata.yml from frontmatter
      if (frontmatter) {
        const metadata = {
          videoId: frontmatter.videoId || videoId,
          title: frontmatter.title || 'Untitled',
          description: '', // Not available in existing files
          channel: frontmatter.channel || 'Unknown',
          channelId: frontmatter.channelId || '',
          duration: frontmatter.duration || '',
          publishedAt: frontmatter.publishedAt || '',
          thumbnailUrl: frontmatter.thumbnailUrl || '',
          youtubeUrl: frontmatter.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
          source: frontmatter.source || 'youtube',
          playlistId: frontmatter.playlistId,
          playlistName: frontmatter.playlistName,
          category: frontmatter.category,
          processedAt: frontmatter.processedAt || new Date().toISOString(),
          modelUsed: frontmatter.modelUsed,
          lengthCategory: frontmatter.lengthCategory,
          aiProvider: frontmatter.aiProvider,
          apiCalls: frontmatter.apiCalls,
          fallbackAttempts: frontmatter.fallbackAttempts,
          inputTokens: frontmatter.inputTokens,
          outputTokens: frontmatter.outputTokens,
          totalTokens: frontmatter.totalTokens,
          processingTimeMs: frontmatter.processingTimeMs,
          migratedAt: new Date().toISOString(),
          // Note: description and transcript not available for migrated files
          _migrationNote: 'Migrated from flat file structure. Description and transcript.json not available.'
        };

        // Remove undefined values
        const cleanedMetadata = Object.fromEntries(
          Object.entries(metadata).filter(([_, v]) => v !== undefined)
        );

        await fs.writeFile(newMetadataPath, YAML.stringify(cleanedMetadata), 'utf-8');
      }

      // Remove old file
      await fs.unlink(oldPath);

      console.log(`  [OK] ${videoId}`);
      result.migrated++;

    } catch (error) {
      const msg = `${videoId}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`  [ERROR] ${msg}`);
      result.errors.push(msg);
    }
  }

  return result;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Migration: Flat Files -> Folder Structure');
  console.log('='.repeat(60));
  console.log();
  console.log('This will convert:');
  console.log('  src/content/summaries/{videoId}.md');
  console.log('To:');
  console.log('  src/content/summaries/{videoId}/summary.md');
  console.log('  src/content/summaries/{videoId}/metadata.yml');
  console.log();
  console.log('Note: transcript.json will NOT be created for existing files.');
  console.log('      (Would require re-fetching from YouTube API)');
  console.log();
  console.log('-'.repeat(60));
  console.log();

  const result = await migrate();

  console.log();
  console.log('='.repeat(60));
  console.log('Migration Complete');
  console.log('='.repeat(60));
  console.log();
  console.log(`  Total files:   ${result.total}`);
  console.log(`  Migrated:      ${result.migrated}`);
  console.log(`  Skipped:       ${result.skipped}`);
  console.log(`  Errors:        ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log();
    console.log('Errors:');
    result.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log();

  // Exit with error code if there were failures
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
