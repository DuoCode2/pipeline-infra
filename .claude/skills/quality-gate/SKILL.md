---
name: quality-gate
description: "Three-gate quality pipeline — build verification, Lighthouse audit (Perf≥90, A11y=100, SEO≥95), visual QA with browser-use screenshots. Use when user says 'qa', 'quality check', 'run gates', or 'check the site'."
allowed-tools: [Bash, Read, Glob, Grep]
user-invocable: true
---

# Quality Gates

Run on a generated site before deployment. All 3 gates must pass.

## Gate 1: Build Verification
```bash
cd output/{slug}
npm install && npm run build
```
- **Pass:** Zero errors, `out/` directory created
- **Fail:** Fix TypeScript/JSX errors, retry (max 3)

## Gate 2: Lighthouse Audit

### Option A: Local build (recommended for iteration)
```bash
npx tsx packages/quality/serve-and-check.ts --dir output/{slug}/out --output output/{slug}
```
Auto-finds free port, runs Lighthouse, kills server. No manual port management needed.

### Option B: Live URL (post-deploy verification)
```bash
npx tsx packages/quality/lighthouse-check.ts --url https://{slug}.vercel.app/en --output output/{slug}
```

| Metric | Threshold |
|--------|-----------|
| Performance | ≥ 90 |
| Accessibility | = 100 |
| Best Practices | ≥ 90 |
| SEO | ≥ 95 |

- **Fail:** Read lighthouse.json, fix the flagged issues, rebuild, re-audit (max 3)

## Gate 3: Visual QA (browser-use CLI)

### Screenshots
```bash
npx serve out -l 3456 &
sleep 2

# Desktop screenshot
browser-use open http://localhost:3456/en/
browser-use screenshot screenshots/desktop.png

# Mobile screenshot (375x812 via CDP viewport)
browser-use python "browser._run(browser._session._cdp_set_viewport(375, 812))"
browser-use screenshot screenshots/mobile.png

browser-use close
kill %1
```

**IMPORTANT:** All screenshot file paths MUST be absolute (e.g., `/Users/.../output/{slug}/screenshots/desktop.png`). Relative paths will fail with "No such file or directory".

**Claude reviews the screenshots** — not the user. Read the screenshot files, evaluate them against the checklist, and either pass or fix issues autonomously.

### Evaluation Checklist
Visually inspect both screenshots. Score each dimension:

| Dimension | Weight | Check |
|-----------|--------|-------|
| Hero Impact | 20% | Full viewport, compelling CTA, brand colors |
| Layout & Spacing | 15% | Balanced sections, no overflow, consistent rhythm |
| Typography | 15% | Clear hierarchy, readable, max 2 font families |
| Color Harmony | 15% | Brand-consistent, WCAG contrast passing |
| Image Quality | 10% | Sharp, properly sized, no broken images |
| Mobile Responsive | 15% | No horizontal scroll, touch targets ≥ 44px |
| Above-fold Content | 10% | Key info visible without scrolling |

**Pass:** Overall professional quality. No broken layouts, no unreadable text, no missing content.
**Fail:** Fix issues → rebuild → re-screenshot (max 3 rounds).
