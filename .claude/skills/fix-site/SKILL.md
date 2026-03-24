---
name: fix-site
description: "Fix visual quality issues on a deployed site. Takes screenshots, identifies problems, fixes code, rebuilds, and redeploys. Use when user says 'fix site', 'fix visual issues', or 'the site looks wrong'."
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep]
user-invocable: true
---

# Fix Visual Quality Issues

## Input
- `slug` — site directory name in `output/`
- If not provided, use AskUserQuestion to ask which site to fix.

## Process

### 1. Load Context
```bash
# Read market rules for locale formatting
cat .claude/skills/duocode-design/references/malaysia-market.md

# Read current site data
cat output/$SLUG/src/data/business.ts
cat output/$SLUG/brand-colors.json
```

### 2. Take Screenshots
```bash
cd output/$SLUG
npx serve out -l 3456 &
sleep 2

# Desktop
browser-use open http://localhost:3456/en/
browser-use screenshot screenshots/desktop.png

# Mobile
browser-use python "browser._run(browser._session._cdp_set_viewport(375, 812))"
browser-use screenshot screenshots/mobile.png

browser-use close
kill %1
```

### 3. Evaluate & Fix
Read the screenshot files. For each issue found:
1. Identify the problem (layout, colors, contrast, responsiveness, missing content)
2. Locate the source file (page.tsx, component, globals.css, business.ts)
3. Fix the code
4. Continue to next issue

### 4. Rebuild & Verify
```bash
cd output/$SLUG && npm run build
```
Run `/qa` to verify all 3 gates pass.

### 5. Redeploy
```bash
cd output/$SLUG
git add -A && git commit -m "fix: visual quality improvements"
git push
npx tsx ../../packages/deploy/deploy.ts --build-dir out --slug $SLUG
```

Report the live URL when done.
