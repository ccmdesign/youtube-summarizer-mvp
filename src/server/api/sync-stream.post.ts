import { syncPlaylist, type SyncProgressEvent } from '~/server/services/sync.service'

export default defineEventHandler(async (event) => {
  // Set headers for Server-Sent Events
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache, no-transform')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no') // Disable nginx buffering
  setHeader(event, 'Content-Encoding', 'none') // Disable compression

  const response = event.node.res

  // Disable socket buffering for real-time streaming
  response.socket?.setNoDelay(true)

  // Flush headers immediately to establish SSE connection
  response.flushHeaders()

  // Helper to send SSE message and flush immediately
  const sendEvent = (data: SyncProgressEvent) => {
    // Use cork/uncork to ensure immediate flush
    response.cork()
    response.write(`data: ${JSON.stringify(data)}\n\n`)
    process.nextTick(() => response.uncork())
  }

  try {
    // Run sync with progress callback
    await syncPlaylist((progressEvent) => {
      sendEvent(progressEvent)
    })
  } catch (error) {
    sendEvent({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
  } finally {
    response.end()
  }
})
