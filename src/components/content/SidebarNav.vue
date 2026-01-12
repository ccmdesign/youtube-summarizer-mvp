<script setup lang="ts">
import { usePlaylistsConfig } from '~/composables/usePlaylistsConfig'
import { slugify } from '~/utils/slugify'
import { useTruncate } from '~/composables/useTruncate'

const { playlists } = usePlaylistsConfig()

// Extract unique channels from summaries
const { data: summaries } = useContentStream('summaries')

const channels = computed(() => {
  if (!summaries.value) return []
  const channelMap = new Map<string, { name: string; slug: string }>()

  for (const s of summaries.value) {
    if (!channelMap.has(s.channel)) {
      channelMap.set(s.channel, {
        name: s.channel,
        slug: slugify(s.channel)
      })
    }
  }

  return Array.from(channelMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  )
})
</script>

<template>
  <aside class="sidebar-nav">
    <nav>
      <NuxtLink to="/" class="sidebar-home" active-class="sidebar-home--active">
        All Summaries
      </NuxtLink>

      <section class="sidebar-section">
        <h3 class="sidebar-heading">Playlists</h3>
        <ul class="sidebar-list">
          <li v-for="playlist in playlists" :key="playlist.id">
            <NuxtLink
              :to="`/playlists/${playlist.slug}`"
              class="sidebar-link"
              active-class="sidebar-link--active"
            >
              {{ useTruncate(playlist.name, 30) }}
            </NuxtLink>
          </li>
        </ul>
      </section>

      <section class="sidebar-section">
        <h3 class="sidebar-heading">Channels</h3>
        <ul class="sidebar-list">
          <li v-for="channel in channels" :key="channel.slug">
            <NuxtLink
              :to="`/channels/${channel.slug}`"
              class="sidebar-link"
              active-class="sidebar-link--active"
            >
              {{ useTruncate(channel.name, 30) }}
            </NuxtLink>
          </li>
        </ul>
      </section>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-nav {
  width: 250px;
  padding: var(--space-m, 1rem);
  border-right: 1px solid var(--color-base-tint-10, #e5e7eb);
  height: 100%;
  overflow-y: auto;
  background: var(--color-surface, #fff);
}

.sidebar-home {
  display: block;
  padding: var(--space-s, 0.5rem) var(--space-s, 0.75rem);
  margin-bottom: var(--space-m, 1rem);
  border-radius: var(--radius-s, 0.375rem);
  color: var(--color-text, #374151);
  text-decoration: none;
  font-size: var(--step-0, 1rem);
  font-weight: 500;
}

.sidebar-home:hover {
  background: var(--color-base-tint-5, #f3f4f6);
}

.sidebar-home--active {
  background: var(--color-primary-tint-10, #eff6ff);
  color: var(--color-primary, #2563eb);
}

.sidebar-section {
  margin-bottom: var(--space-l, 1.5rem);
}

.sidebar-heading {
  font-size: var(--step--2, 0.75rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-base-shade-10, #6b7280);
  margin-bottom: var(--space-xs, 0.5rem);
  padding: 0 var(--space-s, 0.75rem);
}

.sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-link {
  display: block;
  padding: var(--space-xs, 0.5rem) var(--space-s, 0.75rem);
  border-radius: var(--radius-s, 0.375rem);
  color: var(--color-text, #374151);
  text-decoration: none;
  font-size: var(--step--1, 0.875rem);
}

.sidebar-link:hover {
  background: var(--color-base-tint-5, #f3f4f6);
}

.sidebar-link--active {
  background: var(--color-primary-tint-10, #eff6ff);
  color: var(--color-primary, #2563eb);
  font-weight: 500;
}
</style>
