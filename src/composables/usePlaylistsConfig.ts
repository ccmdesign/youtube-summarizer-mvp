import playlistsData from '~/content/playlists.json'

export interface PlaylistConfig {
  id: string
  name: string
  category: string
  slug: string
  enabled: boolean
}

export function usePlaylistsConfig() {
  // Static playlist data - source of truth is src/content/playlists.json
  const playlists = ref<PlaylistConfig[]>(playlistsData as PlaylistConfig[])
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const enabledPlaylists = computed(() =>
    playlists.value.filter(p => p.enabled)
  )

  const getPlaylistBySlug = (slug: string) =>
    playlists.value.find(p => p.slug === slug)

  const getPlaylistById = (id: string) =>
    playlists.value.find(p => p.id === id)

  return {
    playlists,
    enabledPlaylists,
    pending,
    error,
    getPlaylistBySlug,
    getPlaylistById
  }
}
