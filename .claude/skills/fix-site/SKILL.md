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
# Start local server with auto port management
npx tsx ../../packages/quality/serve-and-check.ts --dir output/$SLUG/out --screenshots output/$SLUG/screenshots
```
Or manually with browser-use (use ABSOLUTE paths for screenshots):
```bash
cd output/$SLUG
npx serve out -l 0 &   # auto port
SERVE_PID=$!
sleep 2

browser-use open http://localhost:PORT/en/
browser-use screenshot /absolute/path/to/output/$SLUG/screenshots/desktop.png

browser-use python "browser._run(browser._session._cdp_set_viewport(375, 812))"
browser-use screenshot /absolute/path/to/output/$SLUG/screenshots/mobile.png

browser-use close
kill $SERVE_PID
```

### 3. Evaluate & Fix
Read the screenshot files. For each issue found:
1. Identify the problem (layout, colors, contrast, responsiveness, missing content)
2. Locate the source file (page.tsx, component, globals.css, business.ts)
3. Fix the code
4. Continue to next issue

### 4. Rebuild & Verify & Redeploy
```bash
npx tsx ../../packages/pipeline/finalize.ts --dir output/$SLUG/
```
This builds, runs Lighthouse, deploys, and pushes to git in one command.
If quality-failed: fix the issues from the structured failure output, then re-run finalize.

Report the live URL when done.
