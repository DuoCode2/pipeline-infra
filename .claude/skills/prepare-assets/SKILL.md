---
name: prepare-assets
description: "Orchestrate asset preparation for a lead: download Google Maps photos, fetch Unsplash stock photos, extract brand colors with node-vibrant, optimize images with Sharp. Use when starting site generation or user says 'prepare assets', 'download photos'."
allowed-tools: Bash, Read, Write
---

# Prepare Assets

Fetch and process all visual assets for a business lead before site generation.

## Input

| Parameter | Required | Source |
|-----------|----------|--------|
| place_id | Yes | Google Maps search result |
| industry | Yes | Classification from n8n |
| photos[] | Yes | Photo resource names from Maps API |
| output_dir | Yes | `output/{place_id}/` |

## Output

| File | Description |
|------|-------------|
| `public/images/maps-*.webp` | Optimized Maps photos (4 breakpoints) |
| `public/images/stock-*.webp` | Unsplash fallback photos |
| `brand-colors.json` | 6 semantic colors extracted from lead photo |
| `image-manifest.json` | Maps source images to responsive variants |
| `attribution.json` | Unsplash compliance data |

## Workflow

### Step 1: Download Maps Photos
```bash
npx tsx packages/assets/maps-photos.ts \
  --photos '{{photos_refs_json}}' \
  --output output/{{place_id}}/public/images
```

### Step 2: Fetch Stock Photos (fallback)
```bash
npx tsx packages/assets/stock-photos.ts \
  --industry {{industry}} \
  --output output/{{place_id}}/public/images
```

### Step 3: Extract Brand Colors
```bash
npx tsx packages/assets/extract-colors.ts \
  --image output/{{place_id}}/public/images/maps-1.jpg \
  --output output/{{place_id}}
```

### Step 4: Optimize All Images
```bash
npx tsx packages/assets/optimize-images.ts \
  --input output/{{place_id}}/public/images \
  --output output/{{place_id}}/public/images
```

### Step 5: Generate Manifests
Write `brand-colors.json` and `image-manifest.json` -- already produced by Steps 3-4.

## Dependencies

- `packages/assets/maps-photos.ts` -- Google Maps photo download
- `packages/assets/stock-photos.ts` -- Unsplash fallback photos
- `packages/assets/extract-colors.ts` -- Brand color extraction (node-vibrant)
- `packages/assets/optimize-images.ts` -- Sharp WebP optimization
