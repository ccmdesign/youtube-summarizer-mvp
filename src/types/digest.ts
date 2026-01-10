/**
 * Digest feed types for RSS newsletter generation
 */

export interface DigestPeriod {
  startDate: Date
  endDate: Date
  periodId: string // Format: "YYYY-MM-DD" of start date
}

export interface DigestVideo {
  title: string
  videoId: string
  channel: string
  tldr: string | null
  summaryUrl: string
  youtubeUrl: string
  processedAt: string
}

export interface DigestItem {
  period: DigestPeriod
  videos: DigestVideo[]
}

export interface DigestFeedConfig {
  siteUrl: string
  title: string
  description: string
  introText: string
  footerText: string
  periodDays: number
  epochDate: string
  maxPeriods: number
  language: string
}
