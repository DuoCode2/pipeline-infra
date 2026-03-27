---
name: translate
description: "Add multi-language support to a generated site. Translates EN content to target locales via Google Translate API. Use when user says 'translate', 'add languages', 'add locales', 'multi-language', or '多语言'."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TaskCreate, TaskUpdate]
user-invocable: true
disable-model-invocation: false
---

# Translate Site

Add multi-locale content to an existing site using Google Translate API v2.

## Input

Use **AskUserQuestion** to collect missing info:

| Input | Required? | What to ask |
|-------|-----------|-------------|
| Site slug or directory | YES | "Which site? (slug or path)" |
| Target locales | NO | Auto-detect from region; ask only if user wants specific overrides |

## Step 1: Identify the site

Find the site's `business.ts`:
- Single-tenant: `output/{slug}/src/data/business.ts`
- Multi-tenant: check `web/src/data/sites/{slug}.json`

Read `lead.json` (or the site data) to get `regionId`. Use `getLocalesForRegion()` from `packages/utils/env.ts` to determine default locales.

## Step 2: Dry run (preview)

```bash
npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN --dry-run
```

Check the output: how many strings, which fields. Confirm with user if the scope looks right.

## Step 3: Translate

```bash
npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN
```

The script:
1. Parses business.ts, extracts EN content
2. Classifies fields (translate vs skip)
3. Checks translation cache for hits
4. Calls Google Translate API v2 for uncached strings
5. Writes all locale blocks back into business.ts
6. Updates `region.locales` array
7. Runs QA checks (length, completeness, untranslated)

## Step 4: Review QA warnings

If the script exits with code 1, review the QA warnings in the JSON output. Common warnings:
- **Empty translation** — API returned blank; may need manual fill
- **Unusual length** — translation >2.5x source; check for garbled output
- **Possibly untranslated** — identical to source; may be correct for short phrases

## Step 5: Rebuild (if site was already deployed)

```bash
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
```

## Options

| Flag | Purpose |
|------|---------|
| `--dry-run` | Preview strings without API calls |
| `--no-cache` | Force re-translate (ignore cache) |

## Cache

`data/translation-cache.json` stores translations keyed by source text + locale pair. Identical strings across sites (e.g., "Book Now", "View Menu") are free after the first translation.

## Output

Report to user:
- Number of strings translated per locale
- Cache hit rate
- Any QA warnings
- If rebuilt: the live URL
