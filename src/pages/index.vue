<template>
  <ccm-section>
    <div class="stack">
      <div class="sync-section">
        <ccm-button
          @click="handleSync"
          :disabled="isSyncing"
          variant="primary"
          color="primary"
        >
          {{ isSyncing ? 'Syncing...' : 'Sync Playlist' }}
        </ccm-button>
        <span v-if="isSyncing" class="sync-loading">
          {{ currentVideoTitle || 'Starting sync...' }}
          <template v-if="syncProgress.current && syncProgress.total">
            ({{ syncProgress.current }}/{{ syncProgress.total }})
          </template>
        </span>
        <p v-if="syncStatus" class="sync-status">{{ syncStatus }}</p>
      </div>

      <div class="header-row">
        <h2>Video Summaries</h2>
        <div class="sort-buttons">
          <ccm-button
            @click="sortBy = 'publishedAt'"
            :variant="sortBy === 'publishedAt' ? 'primary' : 'secondary'"
            size="m"
          >
            Sort by Video Date
          </ccm-button>
          <ccm-button
            @click="sortBy = 'processedAt'"
            :variant="sortBy === 'processedAt' ? 'primary' : 'secondary'"
            size="m"
          >
            Sort by Recently Added
          </ccm-button>
        </div>
      </div>
      <ul v-if="sortedSummaries && sortedSummaries.length > 0" class="summaries-list | stack">
        <li class="summary-item"
          v-for="summary in sortedSummaries" 
          :key="summary.videoId" 
          :to="`/summaries/${summary.videoId}`"
          :title="summary.title"
        >
          <img
            v-if="summary.thumbnailUrl"
            :src="summary.thumbnailUrl"
            :alt="`Thumbnail for ${summary.title}`"
            class="summary-thumb"
            loading="lazy"
          />
          <div class="summary-content">
            <div class="summary-meta">
              <span class="channel">{{ summary.channel }}</span> |
              <span class="date">{{ formatDate(summary.publishedAt) }}</span> |
              <a :href="`https://www.youtube.com/watch?v=${summary.videoId}`" target="_blank" rel="noopener" class="video-link">Watch on YouTube</a>
            </div>
            <h3><nuxt-link :to="`/summaries/${summary.videoId}`">{{ summary.title }}</nuxt-link></h3>
            <div v-if="summary.tldr" class="tldr" v-html="marked.parse(summary.tldr)"></div>
          </div>
        </li>
      </ul>
      <p v-else-if="!pending">No summaries found</p>
      <p v-else>Loading...</p>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'
import type { SyncResult } from '~/types/config'
import { marked } from 'marked'

// Configure marked for inline rendering (no <p> wrappers)
marked.use({
  renderer: {
    paragraph(token) {
      return token.text
    }
  }
})

definePageMeta({
  hero: false,
  footer: false
})

const { data: summaries, pending, refresh: refreshSummaries } = useContentStream('summaries')

const sortBy = ref<'publishedAt' | 'processedAt'>('processedAt')

const sortedSummaries = computed(() => {
  if (!summaries.value) return []
  
  const sorted = [...summaries.value].sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]
    
    if (!aValue || !bValue) return 0
    
    // Both are ISO date strings, compare directly
    return bValue.localeCompare(aValue) // desc order (newest first)
  })
  
  return sorted
})

const isSyncing = ref(false)
const syncStatus = ref('')
const currentVideoTitle = ref('')
const syncProgress = ref({ current: 0, total: 0 })

const isLocalhost = computed(() => {
  if (import.meta.client) {
    return window.location.hostname === 'localhost' 
      || window.location.hostname === '127.0.0.1'
  }
  return false
})

async function handleSync() {
  isSyncing.value = true
  syncStatus.value = ''
  currentVideoTitle.value = ''
  syncProgress.value = { current: 0, total: 0 }

  try {
    if (isLocalhost.value) {
      // Use streaming endpoint on localhost
      const response = await fetch('/api/sync-stream', { method: 'POST' })
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete message in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))

              if (event.type === 'processing') {
                currentVideoTitle.value = event.videoTitle || ''
                syncProgress.value = {
                  current: event.current || 0,
                  total: event.total || 0
                }
              } else if (event.type === 'complete' && event.result) {
                const result = event.result as SyncResult
                syncStatus.value = `Sync completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`
              } else if (event.type === 'error') {
                syncStatus.value = `Sync failed: ${event.error}`
              }
            } catch {
              // Ignore JSON parse errors
            }
          }
        }
      }

      // Refresh summaries after sync
      await refreshSummaries()
    } else {
      // Trigger GitHub Actions on production
      const response = await fetch('/.netlify/functions/trigger-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ maxVideos: 10 })
      })

      const data = await response.json()

      if (data.success) {
        syncStatus.value = data.message || 'Sync triggered successfully!'
        if (data.note) {
          syncStatus.value += '\n\n' + data.note
        }
      } else {
        syncStatus.value = `Sync failed: ${data.error || data.details || 'Unknown error'}`
      }
    }
  } catch (error) {
    syncStatus.value = `Sync failed: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isSyncing.value = false
    currentVideoTitle.value = ''
    syncProgress.value = { current: 0, total: 0 }
  }
}
</script>

<style scoped>
.sync-section {
  display: flex;
  align-items: center;
  gap: var(--space-m);
  flex-wrap: wrap;
}

.sync-loading {
  font-size: var(--step--1, 0.875rem);
  color: var(--color-primary, #0066cc);
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-m);
}

.sort-buttons {
  display: flex;
  gap: var(--space-xs);
}

.summary-item {
  padding: var(--space-m);
  border: 1px solid var(--color-base-tint-10);
  border-radius: var(--radius-s);
  display: flex;
  gap: var(--space-m);

  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.summary-thumb {
  width: 200px;
  aspect-ratio: 16/9;
}

.tldr {
  font-size: var(--step--1, 0.875rem);
  color: var(--color-base-shade-10, #666);
  line-height: 1.5;
}

.tldr :deep(ul) {
  margin: 0.5em 0;
  padding-left: 1.5em;
  list-style-type: disc;
}

.tldr :deep(li) {
  margin: 0.25em 0;
}

.tldr :deep(strong) {
  font-weight: 600;
  color: var(--color-base, #333);
}
</style>