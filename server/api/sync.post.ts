import { syncPlaylist } from '../../src/server/services/sync.service'

export default defineEventHandler(async () => {
  const result = await syncPlaylist()
  return result
})

