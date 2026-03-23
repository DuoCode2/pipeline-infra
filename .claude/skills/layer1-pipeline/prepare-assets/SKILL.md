---
name: prepare-assets
description: "Orchestrate asset preparation for a lead: download Google Maps photos, fetch Unsplash stock photos, extract brand colors with node-vibrant, optimize images with Sharp. Use when starting site generation for a new lead, or when user says 'prepare assets', 'download photos', 'extract colors'."
license: AGPL-3.0
allowed-tools: "Bash Read Write"
metadata:
  author: duocode
  version: "1.0"
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
<!-- TODO: Call packages/assets/maps-photos.ts -->

### Step 2: Fetch Stock Photos (fallback)
<!-- TODO: Call packages/assets/stock-photos.ts if Maps photos < 3 -->

### Step 3: Extract Brand Colors
<!-- TODO: Call packages/assets/extract-colors.ts on best photo -->

### Step 4: Optimize All Images
<!-- TODO: Call packages/assets/optimize-images.ts → WebP at 320/640/960/1280px -->

### Step 5: Generate Manifests
<!-- TODO: Write image-manifest.json and brand-colors.json -->

## Dependencies

- `packages/assets/maps-photos.ts` — Google Maps photo download
- `packages/assets/stock-photos.ts` — Unsplash fallback photos
- `packages/assets/extract-colors.ts` — Brand color extraction (node-vibrant)
- `packages/assets/optimize-images.ts` — Sharp WebP optimization
