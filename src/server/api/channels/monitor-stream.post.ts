import { ChannelMonitorService } from '~/server/services/channel-monitor.service'
import type { ChannelProgressEvent } from '~/types/channels'

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
  const sendEvent = (data: ChannelProgressEvent) => {
    // Use cork/uncork to ensure immediate flush
    response.cork()
    response.write(`data: ${JSON.stringify(data)}\n\n`)
    process.nextTick(() => response.uncork())
  }

  try {
    const channelMonitor = new ChannelMonitorService()

    // Run channel monitoring with progress callback
    await channelMonitor.monitorAllChannels({
      onProgress: (progressEvent) => {
        sendEvent(progressEvent)
      }
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
