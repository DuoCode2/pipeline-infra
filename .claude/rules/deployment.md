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
- deploy.ts handles all cost optimization automatically
- **NEVER** run bare `vercel deploy` or `vercel deploy --prod` (triggers remote build = $$$)
- **NEVER** run `vercel build` (runs build locally in Vercel wrapper, then still uploads)
- **NEVER** use `--archive=tgz` without `--prebuilt` (uploads source → remote build)
- **ONLY** use `deploy.ts` for deployments — it ensures $0 build cost

### How deploy.ts avoids build costs:
1. **REST API v13** (preferred, <10MB) — uploads `out/` static files + `vercel.json` as file, `framework: null`, $0
2. **CLI + `--prebuilt`** (fallback, >10MB) — Build Output API v3 with `overrides` for clean URLs, $0

### Clean URL routing:
- **REST API path**: `vercel.json` must be included as an UPLOADED FILE (not in request body — API ignores body-level config)
- **CLI path**: `config.json` uses `overrides` (e.g., `"en.html": {"path": "en"}`) + `routes` for redirects
- deploy.ts generates both automatically — agents should NEVER manually configure Vercel routing

### Team API usage:
- **REST API**: `?teamId=duocodetech` (slug) or `?teamId=team_30QY2z2YGzW70ITKAAvrlBep` (ID)
- **CLI**: `--scope duocodetech` (slug only)

### FORBIDDEN commands (will incur build charges):
```bash
# ❌ NEVER DO THESE:
vercel deploy --prod                    # uploads source → remote build
vercel deploy --prod --archive=tgz      # same, just compressed
vercel deploy out/ --prod               # Vercel detects Next.js → remote build
vercel build                            # runs build in Vercel wrapper

# ✅ ONLY THIS (handled by deploy.ts):
npx tsx packages/deploy/deploy.ts --build-dir output/{slug}/out --slug {slug}
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
