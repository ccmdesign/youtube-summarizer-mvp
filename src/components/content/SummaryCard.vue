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

defineProps<{
  summary: {
    title: string
    videoId: string
    channel: string
    publishedAt: string
    processedAt: string
    thumbnailUrl?: string
    youtubeUrl?: string
    tldr?: string
  }
}>()
</script>

<template>
  <article class="summary-card">
    <img
      v-if="summary.thumbnailUrl"
      :src="summary.thumbnailUrl"
      :alt="`Thumbnail for ${summary.title}`"
      class="summary-card__thumb"
      loading="lazy"
    />
    <div class="summary-card__content">
      <div class="summary-card__meta | cluster">
        <a :href="`/channels/${summary.channel}`" class="summary-card__channel">{{ summary.channel }}</a>
        <span class="summary-card__separator">|</span>
        <span class="summary-card__date">{{ formatDate(summary.publishedAt) }}</span>
        <a
          :href="`https://www.youtube.com/watch?v=${summary.videoId}`"
          target="_blank"
          rel="noopener"
          class="summary-card__youtube"
        >
          Watch on YouTube
        </a>
      </div>
      <h3 class="summary-card__title">
        <NuxtLink :to="`/summaries/${summary.videoId}`">
          {{ summary.title }}
        </NuxtLink>
      </h3>
      <div
        v-if="summary.tldr"
        class="summary-card__tldr"
        v-html="marked.parse(summary.tldr)"
      />
    </div>
  </article>
</template>

<style scoped>
.summary-card {
  display: flex;
  background: var(--color-surface, #fff);
  border-top: 1px solid var(--color-base-tint-10, #e5e7eb);
  align-items: flex-start;
  gap: var(--space-m, 1rem);
}

@media (max-width: 600px) {
  .summary-card {
    flex-direction: column;
  }
}

.summary-card__thumb {
  margin-top: var(--space-m, 1rem);
  max-width: 240px;
  flex-shrink: 0;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--radius-s);
}

.summary-card__content {
  flex: 1;
  min-width: 0;
  padding-block: var(--space-m, 1rem);

  p, li {
    font-size: var(--size--1) !important;
  }
  
}

.summary-card__meta {
}

.summary-card__channel {
  font-weight: 500 !important;
}

.summary-card__separator {
  color: var(--color-base-tint-10);
}

.summary-card__youtube {
  margin-left: auto;
}

.summary-card__title {
}

.summary-card__title a {
}

.summary-card__title a:hover {
}

.summary-card__tldr {
}

.summary-card__tldr :deep(ul) {
  list-style-type: disc;
}

.summary-card__tldr :deep(li) {
}

.summary-card__tldr :deep(strong) {
  font-weight: 600;
}
</style>
