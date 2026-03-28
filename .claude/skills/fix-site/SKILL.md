---
name: fix-site
description: "Fix visual quality issues on a deployed or built site. Takes screenshots, identifies problems, fixes code, rebuilds, and redeploys. Use when user says 'fix site', 'fix visual issues', 'the site looks wrong', 'improve the design', 'site is broken', 'fix layout', or reports any visual/a11y problem with a generated site."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion]
user-invocable: true
---

# Fix Visual Quality Issues

## Input
- `slug` — site directory name in `output/`
- If not provided, use **AskUserQuestion** to ask which site to fix.
- If the user mentions a business name but not the slug, search `output/` for matching directories.

## Process

### 1. Load Context
```bash
# Read site data and region info
cat output/$SLUG/lead.json          # regionId, industry hints, photoSource
cat output/$SLUG/src/data/business.ts
cat output/$SLUG/brand-colors.json
```

If `lead.json` has a `regionId`, check for region-specific market rules:
```bash
# Read region rules if available (e.g., my.md for Malaysia, generic-market.md as fallback)
cat .claude/skills/duocode-design/references/${REGION_ID}-market.md 2>/dev/null || \
cat .claude/skills/duocode-design/references/generic-market.md
```

Also read the a11y checklist to verify fixes don't introduce new violations:
```bash
cat .claude/skills/duocode-design/references/a11y-checklist.md
```

### 2. Take Screenshots

Use browser-use CLI to capture current state:
```bash
cd output/$SLUG
npm run dev &
DEV_PID=$!
sleep 3

# Desktop and mobile screenshots
browser-use screenshot "http://localhost:3000/en/" --output screenshots/before-desktop.png --width 1440 --height 900
browser-use screenshot "http://localhost:3000/en/" --output screenshots/before-mobile.png --width 375 --height 812

kill $DEV_PID
```

Read the screenshot files to identify issues.

### 3. Evaluate & Fix
For each issue found:
1. Identify the problem (layout, colors, contrast, responsiveness, missing content)
2. Locate the source file (page.tsx, component, globals.css, business.ts)
3. Fix the code using theme tokens — NEVER hardcode colors or use opacity on text
4. Import shared UI components from `@/components/ui` if applicable (Button, Section, Card, etc.)

### 4. Rebuild & Verify & Redeploy
```bash
npx tsx packages/pipeline/finalize.ts --dir output/$SLUG/
```
This builds, runs Lighthouse, deploys, and pushes to git in one command.
Finalize now includes deployed locale-route verification. Do not report success unless the returned URL survives refresh on every configured locale.
If quality-failed: fix the issues from the structured failure output, then re-run finalize (max 3 retries).

Report the live URL when done.
