# YouTube Playlist Summarizer — High-Level Spec

## Project Overview

Build a system that monitors a YouTube playlist and automatically generates markdown summaries for each video. Summaries are stored as `.md` files compatible with Nuxt Content.

## Core User Story

As a user, I want to:
1. Add videos to a YouTube playlist
2. Run a command manually
3. Have new videos automatically summarized and saved as `.md` files in my Nuxt Content folder

---

## Technical Stack

| Component | Choice |
|-----------|--------|
| Framework | Nuxt 3 |
| Content Engine | Nuxt Content |
| AI Provider | Google Gemini API |
| Video Source | YouTube Data API v3 |
| Runtime | Node.js (local execution for MVP) |

---

## MVP Scope

### Trigger
- **Manual**: Run via npm script (e.g., `npm run sync-playlist`)
- No serverless, no cron, no webhooks for MVP

### State Management
- Check for existing file: `content/summaries/{videoId}.md`
- If file exists → skip video
- If file doesn't exist → process video

### Output Location
- `content/summaries/{videoId}.md`
- Files auto-detected by Nuxt Content

### Summary Format

```markdown
---
title: "{Video Title}"
videoId: "{YouTube Video ID}"
channel: "{Channel Name}"
duration: "{ISO 8601 duration or human-readable}"
publishedAt: "{Video publish date}"
processedAt: "{Processing timestamp}"
source: "youtube"
playlistId: "{Playlist ID}"
---

## TL;DR

{200 character max summary}

## Summary

{Up to 1000 words explanation. Can be shorter if content doesn't warrant length.}
```

---

## Processing Pipeline

```
1. Fetch playlist items from YouTube Data API
         ↓
2. Filter: exclude videos that already have .md files
         ↓
3. For each new video:
   a. Get video metadata (title, channel, duration, etc.)
   b. Get transcript (via youtube-transcript or similar)
   c. Send to Gemini API with prompt
   d. Parse response
   e. Write .md file to content/summaries/
         ↓
4. Log results (processed count, errors, skipped)
```

---

## Two Processing Modes (to implement)

### Mode 1: Transcript-based (Gemini Flash)
- Extract transcript via `youtube-transcript` npm package or YouTube API
- Send transcript text to Gemini 2.5 Flash
- Cheaper, faster
- Works well for talking-head content

### Mode 2: Audio/Video-based (Gemini Pro)
- Pass YouTube URL directly to Gemini API
- Gemini processes audio stream natively (1fps video + 1kbps audio)
- More expensive, but captures tone/nuance
- Better for content with visual elements

**MVP default**: Transcript-based with Flash. Add Pro as optional flag.

---

## Configuration

Environment variables needed:

```env
YOUTUBE_API_KEY=           # YouTube Data API v3 key
GEMINI_API_KEY=            # Google AI Studio API key
YOUTUBE_PLAYLIST_ID=       # Target playlist ID
```

Optional config (can be in nuxt.config or separate config file):

```ts
{
  outputDir: 'content/summaries',
  geminiModel: 'gemini-2.5-flash', // or 'gemini-2.5-pro'
  processingMode: 'transcript', // or 'native-video'
  maxVideosPerRun: 10, // rate limit protection
}
```

---

## Gemini Prompt (starting point)

```
You are summarizing a YouTube video for a personal knowledge base.

Video Title: {title}
Channel: {channel}
Duration: {duration}

Transcript:
{transcript}

Provide:
1. A TL;DR (max 200 characters, no quotes)
2. A comprehensive summary (up to 1000 words, but shorter if the content is simple)

Focus on:
- Key insights and main arguments
- Actionable takeaways
- Notable quotes or statistics (paraphrased)

Do not include filler. Be direct and information-dense.

Respond in this exact format:
TL;DR: [your tldr here]

SUMMARY:
[your summary here]
```

---

## Error Handling

- **No transcript available**: Log warning, skip video (or fall back to native video mode if Pro enabled)
- **Gemini API error**: Retry once with exponential backoff, then skip and log
- **YouTube API quota exceeded**: Stop processing, log error with instructions
- **Malformed response from Gemini**: Log raw response, skip video

---

## Future Enhancements (out of MVP scope)

- [ ] Vercel/Netlify cron job for automated daily sync
- [ ] Watch mode with polling (every 15 min)
- [ ] Git auto-commit via GitHub API
- [ ] Support for multiple playlists
- [ ] Regenerate summaries on demand
- [ ] Tag extraction / auto-categorization
- [ ] Link summaries to related content in the knowledge base

---

## Open Questions for Implementation

1. **Boilerplate structure**: User will provide Nuxt + Nuxt Content boilerplate
2. **Transcript package choice**: `youtube-transcript` vs `ytdl-core` + manual extraction
3. **Gemini SDK**: Official `@google/generative-ai` npm package
4. **Native video mode**: Requires testing Gemini API's YouTube URL handling

---

## Dependencies to Add

```json
{
  "@google/generative-ai": "latest",
  "youtube-transcript": "latest",
  "googleapis": "latest"
}
```

---

## Success Criteria

MVP is complete when:
1. User can run `npm run sync-playlist`
2. Script fetches videos from configured playlist
3. New videos (without existing .md files) are summarized via Gemini Flash
4. Summaries appear in `content/summaries/` with correct frontmatter
5. Nuxt Content can query and display the summaries
