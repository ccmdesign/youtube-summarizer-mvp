/**
 * Parse ISO 8601 duration string to seconds
 *
 * Examples:
 * - "PT3M33S" -> 213 seconds
 * - "PT1H30M" -> 5400 seconds
 * - "PT45S" -> 45 seconds
 * - "P1DT2H3M4S" -> 93784 seconds
 *
 * @param duration ISO 8601 duration string (e.g., "PT3M33S")
 * @returns Duration in seconds
 */
export function parseIsoDuration(duration: string): number {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  // Match pattern: P[nD]T[nH][nM][nS]
  const regex = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) {
    return 0;
  }

  const days = parseInt(matches[1] || '0', 10);
  const hours = parseInt(matches[2] || '0', 10);
  const minutes = parseInt(matches[3] || '0', 10);
  const seconds = parseInt(matches[4] || '0', 10);

  return (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
}

/**
 * Check if a video duration indicates it's a YouTube Short
 *
 * @param duration ISO 8601 duration string
 * @param thresholdSeconds Duration threshold in seconds (default: 60)
 * @returns true if the video is shorter than the threshold
 */
export function isShortVideo(duration: string, thresholdSeconds: number = 60): boolean {
  const durationInSeconds = parseIsoDuration(duration);
  return durationInSeconds > 0 && durationInSeconds < thresholdSeconds;
}
