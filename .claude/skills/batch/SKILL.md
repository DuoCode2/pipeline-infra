---
name: batch
description: "Process multiple business leads in parallel. Prepare all → design each → finalize all. Use when user says 'batch', '批量', 'generate N sites', or provides multiple leads."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Batch Processing

Three phases: **parallel prepare** → **sequential design** → **parallel finalize**.

## Input
- City + category + count (e.g., "吉隆坡3个餐厅")
- Or pre-fetched lead list

## Phase 1: Discover + Parallel Prepare

```bash
# Get leads
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1
```

Launch one Agent per lead for parallel asset preparation:
```
For each lead:
  Agent(prompt="Run: npx tsx packages/pipeline/prepare.ts --lead '{lead_json}' --industry {industry}", mode="bypassPermissions")
```

All agents run concurrently. Each returns JSON with `outputDir`, `slug`, `brandColors`, etc.

## Phase 2: Sequential Design

Claude designs each site one at a time (needs full creative attention):

```
For each prepared lead:
  1. Read output/{slug}/brand-colors.json and photos
  2. Create unique page.tsx + components + 4-language content
  3. Follow /generate Step 2 rules (a11y, theme tokens, no hardcoded white)
```

## Phase 3: Parallel Finalize

Launch one Agent per site for parallel build + deploy:
```
For each site:
  Agent(prompt="Run: npx tsx packages/pipeline/finalize.ts --dir output/{slug}/", mode="bypassPermissions")
```

If any agent returns `quality-failed`: Claude fixes the specific issues, then re-runs finalize.

## Output
Report all live URLs:
```
✓ restaurant-a: https://restaurant-a.vercel.app
✓ restaurant-b: https://restaurant-b.vercel.app
✗ restaurant-c: quality-failed (fixing...)
```

## Fallback: Full Automation (no custom design)
```bash
npx tsx packages/batch/orchestrate.ts --city "Kuala Lumpur" --categories "restaurant" --batch-size 3
```
Uses hardcoded content templates. Good for bulk testing, not for production quality.
