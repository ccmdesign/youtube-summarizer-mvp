import { parseIsoDuration } from '~/server/utils/duration';

/**
 * Video length classification for prompt selection.
 * - standard: Videos under 30 minutes
 * - longform: Videos 30 minutes or longer (podcasts, lectures, documentaries)
 */
export type LengthCategory = 'standard' | 'longform';

/**
 * Video taxonomy for determining which prompt template to use.
 * Extensible for future categories (topic, format, language).
 */
export interface VideoTaxonomy {
  length: LengthCategory;
}

/**
 * Threshold in seconds for long-form video classification.
 * Videos >= this duration use the long-form prompt template.
 */
export const LONGFORM_THRESHOLD_SECONDS = 30 * 60; // 30 minutes

/**
 * Classify a video based on its duration.
 *
 * @param durationIso - ISO 8601 duration string (e.g., "PT35M10S")
 * @returns VideoTaxonomy with length classification
 *
 * @example
 * classifyVideo("PT35M10S") // { length: "longform" }
 * classifyVideo("PT10M25S") // { length: "standard" }
 * classifyVideo("PT30M0S")  // { length: "longform" } (exactly 30 min is longform)
 */
export function classifyVideo(durationIso: string): VideoTaxonomy {
  const seconds = parseIsoDuration(durationIso);

  return {
    length: seconds >= LONGFORM_THRESHOLD_SECONDS ? 'longform' : 'standard'
  };
}

/**
 * Get human-readable description of a length category.
 */
export function getLengthDescription(category: LengthCategory): string {
  switch (category) {
    case 'longform':
      return 'Long-form video (30+ minutes)';
    case 'standard':
      return 'Standard video (under 30 minutes)';
  }
}
