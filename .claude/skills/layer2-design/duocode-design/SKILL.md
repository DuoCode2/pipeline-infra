---
name: duocode-design
description: "Design system for DuoCode business websites. Contains shared design
foundations and industry-specific guidelines that are progressively loaded based on
the target business category. Use whenever generating business.ts, SVG assets, or
making design decisions for a business website. Covers: color strategy, typography,
SVG style, component emphasis, copy tone, layout, and responsive design."
license: AGPL-3.0
metadata:
  author: duocode
  version: "1.0"
allowed-tools: "Bash Read Write"
---

# DuoCode Frontend Design System

## How This Skill Works

This skill uses **progressive disclosure**. You don't read everything upfront.

### Always Read (loaded with this file):
The foundational rules below apply to ALL industries.

### Read On Demand (when you know the industry):
```
Read references/{industry}.md      ← industry-specific design guide
Read schemas/{industry}.schema.json ← industry-specific data fields
```

### Read If Needed (deep reference):
```
Read references/_foundations.md     ← full design system details
Read references/_copy-foundations.md ← full copywriting rules
```

---

## Universal Design Principles (always active)

### Anti-AI Aesthetics
- NEVER use Inter, Roboto, or system-default sans-serif as display font
- NEVER use purple-to-blue gradient on white background
- NEVER use perfectly symmetric card grids with identical spacing
- ALWAYS introduce at least one asymmetric or unexpected element
- ALWAYS use the brand colors from brand-colors.json, never generic palettes

### Color Application (from brand-colors.json)
- `primary` → Hero CTA, headings, interactive elements
- `primaryDark` → Header/Footer background, hover states
- `accent` → Secondary CTA, badges, highlights
- `surface` → Page background, card backgrounds
- `textTitle` → Headings (must pass WCAG 4.5:1 against surface)
- `textBody` → Body text (must pass WCAG 4.5:1 against surface)
- If brand-colors.json has low contrast → override with safe defaults

### Typography Hierarchy
- Display (Hero title): 48-72px, font-weight 700-900, letter-spacing tight
- H2 (Section titles): 32-40px, font-weight 600-700
- Body: 16-18px, font-weight 400, line-height 1.6-1.8
- Caption/Meta: 12-14px, font-weight 400-500, muted color
- Font pairing: one display + one body font, never more than 2 families

### SVG Asset Rules (all industries)
- viewBox defined, no hardcoded width/height
- Max 20 path elements per SVG (performance)
- Use `currentColor` for single-tone icons (CSS can restyle)
- Use brand-colors.json values for multi-tone decorations
- Include `<title>` for accessibility
- One consistent style per site: organic | elegant | geometric | modern

### Responsive Breakpoints
- Mobile-first: 375px base
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px
- Hero image: always full-width, aspect-ratio preserved

### Section Ordering (default, industries can override)
1. Header (sticky, transparent on Hero)
2. Hero (full-viewport, single CTA)
3. Trust Bar (ratings, years, certifications — if data exists)
4. Primary Content (Menu / Services / Products — industry-specific)
5. Gallery (if photos available)
6. Reviews/Testimonials
7. Location + Hours
8. Contact / CTA
9. Footer

---

## Industry Router

When you know the business industry, load the specific guide:

| Industry | Reference File | Schema | SVG Style | Color Warmth |
|---|---|---|---|---|
| restaurant | `references/restaurant.md` | `schemas/restaurant.schema.json` | organic | warm |
| beauty | `references/beauty.md` | `schemas/beauty.schema.json` | elegant | soft |
| clinic | `references/clinic.md` | `schemas/clinic.schema.json` | geometric | cool |
| retail | `references/retail.md` | `schemas/retail.schema.json` | modern | vibrant |
| fitness | `references/fitness.md` | `schemas/fitness.schema.json` | geometric | bold |
| service | `references/service.md` | `schemas/service.schema.json` | modern | neutral |
| generic | `references/generic.md` | `schemas/generic.schema.json` | modern | from photo |

**CRITICAL**: Read the industry reference file BEFORE generating any design decisions.
It contains: color temperature overrides, component emphasis, SVG element vocabulary,
copy tone, section ordering overrides, and layout-specific rules.

---

## Schema Composition

Every industry schema extends the base:
```
_base.schema.json          ← name, address, phone, hours, reviews, theme, assets
  + {industry}.schema.json ← industry-specific fields (menu, services, products...)
```

Read `schemas/_base.schema.json` first, then `schemas/{industry}.schema.json`.

---

## Maps Category → Industry Routing

```typescript
const SKILL_MAP: Record<string, string> = {
  restaurant: 'restaurant', cafe: 'restaurant', bakery: 'restaurant', bar: 'restaurant',
  beauty_salon: 'beauty', spa: 'beauty', nail_salon: 'beauty', barber: 'beauty',
  clinic: 'clinic', dentist: 'clinic', pharmacy: 'clinic',
  retail: 'retail', clothing_store: 'retail', electronics: 'retail',
  gym: 'fitness', laundry: 'service', auto_repair: 'service',
};

function route(mapsCategory: string): string {
  return SKILL_MAP[mapsCategory.toLowerCase().replace(/\s+/g, '_')] || 'generic';
}
```

---

## Template Usage

When generating a site:
1. Copy `templates/_shared/` as the project base
2. Copy `templates/{industry}/` components into the project
3. Replace `src/data/business.ts` with generated content (per schema)
4. Generate `public/svgs/*.svg` per industry SVG vocabulary
5. Run `npm run build` → outputs to `/out` with all 4 locale directories

---

## Localization

4 languages required for every site: en, ms, zh-CN, zh-TW.
- All content in `business.content[locale]`
- Menu/service names: keep original language, add translation
- CTA buttons: localized per language
- SEO meta: localized title + description per locale
- Read `references/_copy-foundations.md` for detailed copywriting rules
