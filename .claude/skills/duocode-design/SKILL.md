---
name: duocode-design
description: "Malaysia market rules (pricing RM format, phone +60, Halal, 4 languages) and Next.js scaffolding for DuoCode site generation. Auto-loaded during /generate and /batch."
user-invocable: false
---

# DuoCode Design Context

This skill provides Malaysia market context and project scaffolding.
ALL visual design decisions are made by Claude using the `frontend-design` skill.

## When generating a site:
1. Read `references/malaysia-market.md` for locale/formatting rules
2. Copy scaffolding from `templates/_shared/` to `output/{slug}/`
3. Use `frontend-design` skill for ALL visual design (layout, components, typography, colors)
4. Generate page.tsx, components, and business.ts freely — no fixed templates

## Scaffolding provides:
- Next.js 14 static export config (package.json, next.config.js, tsconfig.json)
- Tailwind CSS with CSS variable theme (tailwind.config.ts)
- 4-locale routing: en, ms, zh-CN, zh-TW (lib/i18n.ts)
- Layout shell: CSS vars injection, JSON-LD, hreflang, non-blocking fonts (app/[locale]/layout.tsx)
- BusinessData TypeScript interface (types/business.d.ts)
- .gitignore and vercel.json

## Claude generates fresh each time:
- `src/app/[locale]/page.tsx` — layout is 100% free, unique per business
- All components in `src/components/` — no fixed set
- `src/data/business.ts` — 4 languages, theme colors from brand-colors.json
- SVGs in `public/svgs/` — as many or few as the design needs
- Any additional styles or utilities

## Data files (from asset preparation):
- `brand-colors.json` — 9 color tokens (6 base + 3 WCAG-safe: onPrimary, onPrimaryDark, accentText)
- `public/image-manifest.json` — responsive image variants
- `public/images/` — optimized WebP photos
- `public/fonts/font-face.css` — self-hosted Latin fonts
- `public/robots.txt` + `public/favicon.svg` — SEO defaults

## Reference documents (auto-loaded):
- `references/malaysia-market.md` — RM pricing, +60 phone, Halal badges, bilingual menus
- `references/a11y-checklist.md` — WCAG 2.1 AA rules for generated sites
- `references/browser-use.md` — browser-use CLI commands for screenshots
- `references/lighthouse-ci.md` — Lighthouse CI setup and performance budgets
