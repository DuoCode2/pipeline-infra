---
description: Deployment configuration for Vercel and GitHub
---

# Deployment

## GitHub
- Org: **DuoCode2** — `gh repo create DuoCode2/{slug} --private --source=. --push`
- Git identity defaults: `user.name=LiuWei`, `email=sunflowers0607@outlook.com`
- Override via env: `GIT_OWNER`, `GIT_USER_NAME`, `GIT_USER_EMAIL`

## Vercel
- deploy.ts tries **CLI first** (`vercel --archive=tgz`), falls back to REST API
- `--archive=tgz` compresses all files into one upload — no rate limits, no 10MB body limit
- Sites live at: `https://{slug}.vercel.app`

### Deploy strategy (automatic):
1. **Vercel CLI + `--archive=tgz`** (preferred) — single compressed upload, works for any size
2. **REST API v13** (fallback) — per-file base64 upload, limited to ~10MB total

### Manual deploy (for custom/large projects):
```bash
cd output/{slug}
npx vercel deploy --prebuilt --prod --archive=tgz --yes
```

## Credentials (.env)
| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Maps Places API |
| `UNSPLASH_ACCESS_KEY` | Stock photo fallback |
| `VERCEL_TOKEN` | Deployment (used by both CLI and REST API) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Notifications |
| `N8N_WEBHOOK_URL` | Post-deploy logging (optional) |
| `GIT_OWNER` | GitHub org override (default: `DuoCode2`) |
| `GIT_USER_NAME` | Git commit author name (default: `LiuWei`) |
| `GIT_USER_EMAIL` | Git commit author email (default: `sunflowers0607@outlook.com`) |
