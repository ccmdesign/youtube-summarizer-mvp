import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        published: z.boolean().default(true)
      })
    }),
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        published: z.boolean().default(true),
        title: z.string().optional(),
        description: z.string().optional(),
        hero: z
          .object({
            brow: z.string().optional(),
            title: z.string().optional(),
            tagline: z.string().optional(),
            backgroundColor: z.string().optional(),
            size: z.string().optional(),
            hideTopbar: z.boolean().optional()
          })
          .optional(),
        order: z.number().optional(),
        tags: z.array(z.string()).optional()
      })
    })
  }
})
