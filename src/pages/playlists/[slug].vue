<script setup lang="ts">
import { usePlaylistsConfig } from '~/composables/usePlaylistsConfig'
import { useDateGroups } from '~/composables/useDateGroups'

const route = useRoute()
const { getPlaylistBySlug } = usePlaylistsConfig()

const playlist = computed(() => getPlaylistBySlug(route.params.slug as string))

// 404 if playlist not found
if (!playlist.value) {
  throw createError({ statusCode: 404, message: 'Playlist not found' })
}

definePageMeta({
  hero: false,
  footer: false
})

// Fetch summaries for this playlist
const { data: summaries, pending } = useContentStream('summaries', {
  where: { playlistId: playlist.value.id }
})

// Group by date
const { segments } = useDateGroups(computed(() => summaries.value || []))

useHead({
  title: `${playlist.value.name} | YouTube Summarizer`
})
</script>

<template>
  <div class="playlist-page">
    <header class="page-header">
      <h1>{{ playlist?.name }}</h1>
      <p class="page-header__count">{{ summaries?.length || 0 }} videos</p>
    </header>

    <div v-if="pending" class="loading">Loading...</div>

    <DateGroupedFeed v-else :segments="segments" />
  </div>
</template>

<style scoped>
.playlist-page {
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
