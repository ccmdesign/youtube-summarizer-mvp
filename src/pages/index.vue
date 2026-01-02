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
              <span class="date">{{ formatDate(summary.publishedAt) }}</span>
            </div>
            <h3><nuxt-link :to="`/summaries/${summary.videoId}`">{{ summary.title }}</nuxt-link></h3>
            <p v-if="summary.tldr" class="tldr">{{ summary.tldr }}</p>
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

async function handleSync() {
  isSyncing.value = true
  syncStatus.value = ''
  
  try {
    const result = await $fetch('/api/sync', { method: 'POST' })
    syncStatus.value = `Sync completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`
    
    // Refresh summaries after sync
    await refreshSummaries()
  } catch (error) {
    syncStatus.value = `Sync failed: ${error instanceof Error ? error.message : String(error)}`
  } finally {
    isSyncing.value = false
  }
}
</script>

<style scoped>
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
</style>