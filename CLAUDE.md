# DuoCode Pipeline

Claude Code drives the full pipeline. Use `frontend-design` skill for all design work.

## Rules
- **NEVER write files to the project root** — all outputs go to their proper directory:
  - Lead JSON → `data/leads/`
  - Exports/CSV → `data/exports/`
  - Screenshots → `tests/screenshots/`
  - Site output → `output/{slug}/`
  - Scripts → `scripts/`
- Use **AskUserQuestion tool** for user input — never plain text questions
- Pipeline runs **end-to-end without pausing** — only stop if a gate fails after max retries
- **ONLY generate sites for businesses WITHOUT a website** — discover defaults to no-website filter
- Default locale is **English only** — multi-locale support is opt-in via `--locales en,ms,zh-CN`
- Region market rules: see `.claude/skills/duocode-design/references/` (e.g. `malaysia-market.md`)
- A11y rules: see `.claude/skills/duocode-design/references/a11y-checklist.md`
- Archetype guide: see `.claude/skills/duocode-design/references/archetype-guide.md`

## RULE: Self-iterate to deliver
When running /generate or /batch, Claude must:
- Make ALL design decisions autonomously (fonts, layout, colors, copy)
- Use the **archetype** from PrepareResult to determine what sections/features to build
- Fix quality gate failures without asking
- Deploy to Vercel and report the live URL
- NEVER stop to ask "should I continue?" or "does this look good?"
- Only stop if: (a) missing required input (use AskUserQuestion), (b) gate fails after 3 retries

## Pipeline: /generate (3 steps)
1. **Discover + Prepare** — find lead, then prepare assets + scaffold (returns `industry`, `archetype`, `regionId`)
2. **Design** — Claude creates archetype-aware components + localized content (the ONLY creative step)
3. **Finalize** — `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` → build + quality + deploy

## Pipeline Commands
| Command | When |
|---------|------|
| `npx tsx packages/discover/search.ts --city X --category Y --limit N --out leads.json` | Find leads → save to file |
| `npx tsx packages/pipeline/prepare.ts --lead-file leads.json --index 0` | Prepare from search output (by index) |
| `npx tsx packages/pipeline/prepare.ts --lead '{"id":"...","displayName":{"text":"..."},...}'` | Prepare from inline JSON (PlaceResult format) |
| `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` | After design (build + quality + deploy) |

Data flow: `search.ts` → `PlaceResult[]` → `prepare.ts` (via `--lead-file`). Zero-config: any country auto-detected from address, English by default.

## Industries (15 types)
`food` | `beauty` | `clinic` | `retail` | `fitness` | `service` | `automotive` | `tech` | `education` | `pet` | `events` | `hospitality` | `realestate` | `community` | `generic`

Pipeline auto-classifies from Google Places `primaryType`. Config in `packages/generate/industry-config.ts`.

## Website Archetypes (8 types)
Each industry maps to an archetype that determines what the site looks like:

| Archetype | Industries | Primary Feature |
|-----------|-----------|-----------------|
| `menu-order` | food | Interactive menu, ordering demo |
| `booking-services` | beauty, clinic, pet, education | Service catalog, booking flow |
| `lead-trust` | service, automotive, tech | Credentials, quote form, FAQ |
| `ecommerce-catalog` | retail | Product catalog, cart demo |
| `portfolio-gallery` | events | Gallery, packages, inquiry |
| `membership-schedule` | fitness | Timetable, membership tiers |
| `property-listing` | hospitality, realestate | Listings browser, inquiry |
| `community-info` | community | Events calendar, donations |

Config in `packages/generate/archetype-config.ts`.

## Quality Gate
- **a11y ≥ 95, SEO ≥ 95, best-practices ≥ 90** → hard fail (blocks deploy)
- **performance ≥ 90** → warn only (does NOT block deploy)
- Lighthouse runs with `--preset=desktop`; retry up to 2× on failure

## Dev Commands
```bash
npm test                 # Unit tests (vitest)
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests (requires API keys)
npm run test:e2e         # End-to-end tests
npm run test:all         # All tests + evals
npm run build:check      # TypeScript compile check (run from INFRA ROOT, not output/)
```

## CLI Fallback (no Claude design, generated fallback page)
```bash
npx tsx packages/batch/orchestrate.ts --city X --categories "a,b" --batch-size N
```

## Skills
| Skill | Type | Purpose |
|-------|------|---------|
| `/generate` | invoke | prepare → design → finalize (one site, archetype-aware) |
| `/batch` | invoke | fully parallel — one Agent per lead, archetype-aware |
| `/fix-site` | invoke | Fix visual issues → rebuild → redeploy |
| `frontend-design` | auto | Anthropic design skill — typography, color, layout, motion |
| `duocode-design` | auto | Region market rules + archetype guide + A11y + template structure |
