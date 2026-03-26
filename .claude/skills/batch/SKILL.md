---
name: batch
description: "Process multiple business leads in parallel. Each lead runs the full generate pipeline (prepare→design→finalize) as an independent agent. Use when user says 'batch', '批量', 'generate N sites', or provides multiple leads."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Batch Processing — Fully Parallel

Each lead runs its own complete pipeline (prepare → design → finalize) in a dedicated Agent.
All agents run concurrently. No sequential bottleneck.

## RULE: Gather required inputs BEFORE running

Use **AskUserQuestion** to collect ANY missing information. NEVER assume or default:

| Input | Required? | Example | What to ask |
|-------|-----------|---------|-------------|
| City/area | YES | "Mascot, Sydney" | "Which city or area should I search in?" |
| Business categories | YES | "food,beauty,clinic" | "What types of businesses? (e.g., food, beauty, clinic, retail, fitness)" |
| Count | YES | 5 | "How many sites do you want to generate?" |

**If the user says "帮我给悉尼mascot附近没有网站的店铺做网站" — they did NOT specify business types.** You MUST ask:
> "What types of businesses should I search for? For example: food, beauty, clinic, retail, fitness, service, automotive, tech, education, pet, events, hospitality, realestate, community — or 'all' for mixed."

NEVER default to "restaurant" or "food" when the user says "店铺" (shops — generic).

## Step 1: Discover

```bash
# --city and --category are REQUIRED, --limit is result count (default 5)
npx tsx packages/discover/search.ts --city "Mascot, Sydney" --category "food" --limit 5 --out data/leads/leads.json
```

For multiple categories, run separate searches and merge:
```bash
npx tsx packages/discover/search.ts --city "Mascot, Sydney" --category "food" --limit 3 --out data/leads/food.json
npx tsx packages/discover/search.ts --city "Mascot, Sydney" --category "beauty" --limit 3 --out data/leads/beauty.json
```

Or use the batch discovery script:
```bash
npx tsx packages/batch/orchestrate.ts --city "Mascot, Sydney" --categories "food,beauty" --limit 3 --out data/leads/batch.json
```

**Notes:**
- `--limit N` returns at most N qualified results (not API pages)
- search.ts defaults to no-website filter. Use `--include-all` if needed.
- **ALWAYS use `--lead-file`** in prepare (never inline `--lead` JSON — it lacks photos).

Read the leads file to get the count and names.

## RULE: Confirm before launching agents

**ALWAYS use AskUserQuestion to confirm before spawning agents.** Show the user what you found and ask how many to proceed with:

> "Found N businesses without websites:
> 1. Business A (category)
> 2. Business B (category)
> ...
> How many do you want to generate? All N, or pick specific ones?"

This is a **hard gate** — never launch agents without user confirmation of the count. Each agent costs time and API credits.

## Step 2: Launch Parallel Agents

After user confirms, spawn **one Agent per lead** in a **SINGLE message**. Each agent runs the full `/generate` pipeline:

```
For each lead [i] in leads.json:
  Agent(
    name="site-{slug}",
    prompt="
      You are generating a complete website for a business lead.

      ## Step 1: Prepare
      Run: npx tsx packages/pipeline/prepare.ts --lead-file {leads_file} --index {i}
      Read the JSON output to get outputDir, slug, regionId, brandColors, photos, lead, hints.

      ## Step 2: Design
      Read output/{slug}/brand-colors.json and photos in output/{slug}/public/images/.
      The PrepareResult includes 'hints' (suggestedIndustry, suggestedArchetype) — use as guidance, not mandate.
      Read references: archetype-guide.md, platforms-by-region.md, generic-market.md (or region-specific if available).

      Pick fonts using frontend-design skill, then download:
        npx tsx packages/assets/download-fonts.ts --fonts 'Font1,Font2' --weights '400,500,600,700' --output output/{slug}/public/fonts

      Import shared UI components from @/components/ui — don't recreate them.

      Create:
      1. src/app/[locale]/page.tsx — unique layout
      2. src/components/*.tsx — business-specific components
      3. src/data/business.ts — fill all locale content, set theme.fontDisplay and theme.fontBody

      Design rules:
      - Make ALL design decisions autonomously
      - Use theme tokens (onPrimary, onPrimaryDark, accentText) — NEVER hardcode white/colors
      - NEVER use opacity < 1 on text
      - Hero: fetchPriority='high', NOT CSS background-image
      - Non-hero: loading='lazy' decoding='async'
      - Headings sequential, touch targets ≥ 44px

      ## Step 2.5: Dev Preview (recommended)
      cd output/{slug} && npm install --silent && npm run dev &
      npx browser-use screenshot 'http://localhost:3000/en/' --output screenshots/preview.png --width 1440 --height 900
      Check the screenshot for obvious issues. Kill dev server when done.

      ## Step 3: Finalize
      Run: npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
      If quality-failed: fix issues, re-run (max 3 retries).

      ## Output
      Return JSON: { slug, status, url, scores }
    ",
    mode="bypassPermissions",
    run_in_background=true
  )
```

**Critical**: All Agent calls must be in a **single message** to run concurrently.

## Step 3: Collect Results

When all agents complete, report:
```
| # | Business | Status | URL | Scores |
|---|----------|--------|-----|--------|
| 1 | Pochito | deployed | https://pochito.vercel.app | perf:95 a11y:100 seo:100 |
| 2 | Mr. Nam | deployed | https://mr-nam.vercel.app | perf:92 a11y:98 seo:97 |
| 3 | Noodle Bar | quality-failed | — | a11y:89 (3 retries exhausted) |
```
