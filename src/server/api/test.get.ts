export default defineEventHandler(async () => {
  return {
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  }
})
