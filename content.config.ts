import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const rootDir = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(rootDir, 'src/content')

// Video metadata from YouTube API
const videoMetadataSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  channel: z.string(),
  channelId: z.string(),
  duration: z.string(),
  publishedAt: z.string(),
  thumbnailUrl: z.string(),
  youtubeUrl: z.string()
})

// AI processing metrics
const aiMetricsSchema = z.object({
  provider: z.string(),
  model: z.string(),
  apiCalls: z.number(),
  fallbackAttempts: z.number(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  processingTimeMs: z.number()
})

export default defineContentConfig({
  collections: {
    summaries: defineCollection({
      type: 'page',
      source: {
        include: 'summaries/*/summary.md',
        cwd: contentDir
      },
      schema: z.object({
        // Video metadata from YouTube
        metadata: videoMetadataSchema,
        // Processing info
        processedAt: z.string(),
        source: z.literal('youtube').default('youtube'),
        // Playlist/category info
        playlistId: z.string().optional(),
        playlistName: z.string().optional(),
        category: z.string().optional(),
        // AI-generated content
        tldr: z.string().optional(),
        // AI processing metrics
        ai: aiMetricsSchema.optional()
      })
    })
  }
})
