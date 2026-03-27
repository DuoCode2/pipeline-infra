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
- deploy.ts tries **CLI first** (`--scope duocodetech`), falls back to REST API (`?teamId=duocodetech`)
- `--archive=tgz` compresses all files into one upload — no rate limits, no 10MB body limit
- `--token` is passed explicitly to avoid "Loading scopes..." hang
- Sites live at: `https://{slug}.vercel.app`

### Team API usage:
- **REST API**: `?teamId=duocodetech` (slug) or `?teamId=team_30QY2z2YGzW70ITKAAvrlBep` (ID) — both work
- **CLI**: `--scope duocodetech` (slug only, not team ID)
- **Recommendation**: Use slug (`duocodetech`) everywhere — works in both CLI and REST API

### Deploy strategy (automatic in deploy.ts):
1. **Vercel CLI + `--archive=tgz` + `--token` + `--scope`** (preferred) — single compressed upload
2. **REST API v13** (fallback) — per-file base64 upload, limited to ~10MB total, passes `?teamId=` query

### Manual deploy (for custom/large projects):
```bash
cd output/{slug}
npx vercel deploy --prod --archive=tgz --yes --token $VERCEL_TOKEN --scope duocodetech
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
