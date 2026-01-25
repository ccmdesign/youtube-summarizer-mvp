# CLAUDE.md

Guidance for Claude Code when collaborating on this AI Content Scraper backend repository.

## Project Snapshot
- **Framework**: Nuxt 4 (Nitro server-only mode)
- **Purpose**: Backend scraper engine for YouTube video summarization
- **Source Root**: All application code lives in `src/`
- **Output**: Generated summaries written to `output/summaries/`
- **Testing**: Vitest via `@nuxt/test-utils`

## Essential Commands
```bash
npm install                      # install dependencies
npm run postinstall              # regenerate .nuxt types (nuxt prepare)
npm run dev                      # start Nitro dev server
npm run build                    # build production bundle into .output/
npm run preview                  # serve latest build

# Sync commands
npm run sync-playlist            # sync a single playlist
npm run sync-all                 # sync all configured playlists/channels
npm run sync-channels            # sync channels only
npm run dryrun                   # test sync without writing

# Video management
npm run video:status             # check video processing status
npm run video:skip               # skip a video from processing
npm run video:retry              # retry a failed video

# Backfill operations
npm run backfill                 # backfill video metadata
npm run backfill:tools           # backfill tools extraction
npm run backfill:tools:dry       # dry run tools backfill
```

## Directory Overview
- `src/server/services/`: Core services (YouTube API, AI summarization, content writing)
- `src/server/api/`: Nitro API routes (sync endpoints, channel management)
- `src/server/utils/`: Utilities (config, logger, rate-limiter, retry logic)
- `src/server/prompts/`: AI prompt templates and response schemas
- `src/server/routes/`: RSS feed routes (feed.xml, digest.xml)
- `src/types/`: TypeScript type definitions
- `src/tests/`: Vitest specs organized by feature
- `scripts/`: CLI tools for sync operations
- `config/`: YAML configuration for playlists and channels
- `data/`: Processing log and state data
- `output/`: Generated content (gitignored)

## Configuration
- Nuxt config at `src/nuxt.config.ts`
- ESLint config at repo root (`eslint.config.mjs`)
- Environment variables via `.env` file (see `.env.example`)

### Key Environment Variables
```bash
YOUTUBE_API_KEY=        # YouTube Data API key
YOUTUBE_PLAYLIST_ID=    # Default playlist to sync
GEMINI_API_KEY=         # Google Gemini AI key
GEMINI_MODEL=           # Model to use (default: gemini-2.5-flash)
OUTPUT_DIR=             # Output directory (default: output/summaries)
```

## Testing
- Tests live in `src/tests/` organized by feature area
- Coverage provider: V8
- Run tests with `npx vitest run`
- Run with coverage: `npx vitest run --coverage`

## Checklist for Changes
1. Update or create relevant specs in `src/tests/` before implementing significant logic
2. Run `npx vitest run --coverage` to verify tests pass
3. Run `npx eslint src --ext .ts` to catch linting issues
4. For production verification: `npm run build` followed by `npm run preview`

## Agent-Specific Directories
- `.claude/` - Claude Code commands and skills
- `.codex/` - Codex prompts and workflows
- `.gemini/` - Gemini-specific instructions

## Project Management
- Active specs and planning docs: `_process/` (if directory exists)
- Archived documentation: `_archive/` (ignored by version control)
- **Plans directory**: Write plans to `_process/plans/`

---

## Revision Summary

**Date**: 2026-01-24

**Key Updates:**
1. ✅ Converted to backend-only repository
2. ✅ Removed all frontend code (pages, components, layouts, composables)
3. ✅ Removed @nuxt/content module
4. ✅ Output directory changed to `output/summaries/`
5. ✅ Simplified for scraper engine focus
