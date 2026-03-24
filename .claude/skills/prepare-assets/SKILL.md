---
name: prepare-assets
description: Download Google Maps photos, fetch stock photos, extract brand colors, optimize images to WebP. Direct CLI — no n8n dependency.
allowed-tools: [Bash, Read, Glob]
user-invocable: true
---

# Asset Preparation

Prepares photos and brand colors for site generation.

## Usage
```bash
SLUG="business-name"
mkdir -p output/$SLUG/public/images

# 1. Download Maps photos (up to 5)
npx tsx packages/assets/maps-photos.ts \
  --photos '["places/xxx/photos/yyy", ...]' \
  --output output/$SLUG/public/images

# 2. Extract brand colors from best interior photo
#    maps-1 is always exterior — use maps-2 or later
npx tsx packages/assets/extract-colors.ts \
  --image output/$SLUG/public/images/maps-2.jpg \
  --output output/$SLUG

# 3. Optimize → WebP at 320/640/960/1280px + image-manifest.json
npx tsx packages/assets/optimize-images.ts \
  --input output/$SLUG/public/images

# 4. Optional: stock photos if fewer than 3 maps photos
npx tsx packages/assets/stock-photos.ts \
  --industry restaurant \
  --output output/$SLUG/public/images
```

## Output Files
- `output/{slug}/brand-colors.json` — 6 semantic colors (primary, primaryDark, accent, surface, textTitle, textBody)
- `output/{slug}/public/image-manifest.json` — responsive variant mapping
- `output/{slug}/public/images/*.webp` — optimized images
- `output/{slug}/attribution.json` — Unsplash credits (if stock photos used)

## n8n Webhook (optional convenience)
```bash
# Only if n8n is running (curl http://localhost:5678/healthz first)
xh POST http://localhost:5678/webhook/prepare-assets \
  place_id="xxx" industry="restaurant" output_dir="output/$SLUG"
```
