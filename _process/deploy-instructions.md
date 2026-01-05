# Deployment Instructions

Deploy the YouTube Summarizer MVP to **Netlify** (hosting + trigger function) with **GitHub Actions** (sync processing).

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User clicks   │────▶│ Netlify Function│────▶│ GitHub Actions  │
│  "Sync Playlist"│     │ (trigger-sync)  │     │ (sync workflow) │
│   on homepage   │     │                 │     │ 5-20 min        │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Netlify CDN    │◀────│   Git Push      │◀────│ Process videos  │
│ (static site)   │     │ (auto-rebuild)  │     │ + commit .md    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Features

- **No database** - Uses filesystem to track processed videos (markdown file existence)
- **Dual-mode sync** - Direct API on localhost, GitHub Actions on production
- **Static site generation** - All content pre-rendered for performance

---

## Development vs Production

| Environment | Sync Behavior | Wait Time |
|-------------|---------------|-----------|
| **Localhost** | Direct `/api/sync` call | 10-60s per video (immediate results) |
| **Production** | Netlify → GitHub Actions | 5-20 min (async, rebuilds on completion) |

---

## Step 1: Get API Keys

You'll need these API keys:

### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project or select existing
3. Enable "YouTube Data API v3"
4. Create an API key
5. Save as `YOUTUBE_API_KEY`

### YouTube Playlist ID
1. Go to your YouTube playlist
2. Copy the ID from URL: `youtube.com/playlist?list=PLxxxxxxxxxx`
3. Save as `YOUTUBE_PLAYLIST_ID`

### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Save as `GEMINI_API_KEY`

---

## Step 2: Create GitHub Personal Access Token

The Netlify function needs to trigger GitHub Actions workflows.

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. Create a new token with:
   - **Token name**: "Netlify Sync Trigger"
   - **Repository access**: Only select your youtube-summarizer repo
   - **Permissions**:
     - Contents: Read and write
     - Actions: Read and write
3. Click **Generate token**
4. **Copy immediately** - you won't see it again!
5. Save as `GITHUB_PAT`

---

## Step 3: Configure GitHub Secrets

Go to your repository: **Settings** → **Secrets and variables** → **Actions**

### Required Secrets

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `YOUTUBE_API_KEY` | `AIza...` | YouTube Data API key |
| `YOUTUBE_PLAYLIST_ID` | `PLxxx...` | Your playlist ID |
| `GEMINI_API_KEY` | `AIza...` | Google AI Studio key |

### Optional Variables

Go to **Variables** tab:

| Variable Name | Default | Description |
|---------------|---------|-------------|
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | AI model to use |

---

## Step 4: Deploy to Netlify

### Via Netlify Dashboard (Recommended)

1. Go to [app.netlify.com](https://app.netlify.com) and sign in
2. Click **Add new site** → **Import an existing project**
3. Connect GitHub and select your repository
4. Netlify will auto-detect settings from `netlify.toml`
5. Click **Deploy site**

### Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## Step 5: Configure Netlify Environment Variables

In Netlify Dashboard: **Site configuration** → **Environment variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `GITHUB_PAT` | `github_pat_xxx...` | Personal Access Token from Step 2 |
| `GITHUB_REPO` | `username/repo-name` | Your repo (e.g., `johndoe/youtube-summarizer-mvp`) |

**Important:** These enable the Netlify Function to trigger GitHub Actions.

---

## Step 6: Test the Flow

### Production Test

1. Go to your deployed site: `https://your-site.netlify.app`
2. Click **Sync Playlist** button
3. You should see "Sync workflow triggered successfully"
4. Check GitHub Actions tab - a new workflow should be running
5. Wait 5-20 minutes for processing
6. Site auto-rebuilds with new summaries

### Local Development Test

1. Create `.env` file:
```bash
YOUTUBE_API_KEY=your-key
YOUTUBE_PLAYLIST_ID=PLxxxxx
GEMINI_API_KEY=your-key
```

2. Run dev server:
```bash
npm run dev
```

3. Click **Sync Playlist** on homepage
4. Results appear immediately (direct sync, no GitHub Actions)

---

## File Structure

```
├── netlify.toml                    # Netlify configuration
├── netlify/
│   └── functions/
│       └── trigger-sync.ts         # Triggers GitHub Actions
├── src/
│   ├── pages/
│   │   └── index.vue               # Homepage with sync button
│   ├── server/
│   │   └── api/
│   │       └── sync.post.ts        # Direct sync API (localhost only)
│   └── content/
│       └── summaries/              # Generated markdown files
└── .github/
    └── workflows/
        └── sync-playlist.yml       # GitHub Actions workflow
```

---

## Environment Variables Summary

### GitHub Secrets (for Actions workflow)

| Secret | Required | Description |
|--------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API access |
| `YOUTUBE_PLAYLIST_ID` | Yes | Playlist to sync |
| `GEMINI_API_KEY` | Yes | Google AI for summaries |

### Netlify Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_PAT` | Yes | Token with repo + actions permissions |
| `GITHUB_REPO` | Yes | Repository in `owner/repo` format |

### Local Development (.env file)

| Variable | Required | Description |
|----------|----------|-------------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API access |
| `YOUTUBE_PLAYLIST_ID` | Yes | Playlist to sync |
| `GEMINI_API_KEY` | Yes | Google AI for summaries |
| `GEMINI_MODEL` | No | Default: `gemini-2.0-flash-exp` |

---

## Troubleshooting

### "Sync triggered" but nothing happens

1. Check GitHub Actions tab for workflow runs
2. Verify `GITHUB_PAT` has correct permissions
3. Verify `GITHUB_REPO` format is `owner/repo` (not full URL)

### GitHub Actions workflow fails

1. Check workflow logs in Actions tab
2. Common issues:
   - Invalid API keys - verify secrets are set correctly
   - Quota exceeded - wait and retry
   - Transcript unavailable - some videos don't have captions

### Netlify Function returns 500

1. Check Netlify Functions logs: **Logs** → **Functions**
2. Verify environment variables are set
3. Check token hasn't expired

### Site doesn't update after sync

1. Verify workflow pushed changes (check commit history)
2. Check Netlify deploy logs for build errors
3. Manual trigger: **Deploys** → **Trigger deploy**

### Local sync works but production doesn't

1. Confirm Netlify env vars are set
2. Confirm GitHub secrets are set
3. Check that workflow file exists in main branch

---

## Cost Analysis (Free Tier)

| Service | Free Tier Limit | Expected Usage |
|---------|-----------------|----------------|
| **Netlify** | 100GB bandwidth, 300 build min | ~5GB, ~5 min/sync |
| **GitHub Actions** | 2000 min/month | ~60 min/month |
| **YouTube API** | 10K units/day | ~500/sync |
| **Gemini API** | Generous free tier | ~10 calls/sync |

**Total cost: $0/month** within free tier limits.

---

## Manual Sync (Alternative)

If you prefer command-line:

```bash
# Set up .env file first
npm run sync-playlist

# Commit and push
git add src/content/summaries/
git commit -m "chore: sync playlist summaries"
git push
```

Netlify will auto-deploy when you push.

---

## Security Notes

1. **Never commit secrets** - Use environment variables only
2. **Token rotation** - Rotate `GITHUB_PAT` periodically
3. **No auth on sync** - The sync button has no authentication; add if needed for public sites
4. **Rate limiting** - Consider adding rate limiting to prevent abuse

