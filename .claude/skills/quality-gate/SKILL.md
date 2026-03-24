---
name: quality-gate
description: Three-gate quality pipeline — build verification, Lighthouse audit, visual QA with browser-use screenshots.
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
```bash
npx serve out -l 3456 &
npx lighthouse http://localhost:3456/en/ --output json --output-path lighthouse.json --chrome-flags="--headless"
kill %1
```

| Metric | Threshold |
|--------|-----------|
| Performance | ≥ 90 |
| Accessibility | = 100 |
| Best Practices | ≥ 90 |
| SEO | ≥ 95 |

- **Fail:** Read lighthouse.json, fix the flagged issues, rebuild, re-audit (max 3)

## Gate 3: Visual QA
```bash
npx serve out -l 3456 &
browser-use open http://localhost:3456/en/
browser-use screenshot screenshots/desktop.png
browser-use eval "await page.setViewportSize({width: 375, height: 812})"
browser-use screenshot screenshots/mobile.png
kill %1
```

Evaluate screenshots with design judgment:
- Does it look professional and polished?
- Does the design match the business identity?
- Is mobile layout clean with no overflow?
- Are brand colors applied consistently?

If not satisfied, fix and iterate (max 3 rounds).
