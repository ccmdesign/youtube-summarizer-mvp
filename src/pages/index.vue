<template>
  <ccm-section>
    <div class="stack">
      <div class="header-row">
        <h2>Video Summaries</h2>
        <div class="controls-row">
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
          <select v-model="categoryFilter" class="category-filter">
            <option value="all">All Categories</option>
            <option value="standard">Standard (&lt;30 min)</option>
            <option value="longform">Long-form (30+ min)</option>
          </select>
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

const { data: summaries, pending } = useContentStream('summaries')

const sortBy = ref<'publishedAt' | 'processedAt'>('processedAt')
const categoryFilter = ref<'all' | 'standard' | 'longform'>('all')

const sortedSummaries = computed(() => {
  if (!summaries.value) return []

  // Filter by category
  let filtered = [...summaries.value]
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(s => {
      // Handle older summaries without lengthCategory
      if (!s.lengthCategory) return categoryFilter.value === 'standard'
      return s.lengthCategory === categoryFilter.value
    })
  }

  // Sort
  const sorted = filtered.sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]

    if (!aValue || !bValue) return 0

    // Both are ISO date strings, compare directly
    return bValue.localeCompare(aValue) // desc order (newest first)
  })

  return sorted
})
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-m);
}

.controls-row {
  display: flex;
  align-items: center;
  gap: var(--space-m);
}

.sort-buttons {
  display: flex;
  gap: var(--space-xs);
}

.category-filter {
  padding: var(--space-xs) var(--space-s);
  border: 1px solid var(--color-base-tint-10);
  border-radius: var(--radius-s);
  background: var(--color-surface, #fff);
  font-size: var(--step--1, 0.875rem);
  cursor: pointer;
}

.category-filter:hover {
  border-color: var(--color-primary);
}

.category-filter:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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