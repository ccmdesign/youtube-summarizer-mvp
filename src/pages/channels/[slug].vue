<script setup lang="ts">
import { useDateGroups } from '~/composables/useDateGroups'
import { deslugify } from '~/utils/slugify'

const route = useRoute()

definePageMeta({
  hero: false,
  footer: false
})

// First, get all summaries to find unique channels
const { data: allSummaries } = useContentStream('summaries')

// Find the channel name from slug
const channelName = computed(() => {
  if (!allSummaries.value) return null
  const channels = [...new Set(allSummaries.value.map(s => s.channel))]
  return deslugify(route.params.slug as string, channels)
})

// 404 if channel not found (wait for data to load first)
watchEffect(() => {
  if (allSummaries.value && !channelName.value) {
    throw createError({ statusCode: 404, message: 'Channel not found' })
  }
})

// Filter summaries for this channel
const summaries = computed(() => {
  if (!allSummaries.value || !channelName.value) return []
  return allSummaries.value.filter(s => s.channel === channelName.value)
})

// Group by date
const { segments } = useDateGroups(summaries)

useHead({
  title: computed(() => channelName.value ? `${channelName.value} | YouTube Summarizer` : 'Loading...')
})
</script>

<template>
  <div class="channel-page">
    <header class="page-header">
      <h1>{{ channelName }}</h1>
      <p class="page-header__count">{{ summaries.length }} videos</p>
    </header>

    <div v-if="!allSummaries" class="loading">Loading...</div>

    <DateGroupedFeed v-else :segments="segments" />
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
</style>
