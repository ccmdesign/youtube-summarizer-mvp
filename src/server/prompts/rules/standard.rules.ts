import { mergeRules, formatRulesForPrompt, type PromptRules } from './base.rules';

/**
 * Rules specific to standard-length videos (< 30 minutes).
 * These are merged with base rules.
 */
const standardSpecificRules: Partial<PromptRules> = {
  formatting: [],
  constraints: [],
  examples: {
    good: [
      'The Pomodoro Technique: • 25min work + 5min break • Start with hardest task • Track sessions'
    ],
    bad: [
      'This video shares important productivity tips'
    ]
  }
};

/**
 * Complete merged rules for standard videos.
 */
export const standardRules = mergeRules(standardSpecificRules);

/**
 * Format standard rules as a string for template interpolation.
 */
export function getStandardFormattingRules(): string {
  return formatRulesForPrompt(standardRules);
}
