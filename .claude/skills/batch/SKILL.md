---
name: batch
description: "Process multiple business leads in parallel. Each lead runs the full generate pipeline (prepare→design→translate→finalize) as an independent agent. Use when user says 'batch', '批量', 'generate N sites', or provides multiple leads. Also triggers for '帮我给...做网站' or 'create sites for businesses in...'."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Skill, TeamCreate, SendMessage, TaskCreate, TaskUpdate, TaskList, TaskGet]
user-invocable: true
disable-model-invocation: false
---

# Batch Processing — Fully Parallel

Each lead runs its own complete pipeline (prepare → design → translate → finalize) in a dedicated Agent.
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

## Step 1.5: Generate Diversity Plan (prevent mode collapse)

Before launching agents, create a **diversity plan** that assigns each site a different design direction. Independent agents will converge on the same fonts/layouts without explicit differentiation.

For each confirmed lead, assign:
- **Font pairing**: NO two sites in the same batch should use the same display font. Draw from diverse families: serif (Fraunces, Bitter, Lora), sans-serif (Outfit, Sora, Manrope), display (Instrument Serif, Cabinet Grotesk, Clash Display), handwritten (Caveat, Kalam), monospace (JetBrains Mono, Space Mono).
- **Layout direction**: Vary between: full-bleed hero, split hero, minimal/editorial, asymmetric, card-grid-first, gallery-first, testimonial-led.
- **Color treatment**: Vary between: bold/saturated, muted/earthy, monochrome+accent, dark mode, pastel, high-contrast.

Write the plan as a JSON array and include each lead's assigned direction in the agent prompt.

Example:
```json
[
  { "slug": "delta-hair-studio", "displayFont": "Outfit", "layout": "minimal-editorial", "colorTreatment": "muted-earthy" },
  { "slug": "xclusive-hair-salon", "displayFont": "Instrument Serif", "layout": "asymmetric", "colorTreatment": "bold-saturated" },
  { "slug": "johns-mens-hair", "displayFont": "Space Mono", "layout": "card-grid-first", "colorTreatment": "dark-mode" }
]
```

This is critical for same-category batches (e.g., 5 hair salons). Without explicit diversity constraints, Claude will default to the same "safe" choices for every site.

## Step 2: Launch with Agent Teams (preferred) or Parallel Agents

Agent Teams provides coordination that plain agents lack. Use Teams when available.

### Option A: Agent Teams (preferred — enables coordination)

```
TeamCreate(
  name="batch-{city}",
  prompt="
    You are the batch coordinator for {N} sites in {city}.

    ## Your responsibilities
    1. Create one task per lead with TaskCreate (subject: 'Generate site: {businessName}')
    2. Set task dependencies: each site has 4 phases (prepare → design → translate → finalize)
       Use addBlockedBy to ensure finalize waits for design, design waits for prepare.
    3. Assign each task to a teammate
    4. Monitor progress via TaskList
    5. If a teammate reports an issue (CSS bug, build error, API failure),
       use SendMessage to warn ALL other teammates immediately
    6. When all teammates complete, collect results and report the summary table

    ## Diversity plan
    {diversityPlanJSON}

    ## Leads file
    {leadsFile}

    ## Issue relay protocol
    When a teammate sends you a message about a discovered problem:
    - Categorize: CSS/build/deploy/design issue
    - If it affects shared code (scaffold, UI components): broadcast to ALL teammates
    - If it's site-specific: note it but don't broadcast
    - Track all issues in a task: 'Batch issues log'
  "
)
```

Each teammate runs the full /generate pipeline (prepare → design → translate → finalize) with `isolation: "worktree"` and its assigned design direction. The leader relays discovered issues between teammates in real time.

### Option B: Plain Parallel Agents (fallback if Teams unavailable)

After user confirms and diversity plan is ready, spawn **one Agent per lead** in a **SINGLE message**. Each agent runs the full `/generate` pipeline:

```
For each lead [i] in leads.json:
  Agent(
    name="site-{slug}",
    prompt="
      You are generating a complete website for a business lead.

      ## Step 1: Prepare
      Run: npx tsx packages/pipeline/prepare.ts --lead-file {leads_file} --index {i}
      Read the JSON output to get outputDir, slug, regionId, brandColors, photos, lead, hints.

      ## DESIGN DIRECTION (from batch diversity plan)
      Display font: {assignedDisplayFont}
      Layout approach: {assignedLayout}
      Color treatment: {assignedColorTreatment}
      You MUST use these — they were chosen to differentiate this site from others in the same batch.

      ## Step 2: Design
      Read output/{slug}/brand-colors.json and photos in output/{slug}/public/images/.
      The PrepareResult includes 'hints' (suggestedIndustry, suggestedArchetype) — use as guidance, not mandate.
      Read references: archetype-guide.md, platforms-by-region.md, generic-market.md (or region-specific if available).

      Download your assigned display font + a complementary body font:
        npx tsx packages/assets/download-fonts.ts --fonts '{assignedDisplayFont},BodyFont' --weights '400,500,600,700' --output output/{slug}/public/fonts

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

      ## Step 3: Translate (zero context cost)
      Auto-translate EN → target locales. Determine locales from regionId:
        my → ms,zh-CN,zh-TW | sg → zh-CN,ms | hk → zh-TW,zh-CN | EN-only regions (au,us,uk) → skip
      Run: npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN
      This is cached — common phrases are free after the first site in the batch.
      For EN-only regions, skip this step entirely.

      ## Step 4: Finalize
      Run: npx tsx packages/pipeline/finalize.ts --dir output/{slug}/
      If quality-failed: fix issues, re-run (max 3 retries).

      ## Output
      Return JSON: { slug, status, url, scores }
    ",
    mode="bypassPermissions",
    run_in_background=true,
    isolation="worktree"
  )
```

**Critical**: All Agent calls must be in a **single message** to run concurrently.

**Why `isolation: "worktree"`**: Each agent gets an isolated git worktree copy of the repo. This prevents:
- Concurrent file collisions (two agents writing to shared files)
- One agent's CSS fix leaking into another agent's build
- Registry race conditions (each worktree has its own copy)

After each agent finishes, its changes are on a separate branch. The leader (or parent) merges results back.

## Concurrency Limits

**Local machine (Apple Silicon Mac):**
- Maximum **4-5 concurrent agents** running full pipeline (npm install + next build is CPU+memory intensive)
- Beyond 5 agents: builds start failing silently with empty error strings (resource exhaustion)
- **Detecting resource exhaustion**: before launching a wave, check available memory with `os.freemem()` — if below 2 GB, wait for running builds to finish. The telltale symptom is `next build` failing with an empty error string (no stack trace, no message) due to the OS killing the process (OOM)
- For batches > 5: run in waves of 4-5, wait for wave to complete before starting next

**Vercel Pro Plan (COST-AWARE — CRITICAL):**
- **NEVER run `vercel deploy` or `vercel build` directly** — these trigger remote builds ($0.014-$0.476/min)
- deploy.ts uses REST API with `framework: null` = $0 build cost (no remote build machine)
- CLI fallback (`--prebuilt` + Build Output API v3) also $0 — but only deploy.ts configures it correctly
- **ALL deployment MUST go through `finalize.ts`** which calls deploy.ts internally
- Agents must NEVER bypass finalize.ts by running Vercel CLI commands directly
- The real bottleneck is local `next build`, not Vercel

**Important worktree notes:**
- Worktree cleanup removes node_modules (gitignored) — finalize.ts handles this by auto-running `npm install`
- All paths in pipeline scripts resolve from `__dirname`, not CWD — safe to run from any directory
- Registry and translation cache resolve to the project root regardless of worktree location

## RULE: Agents must NOT modify next.config.js
The scaffold's `next.config.js` is locked — adding webpack aliases or React resolve overrides will break `React.cache` and cause build failures. If an agent encounters "duplicate React" errors, the fix is to ensure `node_modules` is installed correctly, NOT to add webpack aliases.

## Step 3: Collect Results

When all agents complete, report:
```
| # | Business | Status | URL | Scores |
|---|----------|--------|-----|--------|
| 1 | Pochito | deployed | https://pochito.vercel.app | perf:95 a11y:100 seo:100 |
| 2 | Mr. Nam | deployed | https://mr-nam.vercel.app | perf:92 a11y:98 seo:97 |
| 3 | Noodle Bar | quality-failed | — | a11y:89 (3 retries exhausted) |
```

Before reporting the batch complete, run:
```bash
npx tsx packages/utils/repair-locale-routes.ts --check-only
```
If any generated site still fails locale refresh verification, repair it before giving the user final URLs.
