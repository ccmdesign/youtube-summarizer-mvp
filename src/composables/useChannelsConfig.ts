import channelsData from '~/content/channels.json'

export interface ChannelConfig {
  id: string
  name: string
  slug: string
  enabled: boolean
}

export function useChannelsConfig() {
  // Static channel data - source of truth is src/content/channels.json
  const channels = ref<ChannelConfig[]>(channelsData as ChannelConfig[])
  const pending = ref(false)
  const error = ref<Error | null>(null)

  const enabledChannels = computed(() =>
    channels.value.filter(c => c.enabled)
  )

  const getChannelBySlug = (slug: string) =>
    channels.value.find(c => c.slug === slug)

  const getChannelById = (id: string) =>
    channels.value.find(c => c.id === id)

  return {
    channels,
    enabledChannels,
    pending,
    error,
    getChannelBySlug,
    getChannelById
  }
}
