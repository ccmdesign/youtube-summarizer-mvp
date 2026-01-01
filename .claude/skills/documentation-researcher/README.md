# Documentation Researcher Skill

**Version**: 1.0.0
**Priority**: ⭐⭐⭐ Tier 1 Essential

## Purpose

Search official documentation for external APIs and libraries with intelligent caching.

## Auto-trigger Patterns

This skill automatically activates when questions detected about:
- "how do I use [library/API]"
- "what's the syntax for [API method]"
- "does [library] support [feature]"

Specifically for:
- YouTube Data API
- Gemini API
- Nuxt Content
- Nuxt 4

## Workflow

When triggered, this skill:

1. **Identify Library**: Parse the question to determine which library/API is being asked about
2. **Check Cache**: Look for `.claude/cache/docs-[library].json`
3. **Validate Freshness**: Check if cache is stale based on TTL
4. **Fetch (if needed)**: If not cached or stale, fetch from MCP server
5. **Extract Relevant Info**: Pull API methods, examples, and best practices
6. **Return Summary**: Provide concise answer with code examples (max 1500 chars)
7. **Cache Results**: Save to cache for future use

## Supported Documentation Sources

### Nuxt
- **MCP Server**: `nuxt-docs`
- **Version**: 4.2.0
- **Cache TTL**: 7 days
- **Coverage**: SSR, routing, composables, auto-imports

### Gemini API
- **MCP Server**: `google-ai-docs`
- **Focus Areas**: generative-ai, multimodal
- **Cache TTL**: 3 days (shorter due to rapid updates)
- **Coverage**: Model capabilities, prompting, safety settings

### YouTube Data API
- **MCP Server**: `google-apis-docs`
- **Version**: v3
- **Focus Areas**: playlists, videos, quota
- **Cache TTL**: 14 days (stable API)
- **Coverage**: Playlist items, video metadata, quota management

### Nuxt Content
- **MCP Server**: `nuxt-docs`
- **Version**: 3.7.1
- **Cache TTL**: 7 days
- **Coverage**: Content queries, collections, markdown features

## Cache Management

### Cache Location
All cached documentation is stored in `.claude/cache/`

### Cache File Format
```json
{
  "library": "nuxt",
  "version": "4.2.0",
  "cached_at": "2025-12-31T10:00:00Z",
  "ttl_days": 7,
  "expires_at": "2026-01-07T10:00:00Z",
  "queries": {
    "useFetch": {
      "summary": "Composable for data fetching",
      "syntax": "const { data, pending, error } = await useFetch(url)",
      "examples": ["..."],
      "docs_url": "https://nuxt.com/docs/api/composables/use-fetch"
    }
  }
}
```

### Cache Invalidation
- Automatic: Based on TTL days
- Manual: Delete cache file to force refresh

## Output Format

Responses include:
- ✅ Code examples
- ✅ Version-specific notes
- ✅ Links to official docs
- ✅ Common gotchas
- ✅ Max length: 1500 characters

## Example Usage

**User**: "How do I fetch playlist items with the YouTube API?"

**Skill Actions**:
1. Identify: YouTube Data API
2. Check cache: `.claude/cache/docs-youtube.json`
3. Find cached result or fetch from `google-apis-docs` MCP
4. Extract playlist.items endpoint info
5. Return:

```
YouTube Data API v3 - Playlist Items

Endpoint: GET /playlistItems
https://www.googleapis.com/youtube/v3/playlistItems

Parameters:
- part (required): 'snippet', 'contentDetails'
- playlistId (required): The playlist ID
- maxResults: 0-50 (default: 5)
- pageToken: For pagination

Example:
```javascript
const response = await fetch(
  `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&key=${API_KEY}`
)
const data = await response.json()
const videos = data.items.map(item => ({
  videoId: item.snippet.resourceId.videoId,
  title: item.snippet.title
}))
```

Quota Cost: 1 unit per request
Docs: https://developers.google.com/youtube/v3/docs/playlistItems/list
```

6. Cache result for 14 days

## Configuration

Configuration is loaded from `.claude/config/doc-sources.json`.

## MCP Server Requirements

This skill requires the following MCP servers to be configured:
- `nuxt-docs` (public)
- `google-ai-docs` (public)
- `google-apis-docs` (public)

See `.claude/config/doc-sources.json` for MCP server configuration.

## Dependencies

- Configuration: `.claude/config/doc-sources.json`
- Cache directory: `.claude/cache/`
- MCP servers (public): nuxt-docs, google-ai-docs, google-apis-docs

## Performance

- **First request**: Fetches from MCP server (~1-2s)
- **Cached requests**: Instant (<10ms)
- **Cache size**: ~50KB per library
- **Total cache**: ~200KB for all sources
