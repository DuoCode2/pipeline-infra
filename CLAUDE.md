# DuoCode Pipeline

Claude Code drives the full pipeline. Use `frontend-design` skill for all design work.

## Design Philosophy
**Region-agnostic, industry-agnostic.** The pipeline works for any business in any country. Claude makes all design decisions — industry classification and archetype suggestions from Prepare are *hints*, not constraints. Claude may use, mix, or override them.

## Rules
- **NEVER write files to the project root** — all outputs go to their proper directory:
  - Lead JSON → `data/leads/`
  - Exports/CSV → `data/exports/`
  - Screenshots → `output/{slug}/screenshots/` (per-site) or `tests/screenshots/` (general)
  - Site output → `output/{slug}/`
  - Scripts → `scripts/`
  - **Images/screenshots MUST go to `output/{slug}/screenshots/` or `output/{slug}/public/images/`** — a PreToolUse hook will BLOCK writes to wrong locations
- Use **AskUserQuestion tool** for user input — never plain text questions
- Pipeline runs **end-to-end without pausing** — only stop if a gate fails after max retries
- **ONLY generate sites for businesses WITHOUT a website** — discover defaults to no-website filter
- **Multi-locale is standard** — after writing EN content, run translate.ts to add target locales (auto-detected from region)
- Region market rules: see `.claude/skills/duocode-design/references/`
- A11y rules: see `.claude/skills/duocode-design/references/a11y-checklist.md`

## RULE: Ask before assuming
When running /generate or /batch, Claude must use **AskUserQuestion** for missing inputs:
- **City/area** — NEVER default to any city
- **Business category** — NEVER default to "restaurant" or "food". If user says "shops/stores/店铺" (generic), ASK what types
- **Count** — ALWAYS confirm how many sites to generate before launching agents. Show the list, ask "all N or pick specific ones?"

## RULE: Self-iterate to deliver
When running /generate or /batch, Claude must:
- Make ALL design decisions autonomously (fonts, layout, colors, copy, site structure)
- Use PrepareResult `hints` as suggestions — agree or override based on business context
- Pick fonts using `frontend-design` skill, then download: `npx tsx packages/assets/download-fonts.ts --fonts "Font1,Font2" --weights "400,500,600,700" --output output/{slug}/public/fonts`
- Import shared UI components from `src/components/ui/` — don't regenerate them
- Fix quality gate failures without asking
- Deploy to Vercel and report the live URL
- NEVER stop to ask "should I continue?" or "does this look good?"
- Only stop if: (a) missing required input (use AskUserQuestion), (b) gate fails after 3 retries

## Pipeline: /generate (4 steps)
1. **Discover + Prepare** — find lead, prepare assets + scaffold. Returns `lead` (full business data) + `hints` (suggested industry/archetype)
2. **Design** — Claude reads business data, decides site structure, picks fonts, writes EN content (the ONLY creative step)
3. **Translate** — `npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN` → auto-translate EN → target locales (zero context cost)
4. **Finalize** — `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` → build + quality + deploy

## Pipeline Commands
| Command | When |
|---------|------|
| `npx tsx packages/discover/search.ts --city X --category Y --limit N --out data/leads/leads.json` | Find leads (--city and --category required) |
| `npx tsx packages/discover/search.ts --city X --category Y --include-all --out data/leads/leads.json` | Include businesses WITH websites |
| `npx tsx packages/pipeline/prepare.ts --lead-file data/leads/leads.json --index 0` | Prepare from search output |
| `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` | After design (build + quality + deploy) |
| `npx tsx packages/assets/download-fonts.ts --fonts "Font1,Font2" --weights "400,500,600,700" --output output/{slug}/public/fonts` | Download fonts (called by Claude during design) |
| `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ --skip-build` | Re-deploy with existing build (skip npm install + build) |
| `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ --check-path /` | Finalize non-locale site (Lighthouse checks / instead of /en/) |
| `npx tsx packages/assets/optimize-images.ts --input path/to/images` | Standalone image optimization (any directory) |
| `npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN` | Auto-translate EN → target locales via Google Translate API (writes back to business.ts) |
| `npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN --dry-run` | Preview translatable strings without calling API |

Data flow: `search.ts` → `PlaceResult[]` → `prepare.ts` (via `--lead-file`). Any country auto-detected from address.

## Automatic Deduplication
`search.ts` automatically skips businesses that already have a generated site (tracked in `data/sites-registry.json`). This is code-level — no agent action needed.
- Registry is updated automatically: `prepare.ts` registers on prepare, `finalize.ts` registers on deploy
- To redo a site: use `--include-existing` flag on search.ts
- To check registry: `npx tsx packages/utils/registry.ts --list`
- If search returns 0 results, check if they're already registered (the tool will tell you)

## RULE: Photos must come from Google Maps
- **ALWAYS use `--lead-file` (from search.ts)**, not inline `--lead` JSON
- If search returns 0 results because business has a website, use `--include-all`
- Check `lead.json → photoSource` after prepare: `"maps"` = good, `"stock"` = bad
- The `src/data/images.ts` module provides responsive srcset data for `<picture>` elements

## Classification Hints
Prepare auto-classifies from Google Places `primaryType` and provides `hints`:
```json
{
  "suggestedIndustry": "food",
  "suggestedArchetype": "menu-order",
  "confidence": "high",
  "source": "primaryType exact match"
}
```
**These are suggestions.** Claude decides the final site structure. See `references/archetype-guide.md` for validated patterns.

## RULE: Deployment is ONLY through finalize.ts
- **NEVER run `vercel deploy`, `vercel build`, or any direct Vercel CLI command** — these trigger remote builds ($0.014-$0.476/min)
- **ALWAYS use `finalize.ts`** which calls `deploy.ts` internally with $0-cost REST API
- deploy.ts handles clean URLs, aliases, and team scope automatically
- If an agent needs to redeploy: `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ --skip-build`
- See `.claude/rules/deployment.md` for full cost rules

## Quality Gate
- **a11y ≥ 95, SEO ≥ 95, best-practices ≥ 90** → hard fail (blocks deploy)
- **performance ≥ 90** → warn only (does NOT block deploy)
- Lighthouse runs with `--preset=desktop`; retry up to 3× on warn-level failures only

## Dev Commands
```bash
npm test                 # Unit tests (vitest)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests (requires API keys)
npm run test:e2e         # End-to-end tests
npm run test:all         # All tests + evals
npm run build:check      # TypeScript compile check (run from INFRA ROOT, not output/)
```

## Skills
| Skill | Type | Purpose |
|-------|------|---------|
| `/generate` | invoke | prepare → design → translate → finalize (one site) |
| `/batch` | invoke | parallel agents with diversity plan + worktree isolation |
| `/translate` | invoke | Add locales to an existing site (standalone) |
| `/fix-site` | invoke | Fix visual issues → rebuild → redeploy |
| `frontend-design` | auto | Anthropic design skill — typography, color, layout, motion |
| `duocode-design` | auto | Design references + archetype guide + A11y + scaffolding |

## Batch-Specific Rules
- **Diversity plan required** — before launching agents, assign different fonts/layouts/colors per site to prevent mode collapse (see batch SKILL.md Step 1.5)
- **Worktree isolation** — each agent runs in `isolation: "worktree"` to prevent concurrent file collisions
- **Agent Teams preferred** — use `TeamCreate` for leader-supervisor coordination; leader relays discovered issues between teammates

## Translation (multi-locale) — production-validated
- **One command**: `npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN` — zero context cost
- Script: parse business.ts → extract EN → Google Translate API v2 → write locale blocks back → QA
- **Cache**: `data/translation-cache.json` — reused across sites. 15-site batch tested: common phrases hit cache after first site
- **Business name protection**: proper nouns (from `businessName` or `lead.json`) never translated ("Mascot Bakery" stays, not "吉祥物面包店")
- **Weekday normalization**: hardcoded `WEEKDAY_MAP` for 14 languages — guaranteed consistent (周一~周日, never 星期X mixed in)
- **Skip rules**: addresses, phones, URLs, prices, people's names, image paths, platform names
- **Parallel-safe**: 15 concurrent translate.ts runs tested with zero conflicts
- **Region → locales mapping** (from `env.ts`): `my` → `ms,zh-CN` | `sg` → `zh-CN,ms` | `au/us/uk` → EN only | `hk` → `zh-TW,zh-CN` etc.
- **Locale management**: Scaffold defaults to `['en']` only. translate.ts adds target locales. NEVER manually add locales to i18n.ts or business.d.ts
- Run **after** design (EN content written), **before** finalize

## Shared UI Components (in scaffold)
Import from `@/components/ui` — these are pre-built, don't recreate:
`Button` | `Section` | `Card` | `Grid` | `Accordion` | `Badge` | `ResponsiveImage` | `DemoModal` | `ReviewStars` | `HoursTable`

Base components (also in scaffold, don't recreate): `Header` | `Footer` | `Hero` | `Location` | `LanguageSwitcher`
