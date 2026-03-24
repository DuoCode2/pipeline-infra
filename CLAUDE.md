# DuoCode Pipeline

Claude Code drives the full pipeline. Use `frontend-design` skill for all design work.

## Rules
- Use **AskUserQuestion tool** for user input — never plain text questions
- Pipeline runs **end-to-end without pausing** — only stop if a gate fails after max retries
- All sites need **4 languages**: en, ms, zh-CN, zh-TW
- Malaysia market rules: see `.claude/skills/duocode-design/references/malaysia-market.md`

## Pipeline: /generate (5 steps)
1. **Prepare assets** — `maps-photos.ts` → `extract-colors.ts` → `optimize-images.ts`
2. **Copy scaffolding** — `templates/_shared/` → `output/{slug}/`
3. **Design & build** — `frontend-design` skill, free layout, unique per business
4. **Quality gates** — Gate 1: build | Gate 2: Lighthouse (Perf≥90, A11y=100, SEO≥95) | Gate 3: browser-use screenshots
5. **Deploy** — GitHub push → Vercel deploy

## Key Commands
```bash
npm test                 # API keys + env + discover
npm run test:all         # Full test suite
npm run build:check      # TypeScript compile check
npm run discover -- --city "Kuala Lumpur" --category "restaurant" --limit 1
npx tsx packages/deploy/deploy.ts --build-dir output/{slug}/out --slug {slug}
```

## Deployment
- GitHub org: **DuoCode2** — `gh repo create DuoCode2/{slug} --private --source=. --push`
- Vercel: `npx tsx packages/deploy/deploy.ts --build-dir output/{slug}/out --slug {slug}`
- Git identity: `user.name=LiuWei`, `email=sunflowers0607@outlook.com`

## Credentials (.env)
| Variable | Purpose |
|----------|---------|
| `GOOGLE_API_KEY` | Maps Places API |
| `UNSPLASH_ACCESS_KEY` | Stock photo fallback |
| `VERCEL_TOKEN` | Deployment |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Notifications |

## Skills
| Skill | Purpose |
|-------|---------|
| `/generate` | E2E site generation (5-step) |
| `/batch` | Process multiple leads |
| `/discover` | Google Maps lead discovery |
| `/prepare-assets` | Photo download + color extraction + optimization |
| `/quality-gate` | Build + Lighthouse + visual QA |
| `/deploy` | Vercel deployment |
| `duocode-design` | Malaysia market rules + scaffolding (auto-loaded) |
| `toolchain` | browser-use + Lighthouse reference (auto-loaded) |

## Conventions
- TypeScript strict — no `any`, use `requireEnv()` from `packages/utils/env.ts`
- Never include `claude` in branch names
- Gate 3 visual QA: use `browser-use` CLI, NOT Playwright MCP
- `maps-1` is always exterior — never use as hero image
