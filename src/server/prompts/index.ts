/**
 * Prompt Builder - Main Entry Point
 *
 * This module provides the primary interface for building prompts based on video taxonomy.
 * It routes to the appropriate template (standard vs longform) based on video duration.
 */

import type { VideoMetadata } from '~/types/summary';
import { classifyVideo, type LengthCategory, type VideoTaxonomy } from './taxonomy';
import { loadTemplate, interpolate, type TemplateVariables } from './loader';
import { getStandardFormattingRules } from './rules/standard.rules';
import { getLongformFormattingRules } from './rules/longform.rules';

// Re-export types and schema for backward compatibility
export { summaryResponseSchema, type SummaryResponse, type SummaryPromptInput } from './schemas/summary.schema';
export { classifyVideo, type LengthCategory, type VideoTaxonomy } from './taxonomy';

/**
 * Input for building a summary prompt with taxonomy support.
 */
export interface PromptBuilderInput {
  metadata: VideoMetadata;
  transcript?: string;
}

/**
 * Result from building a prompt, includes taxonomy for downstream use.
 */
export interface PromptBuilderResult {
  prompt: string;
  taxonomy: VideoTaxonomy;
}

/**
 * Get formatting rules based on length category.
 */
function getFormattingRules(category: LengthCategory): string {
  switch (category) {
    case 'longform':
      return getLongformFormattingRules();
    case 'standard':
    default:
      return getStandardFormattingRules();
  }
}

/**
 * Build a prompt for video summarization based on taxonomy.
 *
 * This is the main entry point for prompt generation. It:
 * 1. Classifies the video by duration
 * 2. Selects the appropriate template
 * 3. Interpolates variables
 * 4. Returns both the prompt and taxonomy
 *
 * @example
 * const { prompt, taxonomy } = buildPromptForVideo({
 *   metadata: { title: '...', duration: 'PT45M0S', ... },
 *   transcript: '...'
 * });
 * // taxonomy.length === 'longform'
 */
export function buildPromptForVideo(input: PromptBuilderInput): PromptBuilderResult {
  const { metadata, transcript } = input;

  // Classify video based on duration
  const taxonomy = classifyVideo(metadata.duration);

  // Load the appropriate template
  const template = loadTemplate(taxonomy.length);

  // Get formatting rules for this category
  const formattingRules = getFormattingRules(taxonomy.length);

  // Build template variables
  const variables: TemplateVariables = {
    title: metadata.title,
    channel: metadata.channel,
    duration: metadata.duration,
    publishedAt: metadata.publishedAt,
    lengthCategory: taxonomy.length,
    transcript,
    formattingRules
  };

  // Interpolate and return
  const prompt = interpolate(template, variables);

  return { prompt, taxonomy };
}

/**
 * Build a summary prompt (backward compatible wrapper).
 *
 * This maintains the same interface as the old summary.prompt.ts
 * for easy migration. Returns just the prompt string.
 *
 * @deprecated Use buildPromptForVideo() for access to taxonomy
 */
export function buildSummaryPrompt(input: PromptBuilderInput): string {
  const { prompt } = buildPromptForVideo(input);
  return prompt;
}
