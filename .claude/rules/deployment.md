---
description: Deployment configuration for Vercel and GitHub
---

# Deployment

## GitHub
- Org: **DuoCode2** — `gh repo create DuoCode2/{slug} --private --source=. --push`
- Git identity defaults: `user.name=LiuWei`, `email=sunflowers0607@outlook.com`
- Override via env: `GIT_OWNER`, `GIT_USER_NAME`, `GIT_USER_EMAIL`

## Vercel
- **Team**: DuoCode (`duocodetech`, ID: `team_30QY2z2YGzW70ITKAAvrlBep`)
- **Plan**: Pro (Active)
- deploy.ts uploads **prebuilt static files only** — NEVER triggers remote builds
- Sites live at: `https://{slug}.vercel.app`

### COST RULE: NEVER trigger remote builds
- **$20/mo included credit** covers CDN, bandwidth, edge requests
- **Build minutes cost extra**: Standard $0.014/min, Turbo $0.476/min
- All projects use **Standard** build machines (not Turbo)
- deploy.ts uses REST API (`framework: null`) = $0 build cost
- CLI fallback uses `--prebuilt` + Build Output API v3 = $0 build cost
- **NEVER** run `vercel deploy` from project root (triggers remote build)
- **NEVER** use Turbo build machines for static sites

### Team API usage:
- **REST API**: `?teamId=duocodetech` (slug) or `?teamId=team_30QY2z2YGzW70ITKAAvrlBep` (ID)
- **CLI**: `--scope duocodetech` (slug only)

### Deploy strategy (automatic in deploy.ts):
1. **REST API v13** (preferred) — uploads `out/` static files with `framework: null`, NO remote build, $0 cost
2. **CLI + `--prebuilt`** (fallback for >10MB) — uses Build Output API v3 format, NO remote build, $0 cost

### Manual deploy:
```bash
cd output/{slug}/out
# Create Build Output API structure
mkdir -p .vercel/output/static && echo '{"version":3}' > .vercel/output/config.json
# Deploy with --prebuilt (no remote build)
npx vercel deploy --prebuilt --prod --archive=tgz --yes --token $VERCEL_TOKEN --scope duocodetech
```

## Credentials (.env)
| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Maps Places API + Cloud Translation API |
| `UNSPLASH_ACCESS_KEY` | Stock photo fallback |
| `VERCEL_TOKEN` | Deployment (used by both CLI and REST API) |
| `VERCEL_SCOPE` | Vercel Team slug (default: `duocodetech`) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Notifications |
| `N8N_WEBHOOK_URL` | Post-deploy logging (optional) |
| `GIT_OWNER` | GitHub org override (default: `DuoCode2`) |
| `GIT_USER_NAME` | Git commit author name (default: `LiuWei`) |
| `GIT_USER_EMAIL` | Git commit author email (default: `sunflowers0607@outlook.com`) |
