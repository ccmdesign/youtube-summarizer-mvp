import { calculatePeriods, groupVideosByPeriod, generateDigestXml } from '../utils/digest'
import type { DigestFeedConfig } from '~/types/digest'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const feedConfig: DigestFeedConfig = {
    siteUrl: config.public.siteUrl || 'http://localhost:3000',
    title: config.public.digestTitle || 'YouTube Digest',
    description: config.public.digestDescription || 'Periodic roundup of AI-generated video summaries',
    introText: config.public.digestIntroText || 'Welcome to this period\'s video digest!',
    footerText: config.public.digestFooterText || 'Thanks for reading!',
    periodDays: config.public.digestPeriodDays || 3,
    epochDate: config.public.digestEpochDate || '2026-01-01',
    maxPeriods: config.public.digestMaxPeriods || 10,
    language: 'en-us'
  }

  // Query all summaries from the collection
  const summaries = await queryCollection(event, 'summaries').all()

  // Calculate complete periods from epoch to now
  const periods = calculatePeriods(
    feedConfig.epochDate,
    feedConfig.periodDays,
    feedConfig.maxPeriods
  )

  // Group videos by period (filters out empty periods)
  const digestItems = groupVideosByPeriod(summaries, periods, feedConfig.siteUrl)

  // Generate RSS XML
  const xml = generateDigestXml(digestItems, feedConfig)

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return xml
})
