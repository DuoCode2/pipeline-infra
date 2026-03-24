---
name: batch
description: Process multiple business leads through the full pipeline in parallel where possible. Uses Claude Code Agent tool for concurrent asset preparation.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Batch Processing

## Quick Start (Recommended)
Use the orchestrate script for fully automated E2E pipeline:
```bash
npx tsx packages/batch/orchestrate.ts \
  --city "Kuala Lumpur" \
  --categories "restaurant,beauty" \
  --batch-size 2
```
This handles: discover → photos → colors → fonts → optimize → build → deploy → GitHub → log.
Falls back to the Agent-based workflow below when you need more control (e.g., custom design per site).

## Agent-Based Workflow

Process multiple leads through: discover → prepare → generate → quality gate → deploy.

### Input
- List of leads (from `/discover` or manual) with place_id, business_name, industry, photos

### Phase 1: Parallel Asset Preparation
Use the `Agent` tool to launch one agent per lead for concurrent asset preparation:

```
For each lead, launch an Agent:
  Agent(prompt="Prepare assets for {business_name}:
    npx tsx packages/assets/maps-photos.ts --photos '{photos}' --output output/{slug}/public/images
    npx tsx packages/assets/extract-colors.ts --image output/{slug}/public/images/maps-2.jpg --output output/{slug}
    npx tsx packages/assets/optimize-images.ts --input output/{slug}/public/images
  ", mode="bypassPermissions")
```

### Phase 2: Sequential Site Generation
Generate sites one at a time (each needs full Claude attention for `frontend-design`):
```
For each lead:
  1. Copy scaffolding
  2. Use frontend-design skill to create unique site
  3. Run Gate 1 (build) + Gate 2 (Lighthouse)
  4. Run Gate 3 (browser-use visual QA)
```

### Phase 3: Sequential Deployment
Deploy one at a time (avoid Vercel rate limits):
```
For each lead:
  git init && git add -A && git commit
  gh repo create DuoCode2/{slug} --private --source=. --push
  npx tsx packages/deploy/deploy.ts --build-dir out --slug {slug}
```

## Output
Append each result to `output/generation-log.jsonl`:
```json
{"slug":"xxx","url":"https://xxx.vercel.app","industry":"restaurant","qa_passed":true,"timestamp":"..."}
```

## Summary
Print final batch report: total processed, passed, failed, deployed URLs.
