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
      <div class="summary-card__meta">
        <span class="summary-card__channel">{{ summary.channel }}</span>
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
  gap: var(--space-m, 1rem);
  padding: var(--space-m, 1rem);
  background: var(--color-surface, #fff);
  border-radius: var(--radius-s, 0.5rem);
  border: 1px solid var(--color-base-tint-10, #e5e7eb);
}

@media (max-width: 600px) {
  .summary-card {
    flex-direction: column;
  }
}

.summary-card__thumb {
  width: 200px;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--radius-xs, 0.25rem);
  flex-shrink: 0;
}

.summary-card__content {
  flex: 1;
  min-width: 0;
}

.summary-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.5rem);
  font-size: var(--step--2, 0.75rem);
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-xs, 0.5rem);
}

.summary-card__channel {
  font-weight: 500;
}

.summary-card__separator {
  color: var(--color-base-tint-10, #d1d5db);
}

.summary-card__youtube {
  margin-left: auto;
  color: var(--color-primary, #2563eb);
}

.summary-card__title {
  margin: 0 0 var(--space-xs, 0.5rem) 0;
  font-size: var(--step-0, 1rem);
  line-height: 1.4;
}

.summary-card__title a {
  color: var(--color-text, #111827);
  text-decoration: none;
}

.summary-card__title a:hover {
  color: var(--color-primary, #2563eb);
}

.summary-card__tldr {
  font-size: var(--step--1, 0.875rem);
  color: var(--color-base-shade-10, #4b5563);
  line-height: 1.6;
}

.summary-card__tldr :deep(ul) {
  margin: 0.5em 0;
  padding-left: 1.5em;
  list-style-type: disc;
}

.summary-card__tldr :deep(li) {
  margin: 0.25em 0;
}

.summary-card__tldr :deep(strong) {
  font-weight: 600;
  color: var(--color-base, #333);
}
</style>
