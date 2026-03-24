# DuoCode Pipeline

Claude Code is the central brain orchestrating the entire pipeline. You (Claude) drive every phase — from lead discovery to site generation to deployment.

## RULE: Never ask questions as plain text

When you need information from the user (city, business name, place_id, industry, or any other parameter), you MUST use the **AskUserQuestion tool**. NEVER output a numbered list of questions as regular text — the user will not see it as an interactive prompt. This applies everywhere: skills, commands, and free-form conversation. One AskUserQuestion call per question. If you need multiple pieces of info, ask the most critical one first, then follow up.

## RULE: Pipeline runs end-to-end without pausing

Once a pipeline is started (generate, batch, or any multi-step skill), execute ALL steps continuously without stopping to ask "what's next?" or presenting intermediate options. The full pipeline is: **discover → prepare-assets → generate → Gate 1 → Gate 2 → Gate 3 → GitHub push → Vercel deploy → log**. Only stop if a gate FAILS after max retries. Never ask the user to choose the next step — just do all of them. Report results only at the very end with a single summary.

## Pipeline Tools

These are the tools YOU use to execute the pipeline. Know them well.

### Site Generation & Build
| Tool | Command | Purpose |
|------|---------|---------|
| Next.js | `npm run build` | Static site generation from templates |
| TypeScript | `npx tsx packages/*.ts` | Run pipeline scripts |
| SVGO | `npx svgo output/{slug}/public/svgs/*.svg` | Optimize generated SVGs |
| Sharp | via `packages/assets/optimize-images.ts` | Image resize → WebP (320/640/960/1280) |
| node-vibrant | via `packages/assets/extract-colors.ts` | Extract brand colors from photos |

### Quality Gates
| Tool | Command | Purpose |
|------|---------|---------|
| Lighthouse | `npx lighthouse http://localhost:3456 --output json --output-path lighthouse.json --chrome-flags="--headless"` | Gate 2: Performance ≥ 90, A11y = 100, SEO ≥ 95 |
| Lighthouse CI | `npx @lhci/cli autorun` | CI-integrated auditing (config: `.lighthouserc.json`) |
| browser-use | `browser-use open http://localhost:3000` | Gate 3: Open generated site for visual QA |
| browser-use | `browser-use screenshot screenshots/desktop.png` | Gate 3: Capture desktop screenshot |
| browser-use | `browser-use screenshot screenshots/mobile.png --viewport 375x812` | Gate 3: Capture mobile screenshot |
| Playwright MCP | `mcp__playwright__browser_navigate`, `browser_snapshot`, `browser_take_screenshot` | Alternative visual testing via MCP |

### Deployment & GitHub Push
| Tool | Command | Purpose |
|------|---------|---------|
| GitHub CLI | `gh repo create DuoCode2/{slug} --private --clone` | Create repo under DuoCode2 org |
| GitHub CLI | `gh repo view DuoCode2/{slug}` | Check if repo exists |
| git | `git push -u origin main` | Push generated site to DuoCode2 org |
| Vercel SDK | via `packages/deploy/deploy.ts` | Programmatic deploy: create project → upload files → production |
| Vercel CLI | `vercel deploy [path] -y --no-wait` | Fallback CLI deploy |
| Vercel CLI | `vercel inspect <url>` | Check deployment status |

**Post-generation push workflow:**
```bash
cd output/{slug}
git init && git add -A && git commit -m "feat: generated site for {business_name}"
gh repo create DuoCode2/{slug} --private --source=. --push
# Then deploy via Vercel SDK or link to Vercel for auto-deploy
```

### n8n Orchestration
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `http://localhost:5678/webhook/prepare-assets` | POST | Trigger asset preparation (photos + colors + optimize) |
| `http://localhost:5678/webhook/log-work` | POST | Log generation results to WorkLog sheet |
| `http://localhost:5678/webhook/lead-status` | POST | Update lead status in Sheets |
| `http://localhost:5678/healthz` | GET | n8n health check |

### Discovery & Data
| Tool | Command | Purpose |
|------|---------|---------|
| Google Maps API | via `packages/discover/search.ts` | Find businesses without websites |
| Unsplash API | via `packages/assets/stock-photos.ts` | Fallback stock photos |
| Google Sheets | via n8n OAuth | Lead storage + WorkLog |
| xh | `xh POST http://localhost:5678/webhook/... key=value` | Quick webhook testing |

### Credentials (from .env)

All service credentials are stored in `.env`. When automating GUI tasks (n8n login, Google OAuth, etc.), read credentials from `.env` first:

| Variable | Purpose |
|----------|---------|
| `N8N_OWNER_EMAIL` / `N8N_OWNER_PASSWORD` | n8n UI login at localhost:5678 |
| `N8N_LICENSE_KEY` | n8n community license (activate in Settings → Usage) |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Pipeline notifications via @duocode0324bot |
| `GOOGLE_API_KEY` | Google Maps Places API + Gemini |
| `UNSPLASH_ACCESS_KEY` | Stock photo fallback |
| `VERCEL_TOKEN` | Deployment |

**browser-use for GUI automation:** Always use `--browser real --headed --profile liu` for any Google-authenticated flows (OAuth, Sheets, etc.). The `liu` profile has `weiliudev0607@gmail.com` logged in.

### Docker
```bash
cd n8n && docker compose up -d     # Start n8n (builds custom image with pre-installed packages)
docker compose logs -f n8n         # Watch logs
curl http://localhost:5678/healthz  # Health check
# Uncomment evolution-api in docker-compose.yml for Phase 5 WhatsApp
```

## MANDATORY: Skill Loading Protocol

**EVERY site generation MUST begin by reading these skills in order:**

1. `Read .claude/skills/generate/SKILL.md` — follow ALL 10 steps, do NOT improvise
2. `Read .claude/skills/duocode-design/SKILL.md` — shared design principles
3. `Read .claude/skills/duocode-design/references/{industry}.md` — industry-specific design
4. `Read .claude/skills/duocode-design/schemas/{industry}.schema.json` — data field definitions

**NEVER skip step 1.** The generate SKILL.md IS the process.

### SVG Generation Rules
- Read the industry reference's "SVG Element Vocabulary" table
- Generate ALL SVG types listed (7–8 for beauty, not just 5)
- Use brand colors from `brand-colors.json` — NEVER use `currentColor` at opacity 0.1
- Stroke width ≥ 2px, fill opacity ≥ 0.5
- Run `npx svgo` after generating

### Hero Image Selection
- `maps-1` is ALWAYS the Google Maps cover photo (usually exterior/street view) — **NEVER use it as hero**
- Visually inspect `maps-2` through `maps-5` and stock photos
- Pick the best **interior** shot for `heroImage`

### Favicon Rule
- NEVER use a letter on a colored square
- Generate an industry-appropriate **symbolic icon** SVG (beauty: lotus/petal, restaurant: plate/steam, clinic: cross/tooth)

### Quality Gate Tool
- Gate 3 visual QA: use `browser-use` CLI, NOT Playwright MCP

## Architecture

```
YOU (Claude Code) ← central brain
 │
 ├── Phase 1: Discovery
 │   └── packages/discover/search.ts → Google Maps → leads
 │
 ├── Phase 2: Classification
 │   └── n8n webhook → Gemini 2.5 Flash → industry category
 │
 ├── Phase 3: Generation (per lead)
 │   ├── prepare-assets (n8n webhook or packages/assets/*.ts)
 │   ├── copy template (_shared + {industry})
 │   ├── load design skill (duocode-design → references/{industry}.md)
 │   ├── generate business.ts (4 languages: en, ms, zh-CN, zh-TW)
 │   ├── generate SVGs → npx svgo optimize
 │   ├── Gate 1: npm run build (zero errors)
 │   ├── Gate 2: npx lighthouse (perf≥90, a11y=100, seo≥95)
 │   └── Gate 3: browser-use screenshot + visual scoring (≥75/100)
 │
 ├── Phase 4: Push & Deploy
 │   ├── gh repo create DuoCode2/{slug} --private --source=. --push
 │   └── packages/deploy/deploy.ts → Vercel SDK → {slug}.vercel.app
 │
 └── Phase 5: Outreach (future)
     └── Evolution API → WhatsApp message with screenshot + link
```

## Skill Architecture

12 skills organized in a flat structure under `.claude/skills/`:

**Pipeline Skills** (invokable via `/slash-commands` or by Claude when instructed):
- `/generate` — E2E site generation (10-step process)
- `/batch` — batch orchestration for multiple leads
- `/discover` — Google Maps lead discovery
- `/prepare-assets` — photo download, color extraction, optimization
- `/quality-gate` — 3-gate quality pipeline (build, Lighthouse, visual QA)
- `/iterate-quality` — observe-modify-evaluate loop for design improvement
- `/deploy` — Vercel deployment

**Reference Skills** (Claude auto-loads when relevant, `user-invocable: false`):
- `duocode-design` — design system + industry references + schemas + templates
- `toolchain` — hub routing to browser-use, Lighthouse, n8n, GitHub, etc.
- `quality-standards` — hub routing to a11y, SEO, performance, CWV, etc.
- `project-standards` — TypeScript conventions + data schema standards

**Utility Skill** (both user and Claude):
- `/skill-creator` — create, test, and optimize skills

## Commands

```bash
# Tests
npm test                     # API keys + env + discover
npm run test:all             # Full suite (7 groups, run-all.sh)
npm run build:check          # TypeScript compile check

# Evals
npm run eval:skills          # Skill validation (frontmatter, structure, references, schema)
npm run eval:templates       # Template completeness (components, industry coverage)
npm run eval:quality         # Quality metrics (Lighthouse config, a11y, SEO)
npm run eval:all             # All evals + JSON report

# Pipeline
npm run discover -- --city "Kuala Lumpur" --category "restaurant" --limit 1
npx tsx packages/assets/extract-colors.ts --image path/to/image.jpg
npx tsx packages/deploy/deploy.ts --build-dir out --slug business-name
```

## External Tools

| Tool | Access | Notes |
|------|--------|-------|
| browser-use CLI | `toolchain/references/browser-use.md` | Visual QA, GUI automation |
| Lighthouse CI | `toolchain/references/lighthouse-ci.md` | Gate 2 auditing |
| n8n | `toolchain/references/n8n.md` | Webhook workflows |
| Playwright MCP | via `mcp__playwright__*` tools | Alternative visual testing |

## GitHub Organization

All generated sites push to **DuoCode2** org: `https://github.com/DuoCode2`

```bash
# Verify access
gh org list                    # Should show DuoCode2
gh repo list DuoCode2          # List existing repos

# Create + push a generated site
gh repo create DuoCode2/{slug} --private --source=output/{slug} --push

# Git config for this project
git config user.name "LiuWei"
git config user.email "sunflowers0607@outlook.com"
```

## Conventions

- **TypeScript strict** — no `any`, use `requireEnv()` from `packages/utils/env.ts`
- **SKILL.md frontmatter** — must have: name, description, allowed-tools. Optional: disable-model-invocation, user-invocable
- **Env vars** — `.env` is gitignored, `.env.template` has placeholders only
- **Branch naming** — never include `claude` in branch names
- **Git identity** — LiuWei / sunflowers0607@outlook.com
- **Language** — all docs, skills, and code comments in English

## Reference Docs

Architecture docs live at `../reference/` (outside this repo). Priority:
1. `DuoCode-TwoLayer-Skill-Architecture.md` — two-layer skill design
2. `DuoCode-Final-Guide.md` — latest implementation guide
3. `DuoCode-Pipeline-Infra-Plan-v3.md` — tech decisions + roadmap
4. `DuoCode-Claude-n8n-Collaboration.md` — n8n workflow details
5. `AGENT-IMPLEMENTATION-PROMPT.md` — agent execution instructions
