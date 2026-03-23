# DuoCode Pipeline

Claude Code is the central brain orchestrating the entire pipeline. You (Claude) drive every phase — from lead discovery to site generation to deployment.

## Pipeline Tools

These are the tools YOU use to execute the pipeline. Know them well.

### Site Generation & Build
| Tool | Command | Purpose |
|------|---------|---------|
| Next.js | `npm run build` | Static site generation from templates |
| TypeScript | `npx tsx packages/*.ts` | Run pipeline scripts |
| SVGO | `npx svgo output/{place_id}/public/svgs/*.svg` | Optimize generated SVGs |
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
cd output/{place_id}
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

### Docker
```bash
cd n8n && docker compose up -d     # Start n8n (builds custom image with pre-installed packages)
docker compose logs -f n8n         # Watch logs
curl http://localhost:5678/healthz  # Health check
# Uncomment evolution-api in docker-compose.yml for Phase 5 WhatsApp
```

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

## Two-Layer Skill System

**Layer 1** (`layer1-pipeline/`) — HOW to build. Tools, process, quality.
**Layer 2** (`layer2-design/`) — WHAT to build. Design decisions per industry.

When generating a site, load skills in this order:
1. `generate/SKILL.md` — orchestration steps
2. `duocode-design/SKILL.md` — shared design principles (always loaded, ~150 lines)
3. `duocode-design/references/{industry}.md` — industry-specific design (on demand)
4. `duocode-design/schemas/{industry}.schema.json` — data field definitions (on demand)

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

## Installed Skills (from verified sources)

| Skill | Source | Path |
|-------|--------|------|
| browser-use | Official (browser-use repo) | `toolchain/browser-use/` |
| lighthouse-ci | Community (claude-skill-registry) | `toolchain/lighthouse-ci/` |
| github | Community (claude-skill-registry) | `toolchain/github/` |
| webapp-testing | Official (Anthropic) | `quality/webapp-testing/` |
| deploy-to-vercel | Official (Vercel) | `deploy/deploy-to-vercel/` |
| Playwright MCP | MCP Server (configured) | via `mcp__playwright__*` tools |

## GitHub Organization

All generated sites push to **DuoCode2** org: `https://github.com/DuoCode2`

```bash
# Verify access
gh org list                    # Should show DuoCode2
gh repo list DuoCode2          # List existing repos

# Create + push a generated site
gh repo create DuoCode2/{slug} --private --source=output/{place_id} --push

# Git config for this project
git config user.name "LiuWei"
git config user.email "sunflowers0607@outlook.com"
```

## Conventions

- **TypeScript strict** — no `any`, use `requireEnv()` from `packages/utils/env.ts`
- **SKILL.md frontmatter** — must have: name, description, license, metadata.author, metadata.version
- **License** — AGPL-3.0 for DuoCode-authored skills, keep original for third-party
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
