---
description: Deployment configuration for Vercel and GitHub
---

# Deployment

## GitHub
- Org: **DuoCode2** — `gh repo create DuoCode2/{slug} --private --source=. --push`
- Git identity defaults: `user.name=LiuWei`, `email=sunflowers0607@outlook.com`
- Override via env: `GIT_OWNER`, `GIT_USER_NAME`, `GIT_USER_EMAIL`

## Vercel
- Deploy: `npx tsx packages/deploy/deploy.ts --build-dir output/{slug}/out --slug {slug}`
- Sites live at: `https://{slug}.vercel.app`

## Credentials (.env)
| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Maps Places API |
| `UNSPLASH_ACCESS_KEY` | Stock photo fallback |
| `VERCEL_TOKEN` | Deployment |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Notifications |
| `N8N_WEBHOOK_URL` | Post-deploy logging (optional, e.g. `http://localhost:5678/webhook/log-work`) |
| `GIT_OWNER` | GitHub org override (default: `DuoCode2`) |
| `GIT_USER_NAME` | Git commit author name (default: `LiuWei`) |
| `GIT_USER_EMAIL` | Git commit author email (default: `sunflowers0607@outlook.com`) |
