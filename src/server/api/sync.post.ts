import { syncPlaylist } from '~/server/services/sync.service'

export default defineEventHandler(async () => {
  const result = await syncPlaylist()
  return result
})

