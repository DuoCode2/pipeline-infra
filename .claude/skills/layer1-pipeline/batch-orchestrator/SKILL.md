---
name: batch-orchestrator
description: "Parallel batch processing of multiple leads through the full pipeline: prepare-assets, generate site, quality gate, deploy. Use when user says 'batch', 'process all leads', 'run batch', or wants to generate sites for multiple businesses at once."
license: AGPL-3.0
allowed-tools: "Bash Read Write"
metadata:
  author: duocode
  version: "1.0"
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

1. Copies shared and industry-specific templates from `layer2-design/duocode-design/templates/`
2. Generates `src/data/business.ts` with business info, colors, images, and 4-language content (en, ms, zh-CN, zh-TW)
3. Runs `npm install && npm run build` to produce the `out/` static export

### Step 5: Deployment (sequential)

Deploys each passing build to Vercel via `deployToVercel()` from `packages/deploy/deploy.ts`. Runs sequentially to avoid Vercel rate limits.

### Step 6: GitHub Push

Initializes a git repo in the output directory and pushes to `DuoCode2/{slug}` via GitHub CLI. Non-critical -- failures are logged but do not block the batch.

### Step 7: Logging and Report

- Each result is POSTed to the n8n `log-work` webhook for tracking in Google Sheets
- A `batch-report.json` is saved to `output/` with per-lead status, URLs, and errors

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
- `deploy-to-vercel` -- Vercel deployment via REST API
