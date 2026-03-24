---
name: iterate-quality
description: "Analyze historical qa-report.json and work logs to identify patterns in Gate 3 failures, then improve design references and schemas. Follows observe-modify-evaluate-keep/revert loop."
allowed-tools: Bash, Read, Write, Edit
disable-model-invocation: true
---

# Iterate Quality

Continuous improvement of design outputs based on QA score analysis.

## Frozen (do NOT modify)
- Gate 1/2/3 evaluation criteria and thresholds
- Component code (templates/)
- Scoring dimensions and weights

## Editable (can modify)
- `references/*.md` (design guidelines)
- `schemas/*.schema.json` (data fields)
- `SKILL.md` design rules in duocode-design

## Metric
- `avg_qa_score` across last batch (weighted across 7 dimensions)
- Goal: continuous improvement, monotonically increasing

## Workflow

### Step 1: Observe
Read Google Sheets "WorkLog" sheet:
```bash
xh POST localhost:5678/webhook/lead-status summary:=true
```
Analyze:
- Which dimensions consistently score low? (Typography? Color? Mobile?)
- Which industries have more issues? (clinic worse than restaurant?)
- Trend of avg_qa_score over last N batches

### Step 2: Diagnose
Read the most recent 5 `qa-report.json` files:
- Extract specific deduction reasons from Gate 3
- Categorize: design guide not specific enough? Schema missing field? SVG style wrong?

### Step 3: Modify
Based on diagnosis, edit the corresponding reference file:
- Typography low -> edit `_foundations.md` font rules
- Industry Color low -> edit `{industry}.md` color strategy
- Mobile low -> edit responsive breakpoint rules

**IMPORTANT**: Change only ONE dimension per iteration for proper attribution.

### Step 4: Git Commit
```bash
git add references/
git commit -m "iterate: improve {dimension} rules based on batch {N} analysis"
```

### Step 5: Evaluate
Re-generate 3 historical leads (same input, new rules):
- Compare old vs new qa_score
- If improvement >= 3 points -> keep modification
- If no change or decline -> git revert

### Step 6: Log
```bash
xh POST localhost:5678/webhook/log-work \
  action:='"iterate"' \
  details:='{"dimension":"typography","old_avg":72,"new_avg":78,"kept":true}'
```

### Step 7: Loop
Return to Step 1, next dimension.
**Never pause** -- automatically trigger one iteration round after each batch completes.
