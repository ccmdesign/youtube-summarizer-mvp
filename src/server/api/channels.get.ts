import { getEnabledChannels } from '../utils/channels-config'
import { slugify } from '~/utils/slugify'

export default defineEventHandler(() => {
  const channels = getEnabledChannels()

  return channels.map(channel => ({
    id: channel.id,
    name: channel.name,
    slug: slugify(channel.name)
  }))
})
