// https://nuxt.com/docs/api/configuration/nuxt-config
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const currentDir = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(currentDir, '..')

export default defineNuxtConfig({
  rootDir: projectRoot,
  srcDir: currentDir,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: [
    '@nuxt/eslint'
  ],
  runtimeConfig: {
    // Private keys (server-only) - set via NUXT_CRON_SECRET env var
    cronSecret: process.env.CRON_SECRET || '',
    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      feedTitle: 'YouTube Summaries',
      feedDescription: 'AI-generated summaries of YouTube videos',
      // Digest feed configuration
      digestTitle: process.env.DIGEST_TITLE || 'YouTube Digest',
      digestDescription: process.env.DIGEST_DESCRIPTION || 'Periodic roundup of AI-generated video summaries',
      digestIntroText: process.env.DIGEST_INTRO_TEXT || 'Welcome to this period\'s video digest! Here are the latest AI-generated summaries from our curated YouTube content.',
      digestFooterText: process.env.DIGEST_FOOTER_TEXT || 'Thanks for reading! Visit our site for more summaries and insights.',
      digestPeriodDays: Number(process.env.DIGEST_PERIOD_DAYS) || 3,
      digestEpochDate: process.env.DIGEST_EPOCH_DATE || '2026-01-01',
      digestMaxPeriods: Number(process.env.DIGEST_MAX_PERIODS) || 10,
    }
  },
  // Disable SSR - backend only
  ssr: false,
  serverDir: resolve(currentDir, 'server'),
  nitro: {
    // No prerendering needed for backend-only server
  }
})
