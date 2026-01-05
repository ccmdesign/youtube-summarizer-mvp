# Netlify Deployment Implementation Summary

**Date:** 2026-01-02  
**Status:** Complete (Simplified)

## Overview

Implemented a simplified deployment architecture using Netlify for hosting with a user-triggered sync flow. No database required - uses filesystem to track processed videos.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User clicks   │────▶│ Netlify Function│────▶│ GitHub Actions  │
│  "Sync Playlist"│     │ (trigger-sync)  │     │ (sync workflow) │
│   on homepage   │     │                 │     │ 5-20 min        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Netlify CDN    │◀────│   Git Push      │◀────│ Commits .md     │
│ (static site)   │     │ (auto-rebuild)  │     │ files to repo   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Key Simplifications

| Before | After |
|--------|-------|
| Turso database for tracking | Filesystem check (markdown file exists) |
| Separate admin/sync page | Single button on homepage |
| status.json for stats | Removed (not needed) |
| Database credentials | None required |

## Dual-Mode Sync

| Environment | Behavior | Wait Time |
|-------------|----------|-----------|
| **Localhost** | Direct `/api/sync` call | Immediate (10-60s per video) |
| **Production** | Netlify → GitHub Actions | Async (5-20 min) |

## User Flow (Production)

1. User adds videos to their YouTube playlist
2. User visits homepage and clicks "Sync Playlist"
3. Netlify Function triggers GitHub Actions
4. GitHub Actions workflow runs (5-20 minutes)
5. New markdown summaries are committed to repo
6. Netlify auto-rebuilds on push
7. New summaries appear on the site

## User Flow (Development)

1. User runs `npm run dev`
2. User clicks "Sync Playlist" on homepage
3. Direct API call processes videos immediately
4. Page refreshes with new summaries

## Key Components

### 1. Netlify Function (`netlify/functions/trigger-sync.ts`)

- Receives POST requests from the homepage
- Authenticates with GitHub using Personal Access Token
- Triggers the `sync-playlist.yml` workflow via GitHub API
- Returns success/error status to the UI

### 2. Homepage (`src/pages/index.vue`)

- Displays video summaries list
- "Sync Playlist" button with dual-mode logic:
  - Localhost: calls `/api/sync` directly
  - Production: calls Netlify function

### 3. Direct Sync API (`src/server/api/sync.post.ts`)

- Nuxt server route for localhost development
- Calls `syncPlaylist()` directly
- Returns immediate results

### 4. GitHub Actions Workflow (`.github/workflows/sync-playlist.yml`)

- Triggered via `workflow_dispatch` (API call)
- 6-hour timeout for long-running syncs
- Processes videos: YouTube API → Gemini AI → Markdown
- Commits new files to `src/content/summaries/`
- Push triggers Netlify rebuild

### 5. Sync Service (`src/server/services/sync.service.ts`)

- Checks if markdown file exists to skip processed videos
- No database queries - pure filesystem check
- Orchestrates YouTube → Gemini → Markdown flow

## Files Created/Modified

| File | Purpose |
|------|---------|
| `netlify.toml` | Netlify build config, function directory |
| `netlify/functions/trigger-sync.ts` | Triggers GitHub Actions |
| `src/pages/index.vue` | Homepage with sync button |
| `src/server/api/sync.post.ts` | Direct sync API for localhost |
| `src/nuxt.config.ts` | Added `serverDir` config |

## Files Removed

| File | Reason |
|------|--------|
| `src/server/db/` | Database no longer needed |
| `src/pages/admin/sync.vue` | Consolidated to homepage |
| `src/public/status.json` | Not tracking stats |

## Environment Variables

### GitHub Secrets (for Actions)

| Variable | Purpose |
|----------|---------|
| `YOUTUBE_API_KEY` | YouTube Data API access |
| `YOUTUBE_PLAYLIST_ID` | Playlist to sync |
| `GEMINI_API_KEY` | Google AI for summaries |

### Netlify Environment Variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_PAT` | Personal Access Token with repo + actions scopes |
| `GITHUB_REPO` | Repository in `owner/repo` format |

## Technical Decisions

### Why No Database?

- SSG means content is static at build time
- Markdown files already exist on disk
- Checking file existence is simpler than database queries
- Fewer credentials to manage
- No migration/schema concerns

### Why Dual-Mode Sync?

- **Development**: Fast iteration, immediate feedback
- **Production**: Long-running process needs GitHub Actions (6h timeout)

### Why GitHub Actions for Production Sync?

- Sync takes 5-30 minutes (exceeds serverless timeouts)
- GitHub Actions provides 6-hour timeout
- Free 2000 minutes/month
- Native git integration for committing results

## Limitations & Future Improvements

### Current Limitations

1. **No authentication** on sync button - anyone can trigger
2. **No progress tracking** - must check GitHub Actions manually
3. **No rate limiting** - could spam the sync button

### Potential Improvements

1. Add basic auth or OAuth protection
2. Implement webhook for real-time status updates
3. Add rate limiting to Netlify function
4. Add scheduled sync option via cron

## Cost Estimate (Free Tier)

| Service | Free Limit | Expected Usage |
|---------|------------|----------------|
| Netlify | 100GB bandwidth, 300 build min | <10% |
| GitHub Actions | 2000 min/month | ~60 min/month |
| YouTube API | 10K units/day | ~500/sync |
| Gemini API | Free tier | ~10 calls/sync |

**Total cost: $0/month** within free tier limits.

