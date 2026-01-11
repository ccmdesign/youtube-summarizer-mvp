import { ref } from 'vue'

export interface PlaylistConfig {
  id: string
  name: string
  category: string
  slug: string
}

export function usePlaylistsConfig() {
  // Playlists config matching playlists.yaml
  const playlists = ref<PlaylistConfig[]>([
    { id: 'PL-SEjLl-bojVmsXOvG-TBp7DVv0McXJzn', name: 'AI Summaries', category: 'ai', slug: 'ai-summaries' },
    { id: 'PL-SEjLl-bojUYCpJcOL5XVeJicf9X1nGS', name: 'Geopolitics', category: 'geopolitics', slug: 'geopolitics' },
    { id: 'PL-SEjLl-bojUBbH6pniyrHDaxs-WO6E7R', name: 'Personal', category: 'personal', slug: 'personal' },
    { id: 'PL-SEjLl-bojWiSK9b4JVTsaOeyrjhuSUQ', name: 'YY', category: 'yy', slug: 'yy' }
  ])

  const getPlaylistBySlug = (slug: string) =>
    playlists.value.find(p => p.slug === slug)

  const getPlaylistById = (id: string) =>
    playlists.value.find(p => p.id === id)

  return {
    playlists,
    getPlaylistBySlug,
    getPlaylistById
  }
}
