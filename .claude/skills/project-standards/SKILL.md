---
name: project-standards
description: "DuoCode coding conventions (TypeScript strict, file naming, directory structure) and data schema standards (BusinessData interface, JSON schema authoring, field validation). Loaded automatically when writing or reviewing code."
allowed-tools: Read
user-invocable: false
---

# Project Standards

## Part 1: Code Conventions

Standards for all TypeScript code in the DuoCode pipeline.

### TypeScript Rules

- `strict: true` in tsconfig.json (enforced)
- No `any` types — define interfaces for all API responses
- Explicit return types on exported functions
- Use `requireEnv()` from `packages/utils/env.ts` for environment variables

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| TypeScript source | kebab-case | `extract-colors.ts` |
| React components | PascalCase | `Hero.tsx`, `ContactForm.tsx` |
| Schema files | kebab-case.schema.json | `restaurant.schema.json` |
| Data files | kebab-case | `brand-colors.json` |
| SKILL files | SKILL.md (uppercase) | `SKILL.md` |

### Directory Structure

```
output/{slug}/
├── public/
│   ├── images/          ← Optimized WebP images
│   └── svgs/            ← Generated SVG assets
├── src/
│   ├── app/[locale]/    ← Next.js i18n pages
│   ├── components/      ← React components
│   └── data/
│       └── business.ts  ← Generated business data
├── brand-colors.json    ← Extracted color palette
├── image-manifest.json  ← Image source mapping
└── qa-report.json       ← Quality gate results
```

### Import Conventions

- Use path aliases: `@/*` maps to `src/*`
- Use `requireEnv()` instead of `process.env.KEY!`
- Prefer named exports over default exports

---

## Part 2: Data Schema Standards

Defines how business data is structured across the DuoCode pipeline.

### Schema Composition

Every industry schema extends the base:

```
schemas/_base.schema.json        ← name, address, phone, hours, reviews, theme, assets
  + schemas/{industry}.schema.json ← industry-specific fields (menu, services, products...)
```

### Base Fields (all industries)

Defined in `duocode-design/schemas/_base.schema.json`:
- `name`, `tagline`, `address`, `phone`, `email`
- `operatingHours`, `reviews[]`, `rating`
- `theme` (colors, fonts, svgStyle)
- `assets` (images, svgs)
- `content` (4-language: en, ms, zh-CN, zh-TW)

### Adding a New Industry

1. Create `schemas/{industry}.schema.json` extending _base
2. Create `references/{industry}.md` with design guide (~150 lines)
3. Create `templates/{industry}/` with industry-specific components
4. Create `examples/{industry}/` with 1-2 sample outputs

### Field Validation Rules

| Field | Format | Example |
|-------|--------|---------|
| Phone | +60 XX-XXXX XXXX | +60 12-345 6789 |
| Price | RM{amount} | RM12.90 |
| URL | https:// required | https://example.com |
| Hours | 24h or AM/PM | Mon-Fri: 9:00-18:00 |

### Data Deduplication

Following the website-factory pattern, avoid duplicating fields:
- Rating/reviews count: derived from `reviews[]` array
- Years in business: derived from `yearEstablished`
- Business name in reviews: auto-injected, not stored per review
