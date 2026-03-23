---
name: batch-orchestrator
description: "Parallel batch processing of multiple leads through the full pipeline: prepare-assets, generate site, quality gate, deploy. Use when user says 'batch', 'process all leads', 'run batch', or wants to generate sites for multiple businesses at once."
license: AGPL-3.0
allowed-tools: "Bash Read Write"
metadata:
  author: duocode
  version: "1.0"
---

# Batch Orchestrator

Coordinates parallel site generation and sequential deployment for a batch of classified leads.

## Input

- `leads.json` — Array of classified leads from Google Sheets / n8n

## Workflow

### Step 1: Load and Validate Leads
<!-- TODO: Read leads.json, validate required fields -->

### Step 2: Parallel Asset Preparation
<!-- TODO: Run prepare-assets for each lead in parallel (max 5 concurrent) -->

### Step 3: Parallel Site Generation
<!-- TODO: Run generate skill for each lead in parallel -->

### Step 4: Sequential Quality Gate
<!-- TODO: Run quality-gate for each generated site -->

### Step 5: Sequential Deployment
<!-- TODO: Deploy passing sites via deploy-to-vercel (sequential to avoid rate limits) -->

### Step 6: Generate Batch Report
<!-- TODO: Summary of pass/fail/deployed counts + URLs -->

## Output

| File | Description |
|------|-------------|
| `batch-report.json` | Summary with per-lead status and URLs |
| `output/{place_id}/` | Individual site outputs |

## Pipeline Skills Referenced

- `prepare-assets` — Asset preparation
- `generate` — Site generation
- `quality-gate` — Quality verification
- `deploy-to-vercel` — Vercel deployment
