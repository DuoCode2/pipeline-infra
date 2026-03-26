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
- Responsive images: use `ResponsiveImage` from `@/components/ui` or `<picture>` with srcset from `@/data/images`
- Hero image: NEVER use `maps-1` (always exterior shot) — use `maps-2+` (interior/ambience)
- CSS variables: use `var(--color-primary)`, `var(--color-surface)`, etc. (always `--color-` prefix)
- NEVER use `opacity < 1` on text elements
- NEVER hardcode `color: white` or `text-white` — use `var(--color-on-primary-dark)`
- Touch targets ≥ 44×44px, headings sequential (h1 → h2 → h3)
- Quality gates: a11y ≥ 95, SEO ≥ 95, best-practices ≥ 90 (hard fail); performance ≥ 90 (warn only, does NOT block deploy)
- Retry: up to 3× on warn-level failures; error-level failures = fix code, no retry
