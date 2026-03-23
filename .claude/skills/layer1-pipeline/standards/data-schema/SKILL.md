---
name: data-schema
description: "BusinessData interface specification, JSON schema authoring rules, and field validation patterns for DuoCode sites. Reference when generating business.ts, extending schemas for new industries, or validating lead data."
license: AGPL-3.0
metadata:
  author: duocode
  version: "1.0"
---

# Data Schema Standards

Defines how business data is structured across the DuoCode pipeline.

## Schema Composition

Every industry schema extends the base:

```
schemas/_base.schema.json        ← name, address, phone, hours, reviews, theme, assets
  + schemas/{industry}.schema.json ← industry-specific fields (menu, services, products...)
```

## Base Fields (all industries)

Defined in `duocode-design/schemas/_base.schema.json`:
- `name`, `tagline`, `address`, `phone`, `email`
- `operatingHours`, `reviews[]`, `rating`
- `theme` (colors, fonts, svgStyle)
- `assets` (images, svgs)
- `content` (4-language: en, ms, zh-CN, zh-TW)

## Adding a New Industry

1. Create `schemas/{industry}.schema.json` extending _base
2. Create `references/{industry}.md` with design guide (~150 lines)
3. Create `templates/{industry}/` with industry-specific components
4. Create `examples/{industry}/` with 1-2 sample outputs

## Field Validation Rules

| Field | Format | Example |
|-------|--------|---------|
| Phone | +60 XX-XXXX XXXX | +60 12-345 6789 |
| Price | RM{amount} | RM12.90 |
| URL | https:// required | https://example.com |
| Hours | 24h or AM/PM | Mon-Fri: 9:00-18:00 |

## Data Deduplication

Following the website-factory pattern, avoid duplicating fields:
- Rating/reviews count: derived from `reviews[]` array
- Years in business: derived from `yearEstablished`
- Business name in reviews: auto-injected, not stored per review
