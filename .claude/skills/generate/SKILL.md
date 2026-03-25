---
name: generate
description: "End-to-end website generation for a business lead. One sentence → live site. Supports 15 industries and 8 website archetypes with region-aware content. Use when user says 'generate', 'build a site', 'create website', or provides a business lead."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Site Generation

Three steps: **prepare** (mechanical) → **design** (creative) → **finalize** (mechanical).

## Input
- Lead data from discover or user-provided
- Industry (auto-detected from Google Maps `primaryType` if not specified)
- Region (default: `my` for Malaysia; pass `--region` to override)

## Step 1: Discover + Prepare

```bash
# Find leads and save to file (--region defaults to 'my')
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "food" --limit 1 --out leads.json

# Prepare from file
npx tsx packages/pipeline/prepare.ts --lead-file leads.json --index 0
```

Or inline (PlaceResult JSON format):
```bash
npx tsx packages/pipeline/prepare.ts --lead '{"id":"ChIJ...","displayName":{"text":"..."},...}'
```

This does ALL mechanical work: download photos → extract WCAG-safe brand colors → download fonts → optimize images → scaffold project → generate business.ts skeleton.

Returns JSON with: `outputDir`, `slug`, `brandColors`, `photos`, `config`, **`industry`**, **`archetype`**, **`regionId`**.

## Step 2: Design (Claude's creative work)

Read `output/{slug}/brand-colors.json` and photos in `output/{slug}/public/images/`.

**Read the archetype**: The prepare output includes `archetype` (one of 8 types). Read `references/archetype-guide.md` for the archetype's design brief — what sections to build, what the primary CTA should be, what demo features to include.

Then create:
1. **`src/app/[locale]/page.tsx`** — Unique layout guided by archetype. Every site visually different.
2. **`src/components/*.tsx`** — Custom components per archetype needs (menu, booking, catalog, etc.).
3. **`src/data/business.ts`** — Fill all locale content sections with archetype-specific data.
4. **Interactive demo features** — Per archetype guide (e.g., menu browser, booking calendar, product catalog). All demos are frontend-only; final actions show confirmation message.

Rules:
- Make ALL design decisions autonomously — fonts, layout, colors, copy
- Let the archetype guide WHAT to build; use `frontend-design` skill for HOW to style
- Use theme tokens: `theme.onPrimary` for text on primary bg, `theme.onPrimaryDark` for dark bg
- NEVER hardcode `color: white` or `text-white` on colored backgrounds
- NEVER use `opacity < 1` on text elements
- Headings must be sequential (h1 → h2 → h3)
- Touch targets ≥ 44x44px
- Read region market rules (e.g. `references/malaysia-market.md`) for formatting
- Read `references/a11y-checklist.md` for accessibility rules

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
