---
name: batch
description: "Parallel batch processing of multiple leads through the full pipeline: prepare assets, generate site, quality gate, deploy. Use when processing multiple businesses at once or user says 'batch', 'process all leads', 'run batch'."
allowed-tools: Bash, Read, Write
---

# Batch Orchestrator

Coordinates site generation and sequential deployment for a batch of classified leads. The main entry point is `packages/batch/orchestrate.ts`.

## Usage

```bash
npm run batch -- --city "Kuala Lumpur" --categories "restaurant,cafe" --batch-size 3
```

## Input

- CLI flags: `--city`, `--categories` (comma-separated), `--batch-size`
- Alternatively, pipe a `leads.json` array of classified leads from Google Sheets / n8n

**If city or categories are not provided, use AskUserQuestion to ask.** Never output a plain-text question.

## Workflow

### Step 1: Discover Leads

Calls `searchPlaces()` from `packages/discover/search.ts` for each category in the given city. Filters to businesses without websites. Results are capped to `batchSize` per category.

### Step 2: Classify Industry

Each lead's `primaryType` is passed through `classifyIndustry()` from `packages/generate/industry-config.ts`, mapping Google Maps types (e.g., `restaurant`, `hair_salon`) to DuoCode industry keys.

### Step 3: Asset Preparation (per lead)

For each lead, the orchestrator:
1. Downloads up to 3 Google Maps photos via `downloadMapsPhotos()` from `packages/assets/maps-photos.ts`
2. Downloads 2 Unsplash stock photos via `downloadStockPhotos()` from `packages/assets/stock-photos.ts`
3. Extracts brand colors via `extractAndSave()` from `packages/assets/extract-colors.ts`
4. Generates WebP variants at 320/640/960/1280px via `optimizeImages()` from `packages/assets/optimize-images.ts`

### Step 4: Site Generation (per lead)

1. Copies shared and industry-specific templates from `duocode-design/templates/`
2. Generates `src/data/business.ts` with business info, colors, images, and 4-language content (en, ms, zh-CN, zh-TW)
3. Runs `npm install && npm run build` to produce the `out/` static export (Gate 1)
4. Runs Lighthouse audit (Gate 2) — perf >= 90, a11y = 100, SEO >= 95
5. Takes desktop + mobile screenshots via `browser-use` and scores visual QA (Gate 3) — score >= 75/100
6. If any gate fails, fix and retry (max 3 rounds)

### Step 5: GitHub Push + Vercel Deploy (per lead, sequential)

**Do NOT pause between Gate 3 and deploy — execute continuously.**

1. `gh repo create DuoCode2/{slug} --private --source=. --push` — non-critical, failures logged
2. `deployToVercel()` from `packages/deploy/deploy.ts` — sequential to avoid rate limits

### Step 6: Logging and Report

- Each result is POSTed to the n8n `log-work` webhook for tracking in Google Sheets
- A `batch-report.json` is saved to `output/` with per-lead status, URLs, and errors
- **Report ONCE at the very end** — one summary table with all leads, URLs, scores

## Output

| File | Description |
|------|-------------|
| `output/batch-report.json` | Summary with per-lead status, URLs, and errors |
| `output/{place_id}/` | Individual site outputs (source, build, screenshots) |
| `output/{place_id}/out/` | Static export ready for Vercel |

## Pipeline Skills Referenced

- `prepare-assets` -- Asset preparation (photos, colors, optimization)
- `generate` -- Site generation (templates + business.ts)
- `quality-gate` -- Quality verification (build, Lighthouse, visual QA)
- `deploy` -- Vercel deployment via REST API
