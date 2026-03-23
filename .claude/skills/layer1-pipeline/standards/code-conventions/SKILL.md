---
name: code-conventions
description: "TypeScript coding conventions, file naming rules, and directory structure standards for the DuoCode pipeline. Always active in context via description triggering. Use when writing new code, reviewing changes, or establishing project patterns."
license: AGPL-3.0
metadata:
  author: duocode
  version: "1.0"
---

# Code Conventions

Standards for all TypeScript code in the DuoCode pipeline.

## TypeScript Rules

- `strict: true` in tsconfig.json (enforced)
- No `any` types — define interfaces for all API responses
- Explicit return types on exported functions
- Use `requireEnv()` from `packages/utils/env.ts` for environment variables

## File Naming

| Type | Convention | Example |
|------|-----------|---------|
| TypeScript source | kebab-case | `extract-colors.ts` |
| React components | PascalCase | `Hero.tsx`, `ContactForm.tsx` |
| Schema files | kebab-case.schema.json | `restaurant.schema.json` |
| Data files | kebab-case | `brand-colors.json` |
| SKILL files | SKILL.md (uppercase) | `SKILL.md` |

## Directory Structure

```
output/{place_id}/
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

## Import Conventions

- Use path aliases: `@/*` maps to `src/*`
- Use `requireEnv()` instead of `process.env.KEY!`
- Prefer named exports over default exports
