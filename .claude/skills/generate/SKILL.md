---
name: generate
description: "End-to-end website generation for a business lead. One sentence → live site. Use when user says 'generate', 'build a site', 'create website', or provides a business lead."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Site Generation

Three steps: **prepare** (mechanical) → **design** (creative) → **finalize** (mechanical).

## Input
- Lead data from discover or user-provided
- Industry (auto-detected from Google Maps `primaryType` if not specified)

## Step 1: Discover + Prepare

```bash
# Find leads and save to file
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "food" --limit 1 --out leads.json

# Prepare from file (takes first lead by default, use --index N for others)
npx tsx packages/pipeline/prepare.ts --lead-file leads.json --index 0 --industry food
```

Or inline (PlaceResult JSON format):
```bash
npx tsx packages/pipeline/prepare.ts --lead '{"id":"ChIJ...","displayName":{"text":"..."},...}'
```

This does ALL mechanical work: download photos → extract WCAG-safe brand colors → download fonts → optimize images → scaffold project → generate business.ts skeleton.

Returns JSON with: `outputDir`, `slug`, `brandColors`, `photos`, `config`.

## Step 2: Design (Claude's creative work)

Read `output/{slug}/brand-colors.json` and photos in `output/{slug}/public/images/`.

Then create:
1. **`src/app/[locale]/page.tsx`** — Unique layout. Every site must be visually different.
2. **`src/components/*.tsx`** — Custom components as needed (no fixed set).
3. **`src/data/business.ts`** — Fill all 4 locale content sections (en, ms, zh-CN, zh-TW).

Rules:
- Make ALL design decisions autonomously — fonts, layout, colors, copy
- Use theme tokens: `theme.onPrimary` for text on primary bg, `theme.onPrimaryDark` for dark bg
- NEVER hardcode `color: white` or `text-white` on colored backgrounds
- NEVER use `opacity < 1` on text elements
- Headings must be sequential (h1 → h2 → h3)
- Touch targets ≥ 44x44px
- See `references/malaysia-market.md` for formatting (RM prices, +60 phone, bilingual menus)
- See `references/a11y-checklist.md` for accessibility rules

## Step 3: Finalize (one command)

```bash
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
```

This does: build → Lighthouse audit (auto port) → deploy to Vercel → git push → log.

Returns JSON:
- **Success**: `{ "status": "deployed", "url": "https://<resolved-vercel-url>", "scores": {...} }`
- **Failure**: `{ "status": "quality-failed", "failures": [{ "audit": "...", "elements": [...] }] }`

If quality-failed: fix the specific issues in `failures`, then re-run finalize. Keep retries intentional and capped.

## Output
Report the live URL returned by `finalize`.
