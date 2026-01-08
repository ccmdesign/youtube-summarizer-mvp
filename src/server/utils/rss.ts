export interface RssFeedConfig {
  siteUrl: string
  feedTitle: string
  feedDescription: string
  feedLanguage: string
}

export interface RssItem {
  title: string
  videoId: string
  channel: string
  tldr?: string
  processedAt: string
  youtubeUrl?: string
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Convert ISO 8601 date to RFC 822 format (required by RSS 2.0)
 */
function toRfc822Date(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toUTCString()
}

/**
 * Generate RSS 2.0 feed XML
 */
export function generateRssFeed(items: RssItem[], config: RssFeedConfig): string {
  const { siteUrl, feedTitle, feedDescription, feedLanguage } = config

  const itemsXml = items.map((item) => {
    const itemUrl = `${siteUrl}/summaries/${item.videoId}`
    const description = item.tldr
      ? `${item.tldr}\n\nChannel: ${item.channel}${item.youtubeUrl ? `\nWatch on YouTube: ${item.youtubeUrl}` : ''}`
      : `Summary of "${item.title}" by ${item.channel}`

    return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${itemUrl}</link>
      <guid isPermaLink="true">${itemUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${toRfc822Date(item.processedAt)}</pubDate>
    </item>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>${feedLanguage}</language>
    <lastBuildDate>${toRfc822Date(new Date().toISOString())}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}
