import { generateRssFeed } from '../utils/rss'
import type { RssFeedConfig, RssItem } from '../utils/rss'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const feedConfig: RssFeedConfig = {
    siteUrl: config.public.siteUrl || 'http://localhost:3000',
    feedTitle: config.public.feedTitle || 'YouTube Summaries',
    feedDescription: config.public.feedDescription || 'AI-generated summaries of YouTube videos',
    feedLanguage: 'en-us'
  }

  // Query all summaries from the collection
  const summaries = await queryCollection(event, 'summaries').all()

  // Sort by processedAt descending (newest first) and map to RSS items
  const items: RssItem[] = [...summaries]
    .sort((a, b) => {
      const aDate = a.processedAt || ''
      const bDate = b.processedAt || ''
      return bDate.localeCompare(aDate)
    })
    .map(summary => ({
      title: summary.metadata?.title || 'Untitled',
      videoId: summary.metadata?.videoId || '',
      channel: summary.metadata?.channel || 'Unknown',
      tldr: summary.tldr,
      processedAt: summary.processedAt || new Date().toISOString(),
      youtubeUrl: summary.metadata?.youtubeUrl
    }))

  // Generate RSS XML
  const xml = generateRssFeed(items, feedConfig)

  // Set appropriate headers
  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return xml
})
