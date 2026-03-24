# DuoCode Pipeline

Claude Code drives the full pipeline. Use `frontend-design` skill for all design work.

## Rules
- Use **AskUserQuestion tool** for user input — never plain text questions
- Pipeline runs **end-to-end without pausing** — only stop if a gate fails after max retries
- **ONLY generate sites for businesses WITHOUT a website** — discover defaults to no-website filter (use `--include-all` to override)
- All sites need **4 languages**: en, ms, zh-CN, zh-TW
- Malaysia market rules: see `.claude/skills/duocode-design/references/malaysia-market.md`

## RULE: Self-iterate to deliver
When running /generate or /batch, Claude must:
- Make ALL design decisions autonomously (fonts, layout, colors, copy)
- Review own screenshots in Gate 3 and fix issues without asking
- Deploy to Vercel and report the live URL
- NEVER stop to ask "should I continue?" or "does this look good?"
- Only stop if: (a) missing required input (use AskUserQuestion), (b) gate fails after 3 retries

## Pipeline: /generate (5 steps)
1. **Prepare assets** — `maps-photos.ts` → `extract-colors.ts` → `download-fonts.ts` → `optimize-images.ts`
2. **Copy scaffolding** — `.claude/skills/duocode-design/templates/_shared/` → `output/{slug}/`
3. **Design & build** — `frontend-design` skill, free layout, unique per business
4. **Quality gates** — Gate 1: build | Gate 2: Lighthouse (Perf≥90, A11y=100, SEO≥95) | Gate 3: browser-use screenshots
5. **Deploy** — GitHub push → Vercel deploy

## Key Commands
```bash
npm test                 # API keys + env + discover
npm run test:all         # Full test suite
npm run build:check      # TypeScript compile check
```

## CLI Tools (use these, don't reinvent)
| Command | Purpose |
|---------|---------|
| `npx tsx packages/discover/search.ts --city X --category Y --limit N` | Lead discovery (no-website default, `--include-all` to override, `--full` for raw JSON) |
| `npx tsx packages/assets/maps-photos.ts --photos '[...]' --output dir` | Download Google Maps photos |
| `npx tsx packages/assets/stock-photos.ts --industry X --output dir --count N` | Stock photo fallback (use when <3 Maps photos) |
| `npx tsx packages/assets/extract-colors.ts --image path --output dir` | Brand color extraction + WCAG enforcement |
| `npx tsx packages/assets/download-fonts.ts --fonts "Font1,Font2" --output dir` | Self-host Google Fonts as .woff2 |
| `npx tsx packages/assets/optimize-images.ts --input dir` | WebP conversion + responsive variants |
| `npx tsx packages/quality/serve-and-check.ts --dir out/ --screenshots dir` | Local Lighthouse + auto port mgmt |
| `npx tsx packages/quality/lighthouse-check.ts --url URL --output dir` | Remote Lighthouse audit (post-deploy) |
| `npx tsx packages/deploy/deploy.ts --build-dir out --slug name` | Vercel deployment |
| `npx tsx packages/batch/orchestrate.ts --city X --categories "a,b" --batch-size N` | Full E2E batch pipeline |

## Skills
| Skill | Type | Purpose |
|-------|------|---------|
| `/generate` | invoke | E2E site generation (5-step) |
| `/batch` | invoke | Process multiple leads in parallel |
| `/discover` | invoke | Google Maps lead discovery |
| `/prepare-assets` | invoke | Photo download + color extraction + optimization |
| `/quality-gate` | invoke | Build + Lighthouse + visual QA |
| `/deploy` | invoke | Vercel deployment |
| `/fix-site` | invoke | Fix visual issues → rebuild → redeploy |
| `/skill-creator` | invoke | Create and improve skills |
| `frontend-design` | auto | Anthropic design skill — typography, color, layout, motion |
| `duocode-design` | auto | Malaysia market rules + Next.js scaffolding |
| `toolchain` | auto | browser-use CLI + Lighthouse reference |
