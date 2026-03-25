---
name: batch
description: "Process multiple business leads in parallel. Each lead runs the full generate pipeline (prepare→design→finalize) as an independent agent. Use when user says 'batch', '批量', 'generate N sites', or provides multiple leads."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Batch Processing — Fully Parallel

Each lead runs its own complete pipeline (prepare → design → finalize) in a dedicated Agent.
All agents run concurrently. No sequential bottleneck.

## Step 1: Discover

```bash
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "food" --limit 3 --out leads.json
```

**IMPORTANT**: search.ts defaults to `--no-website` filter (only businesses WITHOUT a website). Do NOT use `--include-all`. Verify by checking that no `websiteUri` field exists in leads.json.

Read `leads.json` to get the lead count and names.

## Step 2: Launch Parallel Agents

Spawn **one Agent per lead** in a single message. Each agent runs the full `/generate` pipeline independently:

```
For each lead [i] in leads.json:
  Agent(
    name="site-{slug}",
    prompt="
      You are generating a complete website for a business lead.

      ## Step 1: Prepare
      Run: npx tsx packages/pipeline/prepare.ts --lead-file leads.json --index {i}
      Read the JSON output to get outputDir, slug, brandColors, photos, config.

      ## Step 2: Design
      Read output/{slug}/brand-colors.json and photos in output/{slug}/public/images/.
      Create:
      1. src/app/[locale]/page.tsx — unique layout, visually distinct
      2. src/components/*.tsx — custom components as needed
      3. src/data/business.ts — fill all 4 locale content (en, ms, zh-CN, zh-TW)

      Design rules:
      - Make ALL design decisions autonomously (fonts, layout, colors, copy)
      - Use theme tokens: theme.onPrimary for text on primary bg, theme.onPrimaryDark for dark bg
      - NEVER hardcode color: white or text-white on colored backgrounds
      - NEVER use opacity < 1 on text elements
      - Headings sequential (h1 → h2 → h3), touch targets ≥ 44px
      - Malaysia market: RM prices, +60 phone format, bilingual menus
      - Read .claude/skills/duocode-design/references/malaysia-market.md for locale rules
      - Read .claude/skills/duocode-design/references/a11y-checklist.md for a11y rules

      ## Step 3: Finalize
      Run: npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
      If quality-failed: fix the specific issues in the failures array, then re-run finalize (max 3 retries).

      ## Output
      Return JSON: { slug, status, url, scores }
    ",
    mode="bypassPermissions"
  )
```

**Critical**: All Agent calls must be in a **single message** to run concurrently.

## Step 3: Collect Results

When all agents complete, report:
```
✓ food-a: https://food-a.vercel.app (perf:95 a11y:100 seo:100)
✓ food-b: https://food-b.vercel.app (perf:92 a11y:98 seo:97)
✗ food-c: quality-failed after 3 retries
```

## Fallback: CLI Automation (no Claude design)
```bash
npx tsx packages/batch/orchestrate.ts --city "Kuala Lumpur" --categories "food" --batch-size 3
```
Uses generic fallback page instead of bespoke design. Good for smoke tests.
