---
description: Rules for generated site code in output/
paths:
  - "output/**/*.tsx"
  - "output/**/*.ts"
  - "output/**/*.css"
---

# Generated Site Rules

- **Write EN content only** in business.ts — translate.ts adds other locale blocks automatically
- Multi-locale is standard for non-English regions: run `translate.ts --locales` after design, before finalize
- Region auto-detected from lead address (zero-config, any country)
- Responsive images: use `ResponsiveImage` from `@/components/ui` or `<picture>` with srcset from `@/data/images`
- Hero image: NEVER use `maps-1` (always exterior shot) — use `maps-2+` (interior/ambience)
- CSS variables: use `var(--color-primary)`, `var(--color-surface)`, etc. (always `--color-` prefix)
- NEVER use `opacity < 1` on text elements
- NEVER hardcode `color: white` or `text-white` — use `var(--color-on-primary-dark)`
- Touch targets ≥ 44×44px, headings sequential (h1 → h2 → h3)
- Quality gates: a11y ≥ 95, SEO ≥ 95, best-practices ≥ 90 (hard fail); performance ≥ 90 (warn only, does NOT block deploy)
- Retry: up to 3× on warn-level failures; error-level failures = fix code, no retry
- **DO NOT modify `next.config.js`** — webpack aliases break React.cache and cause build failures
- **DO NOT manually add locales** to `i18n.ts` or `business.d.ts` — the pipeline manages locale types
