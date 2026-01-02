import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

const rootDir = dirname(fileURLToPath(import.meta.url))
const contentDir = resolve(rootDir, 'src/content')

export default defineContentConfig({
  collections: {
    summaries: defineCollection({
      type: 'page',
      source: {
        include: 'summaries/*.md',
        cwd: contentDir
      },
      schema: z.object({
        title: z.string(),
        videoId: z.string(),
        channel: z.string(),
        publishedAt: z.string(),
        processedAt: z.string(),
        thumbnailUrl: z.string().optional(),
        youtubeUrl: z.string().optional(),
        tldr: z.string().optional()
      })
    })
  }
})
