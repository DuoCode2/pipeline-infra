---
name: duocode-design
description: "Region-aware market context, website design patterns, and Next.js scaffolding for DuoCode site generation. Region-agnostic and industry-agnostic — Codex makes all design decisions using reference material and frontend-design skill. Auto-loaded during /generate and /batch."
user-invocable: false
---

# DuoCode Design Context

This skill provides **reference material** and **project scaffolding**.
ALL design decisions are made by Codex using the `frontend-design` skill.

## Design Philosophy

Codex is the designer. The pipeline gives you:
- **Raw business data** (name, type, address, phone, photos, rating)
- **Brand colors** (extracted from photos, WCAG-safe)
- **Classification hints** (suggested industry + archetype — you may override)
- **Reference material** (validated patterns, market rules, platform guides)

You decide: site structure, fonts, layout, integrations, sections, and features.

## When generating a site:
1. Read the PrepareResult JSON — it includes `lead` (full business data) and `hints` (suggestions)
2. Decide your design approach — use a known archetype, mix them, or create custom
3. Read region-specific market rules if available (e.g., `references/malaysia-market.md`)
4. Read `references/platforms-by-region.md` for local platform integrations
5. Pick fonts and download them: `npx tsx packages/assets/download-fonts.ts --fonts "Font1,Font2" --output output/{slug}/public/fonts`
6. Use `frontend-design` skill for ALL visual design (layout, components, typography, colors)
7. Import shared UI components from `src/components/ui/` — don't recreate them

## Known Archetypes (validated patterns, not constraints)

These are 8 patterns we've validated. Use them as starting points, mix them, or design freely:

- **menu-order** — Food businesses: Interactive menu, ordering prototype, reservation
- **booking-services** — Service businesses: Service catalog, booking flow, staff profiles
- **lead-trust** — Professional services: Credentials, quote form, case studies, FAQ
- **ecommerce-catalog** — Retail: Product catalog, shopping cart demo, search
- **portfolio-gallery** — Creative businesses: Image gallery, packages, inquiry form
- **membership-schedule** — Fitness/wellness: Class timetable, membership tiers, trial signup
- **property-listing** — Property businesses: Listings browser, inquiry form
- **community-info** — Community orgs: Events calendar, programs, donation demo

See `references/archetype-guide.md` for detailed design briefs per archetype.

## Scaffolding provides:

### Pre-built (don't recreate):
- Next.js 14 static export config (package.json, next.config.js, tsconfig.json)
- Tailwind CSS with CSS variable theme (tailwind.config.ts)
- Multi-locale routing (app/[locale]/ with i18n.ts)
- Layout shell: CSS vars injection, JSON-LD, hreflang, font loading (app/[locale]/layout.tsx)
- BusinessData TypeScript interface (types/business.d.ts)
- **Shared UI components** (src/components/ui/) — Button, Section, Card, Grid, Accordion, Badge, ResponsiveImage, DemoModal, ReviewStars, HoursTable
- Base components: Header, Footer, Hero, Location, LanguageSwitcher

### Codex generates fresh each time:
- `src/app/[locale]/page.tsx` — layout is 100% free, unique per business
- Custom components in `src/components/` — as needed for this business
- `src/data/business.ts` — all locale content, theme with YOUR font choices
- Interactive demo features — frontend-only prototypes using DemoModal

## Demo feature pattern:
All interactive features (ordering, booking, cart, etc.) are **frontend prototypes**.
Import `DemoModal` from `@/components/ui` for the confirmation message.

## Data files (from asset preparation):
- `brand-colors.json` — 9 color tokens (6 base + 3 WCAG-safe)
- `lead.json` — full traceability (place_id, hints, regionId, photoSource)
- `public/images/` — optimized WebP + AVIF photos with responsive variants
- `src/data/images.ts` — auto-generated srcset data for responsive images
- `public/robots.txt` + `public/favicon.svg` — SEO defaults

## Reference documents:
- `references/archetype-guide.md` — Validated design patterns (WHAT to build)
- `references/platforms-by-region.md` — Local platforms by region (delivery, ecommerce, contact)
- `references/generic-market.md` — Universal market rules for any region
- `references/malaysia-market.md` — Malaysia-specific: RM pricing, +60 phone, Halal, bilingual
- `references/a11y-checklist.md` — WCAG 2.1 AA rules for generated sites
- `references/browser-use.md` — browser-use CLI commands for screenshots
