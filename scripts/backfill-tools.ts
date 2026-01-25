#!/usr/bin/env npx tsx
/**
 * Backfill Tools Extraction Script
 *
 * Extracts tools from existing summaries that were processed before the
 * tools extraction feature was added.
 *
 * Rate limiting: Designed for DeepSeek R1 free tier via OpenRouter
 * - Conservative 2 RPM (30 second delays between requests)
 * - Resumable via progress tracking
 *
 * Usage:
 *   npx tsx scripts/backfill-tools.ts
 *   npx tsx scripts/backfill-tools.ts --dry-run     # Preview without API calls
 *   npx tsx scripts/backfill-tools.ts --batch=50    # Process only 50 summaries
 *   npx tsx scripts/backfill-tools.ts --delay=60000 # 60 second delay (1 RPM)
 */

import 'dotenv/config';
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// Configuration
const SUMMARIES_DIR = 'src/content/summaries';
const PROGRESS_FILE = 'scripts/.backfill-tools-progress.json';
const DEFAULT_DELAY_MS = 30000; // 30 seconds = ~2 RPM
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1';

interface Tool {
  name: string;
  url: string | null;
}

interface Progress {
  processed: string[];
  failed: string[];
  lastRun: string;
}

interface ParsedSummary {
  frontmatter: Record<string, unknown>;
  body: string;
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    dryRun: args.includes('--dry-run'),
    batch: 0,
    delay: DEFAULT_DELAY_MS
  };

  for (const arg of args) {
    if (arg.startsWith('--batch=')) {
      config.batch = parseInt(arg.split('=')[1], 10);
    }
    if (arg.startsWith('--delay=')) {
      config.delay = parseInt(arg.split('=')[1], 10);
    }
  }

  return config;
}

// Load or initialize progress
async function loadProgress(): Promise<Progress> {
  try {
    const data = await readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { processed: [], failed: [], lastRun: '' };
  }
}

// Save progress
async function saveProgress(progress: Progress): Promise<void> {
  progress.lastRun = new Date().toISOString();
  await writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Parse markdown with YAML frontmatter
function parseSummaryFile(content: string): ParsedSummary {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid summary file format');
  }
  return {
    frontmatter: parseYaml(match[1]),
    body: match[2]
  };
}

// Rebuild summary file with updated frontmatter
function rebuildSummaryFile(frontmatter: Record<string, unknown>, body: string): string {
  const yamlContent = stringifyYaml(frontmatter, {
    lineWidth: 0, // Don't wrap lines
    defaultKeyType: 'PLAIN',
    defaultStringType: 'QUOTE_DOUBLE'
  });
  return `---\n${yamlContent}---\n${body}`;
}

// Extract tools using OpenRouter API
async function extractTools(
  apiKey: string,
  title: string,
  description: string,
  summaryText: string
): Promise<Tool[]> {
  const prompt = `Extract software tools, libraries, frameworks, APIs, and services mentioned in this video summary.

Video Title: ${title}

Video Description:
${description}

Summary:
${summaryText}

Return ONLY a JSON object with a "tools" array. For each tool:
- "name": The canonical/official name (e.g., "Next.js" not "NextJS")
- "url": The official URL if mentioned in the description, otherwise null

Rules:
- Only specific, named tools (not generic concepts like "AI" or "the cloud")
- Check the description for URLs - they often contain links to mentioned tools
- Maximum 15 tools
- Return {"tools": []} if no tools are mentioned

Example response:
{"tools": [{"name": "Claude Code", "url": null}, {"name": "Model Context Protocol", "url": null}]}`;

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://youtube-summarizer.app',
      'X-Title': 'YouTube Summarizer - Backfill'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for more consistent extraction
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(`API error: ${result.error.message}`);
  }

  const text = result.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Empty response from API');
  }

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn('No JSON found in response, returning empty tools');
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const tools: Tool[] = Array.isArray(parsed.tools)
      ? parsed.tools
          .filter((t: unknown): t is Tool =>
            typeof t === 'object' &&
            t !== null &&
            typeof (t as Tool).name === 'string'
          )
          .map((t: Tool) => ({
            name: t.name,
            url: typeof t.url === 'string' ? t.url : null
          }))
          .slice(0, 15)
      : [];
    return tools;
  } catch {
    console.warn('Failed to parse JSON, returning empty tools');
    return [];
  }
}

// Get all video IDs from summaries directory
async function getAllVideoIds(): Promise<string[]> {
  const entries = await readdir(SUMMARIES_DIR);
  const videoIds: string[] = [];

  for (const entry of entries) {
    const summaryPath = join(SUMMARIES_DIR, entry, 'summary.md');
    try {
      await stat(summaryPath);
      videoIds.push(entry);
    } catch {
      // Skip if no summary.md
    }
  }

  return videoIds;
}

// Check if summary already has tools
async function hasTools(videoId: string): Promise<boolean> {
  const summaryPath = join(SUMMARIES_DIR, videoId, 'summary.md');
  const content = await readFile(summaryPath, 'utf-8');
  const { frontmatter } = parseSummaryFile(content);
  return Array.isArray(frontmatter.tools) && frontmatter.tools.length > 0;
}

// Process a single video
async function processVideo(
  videoId: string,
  apiKey: string,
  dryRun: boolean
): Promise<{ tools: Tool[]; skipped: boolean }> {
  const summaryPath = join(SUMMARIES_DIR, videoId, 'summary.md');
  const content = await readFile(summaryPath, 'utf-8');
  const { frontmatter, body } = parseSummaryFile(content);

  // Skip if already has tools
  if (Array.isArray(frontmatter.tools) && frontmatter.tools.length > 0) {
    return { tools: frontmatter.tools as Tool[], skipped: true };
  }

  const metadata = frontmatter.metadata as Record<string, string>;
  const title = metadata?.title || '';
  const description = metadata?.description || '';

  if (dryRun) {
    console.log(`  [DRY RUN] Would extract tools from "${title.slice(0, 50)}..."`);
    return { tools: [], skipped: false };
  }

  // Extract tools using AI
  const tools = await extractTools(apiKey, title, description, body);

  // Update frontmatter
  frontmatter.tools = tools;

  // Write updated file
  const updatedContent = rebuildSummaryFile(frontmatter, body);
  await writeFile(summaryPath, updatedContent, 'utf-8');

  return { tools, skipped: false };
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format duration for display
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// Main function
async function main() {
  const config = parseArgs();
  const apiKey = process.env.OPEN_ROUTER_API_KEY;

  if (!apiKey && !config.dryRun) {
    console.error('❌ OPEN_ROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('🔧 Backfill Tools Extraction Script');
  console.log('====================================');
  console.log(`Mode: ${config.dryRun ? 'DRY RUN (no API calls)' : 'LIVE'}`);
  console.log(`Model: ${MODEL}`);
  console.log(`Delay between requests: ${config.delay / 1000}s (~${Math.floor(60000 / config.delay)} RPM)`);
  if (config.batch > 0) {
    console.log(`Batch limit: ${config.batch} videos`);
  }
  console.log('');

  // Load progress
  const progress = await loadProgress();
  console.log(`📊 Progress: ${progress.processed.length} processed, ${progress.failed.length} failed`);

  // Get all video IDs
  const allVideoIds = await getAllVideoIds();
  console.log(`📁 Total summaries: ${allVideoIds.length}`);

  // Filter out already processed
  const toProcess = allVideoIds.filter(id =>
    !progress.processed.includes(id) && !progress.failed.includes(id)
  );
  console.log(`⏳ Remaining to process: ${toProcess.length}`);

  // Apply batch limit
  const batch = config.batch > 0
    ? toProcess.slice(0, config.batch)
    : toProcess;

  if (batch.length === 0) {
    console.log('\n✅ All summaries have been processed!');
    return;
  }

  // Estimate time
  const estimatedTime = batch.length * config.delay;
  console.log(`\n⏱️  Estimated time: ${formatDuration(estimatedTime)}`);
  console.log(`   Processing ${batch.length} videos...\n`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  let toolsExtracted = 0;

  for (let i = 0; i < batch.length; i++) {
    const videoId = batch[i];
    const progressPct = ((i + 1) / batch.length * 100).toFixed(1);

    try {
      console.log(`[${i + 1}/${batch.length}] (${progressPct}%) Processing ${videoId}...`);

      const result = await processVideo(videoId, apiKey!, config.dryRun);

      if (result.skipped) {
        console.log(`  ⏭️  Skipped (already has ${result.tools.length} tools)`);
        skipped++;
      } else {
        console.log(`  ✅ Extracted ${result.tools.length} tools${result.tools.length > 0 ? `: ${result.tools.map(t => t.name).join(', ')}` : ''}`);
        toolsExtracted += result.tools.length;
        processed++;
      }

      if (!config.dryRun) {
        progress.processed.push(videoId);
        await saveProgress(progress);
      }

      // Rate limiting delay (skip on last item)
      if (i < batch.length - 1 && !config.dryRun && !result.skipped) {
        const remaining = batch.length - i - 1;
        const eta = formatDuration(remaining * config.delay);
        console.log(`  ⏳ Waiting ${config.delay / 1000}s... (ETA: ${eta})`);
        await sleep(config.delay);
      }
    } catch (error) {
      console.error(`  ❌ Failed: ${(error as Error).message}`);
      if (!config.dryRun) {
        progress.failed.push(videoId);
        await saveProgress(progress);
      }
      failed++;

      // Still wait on error to respect rate limits
      if (i < batch.length - 1 && !config.dryRun) {
        console.log(`  ⏳ Waiting ${config.delay / 1000}s after error...`);
        await sleep(config.delay);
      }
    }
  }

  console.log('\n====================================');
  console.log('📈 Summary:');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Tools extracted: ${toolsExtracted}`);
  console.log(`\n   Total progress: ${progress.processed.length}/${allVideoIds.length}`);

  if (toProcess.length - batch.length > 0) {
    console.log(`\n💡 Run again to process remaining ${toProcess.length - batch.length} videos`);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
