---
name: generate
description: "End-to-end website generation for a business lead. One sentence → live site. Region-agnostic, industry-agnostic — Claude makes all design decisions. Use when user says 'generate', 'build a site', 'create website', or provides a business lead."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Skill, TaskCreate, TaskUpdate]
user-invocable: true
---

# Site Generation

Three steps: **prepare** (mechanical) → **design** (creative) → **finalize** (mechanical).

## Input
- Lead data from discover or user-provided
- Region auto-detected from address (any country supported)

## RULE: Gather required inputs BEFORE running

Use **AskUserQuestion** to collect ANY missing information. NEVER assume or default:

| Input | Required? | What to ask if missing |
|-------|-----------|------------------------|
| City/area | YES | "Which city or area?" |
| Business category | YES | "What type of business? (food, beauty, clinic, retail, etc.)" |
| Business name | NO | search.ts finds leads automatically |

**NEVER default category to "restaurant" or "food".** If user says "shops" or "stores" without specifying type, ASK.

## CRITICAL: Photos Rule
**ALWAYS use `--lead-file` from search.ts output.** NEVER hand-write inline PlaceResult JSON.

Why: search.ts output includes the `photos` field (Google Maps photo resource names). Hand-crafted JSON misses this, causing fallback to generic stock photos.

If the business has a website and gets filtered out, use `--include-all`:
```bash
npx tsx packages/discover/search.ts --city "City" --category "business name" --include-all --out data/leads/leads.json
```

After prepare, check `lead.json → photoSource`:
- `"maps"` = real business photos (good)
- `"stock"` = Unsplash fallback (bad — try --include-all)
- `"mixed"` = some real + some stock

## Step 1: Discover + Prepare

```bash
# Find leads (--city and --category are REQUIRED, no defaults)
npx tsx packages/discover/search.ts --city "Tokyo" --category "food" --limit 1 --out data/leads/leads.json

# Prepare from file (PREFERRED — ensures photos are included)
npx tsx packages/pipeline/prepare.ts --lead-file data/leads/leads.json --index 0
```

This does mechanical work: download Maps photos → extract WCAG-safe brand colors → optimize images (WebP + AVIF) → scaffold project → generate business.ts skeleton.

Returns JSON with:
- `outputDir`, `slug`, `regionId`, `brandColors`, `photos`, `photoCount`
- `lead` — full PlaceResult (business name, type, address, phone, rating, hours, photos)
- `hints` — classification suggestions: `{ suggestedIndustry, suggestedArchetype, confidence, source }`

**Hints are suggestions, not constraints.** You decide the final site structure.

## Step 2: Design (Claude's creative work)

This is where ALL creative decisions happen. You are the designer.

### 2a. Understand the business
Read the PrepareResult JSON. Look at:
- `lead.displayName.text` — what's the business name?
- `lead.primaryType` — what does Google categorize it as?
- `lead.formattedAddress` — what country/region?
- `hints.suggestedIndustry` / `hints.suggestedArchetype` — do you agree with the classification?

### 2b. Choose your design approach
Read `references/archetype-guide.md` for validated site patterns. You can:
- **Use a known archetype** as-is if it fits perfectly
- **Mix archetypes** (e.g., a pet café → menu-order + booking-services)
- **Create a custom structure** if no archetype fits

Read region reference docs if available (e.g., `references/malaysia-market.md` for region `my`, or `references/generic-market.md` for unknown regions). Check `references/platforms-by-region.md` for local platform integrations.

### 2c. Pick fonts and download them
Use the `frontend-design` skill for typography guidance. Choose a distinctive display font + body font pair. Then download:
```bash
npx tsx packages/assets/download-fonts.ts --fonts "YourDisplayFont,YourBodyFont" --weights "400,500,600,700" --output output/{slug}/public/fonts
```
Update `business.ts` with your font choices: `theme.fontDisplay` and `theme.fontBody`.

### 2d. Build the site
Use shared UI components from `src/components/ui/` (Button, Section, Card, Grid, Accordion, Badge, ResponsiveImage, DemoModal, ReviewStars, HoursTable). Import them — don't recreate.

Create:
1. **`src/app/[locale]/page.tsx`** — Unique layout. Every site visually different.
2. **`src/components/*.tsx`** — Custom components for this business's needs.
3. **`src/data/business.ts`** — Fill all locale content with real business data.
4. **Interactive demo features** — Frontend-only prototypes; final actions use DemoModal.

### 2e. Use responsive images
Import from `@/data/images` for srcset data. Use the `ResponsiveImage` UI component or `<picture>` with AVIF and WebP `<source>` elements.

### Design rules:
- Make ALL design decisions autonomously — no asking "should I...?"
- Use theme tokens: `theme.onPrimary`, `theme.onPrimaryDark`, `theme.accentText`
- NEVER hardcode `color: white` or `text-white` on colored backgrounds
- NEVER use `opacity < 1` on text elements
- Hero image: `fetchPriority="high"`, NOT CSS `background-image` (hurts LCP)
- Non-hero images: `loading="lazy"` + `decoding="async"`
- Sequential headings (h1 → h2 → h3), touch targets ≥ 44x44px
- Read `references/a11y-checklist.md` for accessibility rules

### 2f. Multi-locale content
Write the EN locale content first, then generate other locales. For multi-locale sites:
```bash
npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN,zh-TW
```
This extracts EN strings into a translation template. Use it as a reference to write other locale blocks in business.ts.

## Step 2.5: Dev Preview (catch issues before finalize)

Before running finalize (which takes 1-2 min), do a quick visual check:
```bash
cd output/{slug} && npm install --silent && npm run dev &
# Wait for dev server, then screenshot
npx browser-use screenshot "http://localhost:3000/en/" --output screenshots/preview-desktop.png --width 1440 --height 900
npx browser-use screenshot "http://localhost:3000/en/" --output screenshots/preview-mobile.png --width 375 --height 812
```
Read the screenshots to catch layout/style issues BEFORE the full build cycle. Kill the dev server when done.

This step is optional but recommended — it saves time by catching issues early instead of after a full Lighthouse audit cycle.

## Step 3: Finalize (one command)

```bash
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
```

Does: build → Lighthouse audit → deploy to Vercel → git push → log.

Returns JSON:
- **Success**: `{ "status": "deployed", "url": "https://...", "scores": {...} }`
- **Failure**: `{ "status": "quality-failed", "failures": [...] }`

If quality-failed: fix the specific issues, then re-run finalize.

## Output
Report the live URL returned by `finalize`.
