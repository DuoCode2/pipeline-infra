---
description: Deployment configuration for Vercel and GitHub
---

# Deployment

## GitHub
- Org: **DuoCode2** — `gh repo create DuoCode2/{slug} --private --source=. --push`
- Git identity: `user.name=LiuWei`, `email=sunflowers0607@outlook.com`

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
