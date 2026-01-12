export interface ChannelConfig {
  id: string
  name: string
  slug: string
}

export function useChannelsConfig() {
  // Fetch channels from API - single source of truth is src/config/channels.yaml
  const { data: channels } = useFetch<ChannelConfig[]>('/api/channels', {
    default: () => []
  })

  const getChannelBySlug = (slug: string) =>
    channels.value.find(c => c.slug === slug)

  const getChannelById = (id: string) =>
    channels.value.find(c => c.id === id)

  return {
    channels,
    getChannelBySlug,
    getChannelById
  }
}
