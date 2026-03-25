---
name: duocode-design
description: "Region-aware market rules, website archetype routing, and Next.js scaffolding for DuoCode site generation. Supports 15 industries and 8 website archetypes. Auto-loaded during /generate and /batch."
user-invocable: false
---

# DuoCode Design Context

This skill provides **region-specific market context**, **archetype-aware design guidance**, and **project scaffolding**.
ALL visual design decisions are made by Claude using the `frontend-design` skill.

## When generating a site:
1. Read the PrepareResult JSON — it includes `industry`, `archetype`, and `regionId`
2. Read `references/archetype-guide.md` for the specific archetype's design instructions
3. Read region market rules (e.g. `references/malaysia-market.md` for region `my`)
4. Copy scaffolding from `templates/_shared/` to `output/{slug}/`
5. Use `frontend-design` skill for ALL visual design (layout, components, typography, colors)
6. Generate page.tsx, components, and business.ts — archetype determines WHAT sections to build

## Website Archetypes (8 types)
The archetype determines **what sections and features** Claude builds:
- **menu-order** — Food: Interactive menu, ordering prototype, reservation demo
- **booking-services** — Beauty/Clinic/Pet/Education: Service catalog, booking flow, staff profiles
- **lead-trust** — Services/Automotive/Tech: Credentials, quote form, case studies, FAQ
- **ecommerce-catalog** — Retail: Product catalog, shopping cart demo, search
- **portfolio-gallery** — Events/Photography: Image gallery, packages, inquiry form
- **membership-schedule** — Fitness/Sports: Class timetable, membership tiers, trial signup
- **property-listing** — Hospitality/Real Estate: Listings browser, inquiry form
- **community-info** — Religious/Community: Events calendar, programs, donation demo

See `references/archetype-guide.md` for detailed design briefs per archetype.

## Industries (15 types)
`food` | `beauty` | `clinic` | `retail` | `fitness` | `service` | `automotive` | `tech` | `education` | `pet` | `events` | `hospitality` | `realestate` | `community` | `generic`

## Scaffolding provides:
- Next.js 14 static export config (package.json, next.config.js, tsconfig.json)
- Tailwind CSS with CSS variable theme (tailwind.config.ts)
- Multi-locale routing (locales set per region in lib/i18n.ts)
- Layout shell: CSS vars injection, JSON-LD, hreflang, non-blocking fonts (app/[locale]/layout.tsx)
- BusinessData TypeScript interface with archetype-specific optional sections (types/business.d.ts)
- .gitignore and vercel.json

## Claude generates fresh each time:
- `src/app/[locale]/page.tsx` — layout is 100% free, unique per business
- All components in `src/components/` — archetype guides which components to build
- `src/data/business.ts` — all locale content, archetype-specific sections from brand-colors.json
- Interactive demo features (per archetype guide) — frontend-only prototypes
- SVGs in `public/svgs/` — as many or few as the design needs

## Demo feature pattern:
All interactive features (ordering, booking, cart, etc.) are **frontend prototypes**.
Final actions show a demo confirmation: "此功能将在正式版中启用 / This feature will be available in the production version."

## Data files (from asset preparation):
- `brand-colors.json` — 9 color tokens (6 base + 3 WCAG-safe: onPrimary, onPrimaryDark, accentText)
- `lead.json` — traceability (place_id, industry, archetype, regionId)
- `public/images/` — optimized WebP photos
- `public/fonts/font-face.css` — self-hosted Latin fonts
- `public/robots.txt` + `public/favicon.svg` — SEO defaults

## Reference documents (auto-loaded):
- `references/archetype-guide.md` — Design briefs per archetype (WHAT to build)
- `references/malaysia-market.md` — RM pricing, +60 phone, Halal badges, bilingual menus
- `references/a11y-checklist.md` — WCAG 2.1 AA rules for generated sites
- `references/browser-use.md` — browser-use CLI commands for screenshots
- `references/lighthouse-ci.md` — Lighthouse CI setup and performance budgets
