---
description: Rules for generated site code in output/
paths:
  - "output/**/*.tsx"
  - "output/**/*.ts"
  - "output/**/*.css"
---

# Generated Site Rules

- All sites need **4 languages**: en, ms, zh-CN, zh-TW
- Malaysia market rules: see `.claude/skills/duocode-design/references/malaysia-market.md`
- Price format: `RM12.90` (no space, never MYR or $)
- Phone: international `+60 12-345 6789`, local `012-345 6789`
- Responsive images: use WebP variants from `image-manifest.json`
- Hero image: NEVER use `maps-1` (always exterior)
- Schema.org: match `SCHEMA_ORG_TYPE[industry]` from `packages/generate/industry-config.ts`
