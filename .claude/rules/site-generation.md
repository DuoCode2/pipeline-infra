---
description: Rules for generated site code in output/
paths:
  - "output/**/*.tsx"
  - "output/**/*.ts"
  - "output/**/*.css"
---

# Generated Site Rules

- Default locale is **English only** — multi-locale is opt-in via `--locales` CLI flag
- Region auto-detected from lead address (zero-config, any country)
- Responsive images: use WebP variants from `image-manifest.json`
- Hero image: NEVER use `maps-1` (always exterior)
- Schema.org: match `SCHEMA_ORG_TYPE[industry]` from `packages/generate/industry-config.ts`
