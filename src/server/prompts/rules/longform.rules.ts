import { mergeRules, formatRulesForPrompt, type PromptRules } from './base.rules';

/**
 * Rules specific to long-form videos (>= 30 minutes).
 * These are merged with base rules.
 */
const longformSpecificRules: Partial<PromptRules> = {
  formatting: [
    'Use ### section headers to organize major topic shifts',
    'Include specific examples, data points, or quotes when available',
    'Maintain chronological flow where relevant'
  ],
  constraints: [
    'Summary should be 600-1000 words (longer than standard)',
    'Key takeaways should include 4-6 points (more than standard)',
    'Context should be 100-200 words (longer than standard)'
  ]
};

/**
 * Complete merged rules for long-form videos.
 */
export const longformRules = mergeRules(longformSpecificRules);

/**
 * Format long-form rules as a string for template interpolation.
 */
export function getLongformFormattingRules(): string {
  return formatRulesForPrompt(longformRules);
}
