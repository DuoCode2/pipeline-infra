---
name: translate
description: "Add multi-language support to a generated site. Translates EN content to target locales via Google Translate API. Use when user says 'translate', 'add languages', 'add locales', 'multi-language', or '多语言'."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TaskCreate, TaskUpdate]
user-invocable: true
disable-model-invocation: false
---

# Translate Site

Add multi-locale content to an existing site. Production-validated: 15 sites parallel, zero QA warnings.

## Input

Use **AskUserQuestion** to collect missing info:

| Input | Required? | What to ask |
|-------|-----------|-------------|
| Site slug or directory | YES | "Which site? (slug or path)" |
| Target locales | NO | Auto-detect from region; ask only if user wants specific overrides |

## Step 1: Identify the site and determine locales

Find `business.ts` at `output/{slug}/src/data/business.ts`.

Read `lead.json` to get `regionId`. Use this mapping to determine target locales:

| Region | Locales (exclude `en` — it's the source) |
|--------|------------------------------------------|
| `my` (Malaysia) | `ms,zh-CN,zh-TW` |
| `sg` (Singapore) | `zh-CN,ms` |
| `hk` (Hong Kong) | `zh-TW,zh-CN` |
| `tw` (Taiwan) | `zh-TW` |
| `jp` (Japan) | `ja` |
| `kr` (Korea) | `ko` |
| `th` (Thailand) | `th` |
| `id` (Indonesia) | `id` |
| `au`, `us`, `uk`, `ca`, `nz` | EN only — skip translation |

## Step 2: Translate (one command)

```bash
npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN
```

The script handles everything:
1. Parses business.ts, extracts EN content
2. Protects business name (proper noun — never translated)
3. Skips addresses, phones, URLs, prices, people's names
4. Applies hardcoded weekday map (consistent 周一~周日, not Google API)
5. Checks translation cache → calls Google Translate API v2 for uncached strings
6. Writes all locale blocks back into business.ts
7. Updates `region.locales` array
8. Runs QA checks

**Zero context cost** — Codex just runs the command.

## Step 3: Rebuild (if site was already deployed)

```bash
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
```

## Options

| Flag | Purpose |
|------|---------|
| `--dry-run` | Preview translatable strings without API calls |
| `--no-cache` | Force re-translate (ignore cache) |

## Cache

`data/translation-cache.json` stores translations keyed by source text + locale pair.
- Identical strings across sites ("Book Now", "View Menu") are free after first translation
- **Parallel-safe**: 15 concurrent runs tested with zero conflicts
- Business name uses `{{BIZNAME}}` placeholder in cache — entries reusable across different businesses

## Output

Report to user:
- Number of strings translated per locale
- Cache hit rate
- Any QA warnings
- If rebuilt: the live URL
