---
name: batch
description: Process multiple business leads through the full pipeline in parallel where possible. Uses Claude Code Agent tool for concurrent asset preparation.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Batch Processing

Process multiple leads through: discover → prepare → generate → quality gate → deploy.

## Input
- List of leads (from `/discover` or manual) with place_id, business_name, industry, photos

## Workflow

### Phase 1: Parallel Asset Preparation
Launch one Agent per lead for asset preparation (all run concurrently):
```
Agent per lead:
  npx tsx packages/assets/maps-photos.ts ...
  npx tsx packages/assets/extract-colors.ts ...
  npx tsx packages/assets/optimize-images.ts ...
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
