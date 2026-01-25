<script setup lang="ts">
import { useDateGroups } from '~/composables/useDateGroups'
import { useChannelsConfig } from '~/composables/useChannelsConfig'
import { deslugify } from '~/utils/slugify'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

definePageMeta({
  hero: false,
  footer: false
})

// Use static channels config
const { getChannelBySlug } = useChannelsConfig()

// Get all summaries first
const { data: allSummaries } = useContentStream('summaries')

// Check if channel exists in config
const channelConfig = computed(() => getChannelBySlug(slug.value))

// Get channel name - try config first, then deslugify from content
const channelName = computed(() => {
  // If in config, use config name
  if (channelConfig.value) {
    return channelConfig.value.name
  }
  // Otherwise try to find channel name from content
  if (allSummaries.value) {
    const channels = [...new Set(allSummaries.value.map(s => s.metadata?.channel).filter(Boolean))]
    return deslugify(slug.value, channels as string[]) || null
  }
  return null
})

// Filter summaries for this channel
const summaries = computed(() => {
  if (!allSummaries.value || !channelName.value) return []
  return allSummaries.value.filter(s => s.metadata?.channel === channelName.value)
})

// 404 only if channel doesn't exist in config AND has no content
// We need to wait for data before deciding
const shouldShow404 = computed(() => {
  // Still loading
  if (!allSummaries.value) return false
  // Has content for this channel
  if (summaries.value.length > 0) return false
  // Is in config (even if no content yet)
  if (channelConfig.value) return false
  // Not in config and no content = 404
  return true
})

// Group by date
const { segments } = useDateGroups(summaries)

// Check if empty (channel exists in config but no summaries)
const isEmpty = computed(() => {
  if (!allSummaries.value) return false
  return channelConfig.value && summaries.value.length === 0
})

// Display name for the page
const displayName = computed(() => channelName.value || slug.value)

useHead({
  title: computed(() => `${displayName.value} | YouTube Summaries`)
})
</script>

<template>
  <div class="channel-page">
    <div v-if="!allSummaries" class="loading">Loading...</div>

    <div v-else-if="shouldShow404" class="not-found">
      <span class="material-symbols-outlined not-found__icon">search_off</span>
      <h1 class="not-found__title">Channel not found</h1>
      <p class="not-found__message">We don't have any summaries for this channel.</p>
      <NuxtLink to="/" class="not-found__link">Browse all summaries</NuxtLink>
    </div>

    <template v-else>
      <header class="page-header">
        <h1>{{ displayName }}</h1>
        <p class="page-header__count">{{ summaries.length }} videos</p>
      </header>

      <div v-if="isEmpty" class="empty-state">
        <span class="material-symbols-outlined empty-state__icon">videocam_off</span>
        <p class="empty-state__message">No summaries for this channel yet.</p>
        <p class="empty-state__hint">Check back soon - new videos are processed daily.</p>
        <NuxtLink to="/" class="empty-state__link">Browse all summaries</NuxtLink>
      </div>

      <DateGroupedFeed v-else :segments="segments" />
    </template>
  </div>
</template>

<style scoped>
.channel-page {
  padding: var(--space-l, 2rem);
}

.page-header {
  margin-bottom: var(--space-l, 2rem);
}

.page-header h1 {
  margin: 0;
  font-size: var(--step-2, 1.5rem);
}

.page-header__count {
  margin: var(--space-2xs, 0.25rem) 0 0;
  color: var(--color-base-shade-10, #6b7280);
  font-size: var(--step--1, 0.875rem);
}

.loading {
  text-align: center;
  padding: var(--space-2xl, 3rem);
  color: var(--color-base-shade-10, #6b7280);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl, 3rem) var(--space-l, 1.5rem);
}

.empty-state__icon {
  font-size: 3rem;
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-m, 1rem);
}

.empty-state__message {
  font-size: var(--step-1, 1.125rem);
  font-weight: 500;
  color: var(--color-text, #374151);
  margin-bottom: var(--space-xs, 0.5rem);
}

.empty-state__hint {
  font-size: var(--step-0, 1rem);
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-l, 1.5rem);
}

.empty-state__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs, 0.25rem);
  padding: var(--space-s, 0.75rem) var(--space-m, 1rem);
  background: var(--color-primary, #2563eb);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.empty-state__link:hover {
  background: var(--color-primary-shade-10, #1d4ed8);
}

.not-found {
  text-align: center;
  padding: var(--space-2xl, 3rem) var(--space-l, 1.5rem);
}

.not-found__icon {
  font-size: 4rem;
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-m, 1rem);
}

.not-found__title {
  font-size: var(--step-2, 1.5rem);
  font-weight: 600;
  color: var(--color-text, #374151);
  margin-bottom: var(--space-xs, 0.5rem);
}

.not-found__message {
  font-size: var(--step-0, 1rem);
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-l, 1.5rem);
}

.not-found__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2xs, 0.25rem);
  padding: var(--space-s, 0.75rem) var(--space-m, 1rem);
  background: var(--color-primary, #2563eb);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.not-found__link:hover {
  background: var(--color-primary-shade-10, #1d4ed8);
}
</style>
