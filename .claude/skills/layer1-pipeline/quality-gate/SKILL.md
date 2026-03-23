---
name: quality-gate
description: "Run the 3-gate quality pipeline on generated sites: Gate 1 (build verification), Gate 2 (Lighthouse CI audit), Gate 3 (visual QA with screenshots). Use when verifying a site before deployment, or when user says 'run QA', 'check quality', 'quality gate'."
license: AGPL-3.0
allowed-tools: "Bash Read Write"
metadata:
  author: duocode
  version: "1.0"
---

# Quality Gate

Three-stage quality pipeline ensuring every generated site meets production standards before deployment.

## Thresholds

| Metric | Target | Gate |
|--------|--------|------|
| Build | Zero errors | Gate 1 |
| Performance | >= 90 | Gate 2 |
| Accessibility | = 100 | Gate 2 |
| Best Practices | >= 90 | Gate 2 |
| SEO | >= 95 | Gate 2 |
| Visual QA Score | >= 75/100 | Gate 3 |

## Gate 1: Build Verification

```bash
cd output/{place_id}
npm install && npm run build
```

- If build fails: attempt auto-fix (max 3 retries)
- Output: `out/` directory (Next.js static export)

## Gate 2: Lighthouse CI Audit

<!-- TODO: Configure .lighthouserc.json -->
<!-- TODO: Run npx @lhci/cli autorun -->
<!-- TODO: Parse JSON report, check thresholds -->

Refer to detailed guidance in `quality/` skills:
- `quality/core-web-vitals/SKILL.md` — LCP, INP, CLS optimization
- `quality/performance/SKILL.md` — Performance budget and optimization
- `quality/accessibility/SKILL.md` — WCAG 2.2 compliance
- `quality/seo/SKILL.md` — SEO best practices

## Gate 3: Visual QA

<!-- TODO: Desktop + mobile screenshots via Playwright -->
<!-- TODO: 100-point rubric scoring -->

### Scoring Rubric (100 points)

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Hero Impact | 20 | Full-viewport, compelling CTA, brand colors |
| Layout & Spacing | 15 | 8px grid, consistent rhythm, no overlap |
| Typography | 15 | Hierarchy clear, max 2 fonts, readable |
| Color Harmony | 15 | Brand-consistent, WCAG contrast passing |
| Image Quality | 10 | Sharp, properly sized, lazy-loaded |
| Mobile Responsiveness | 15 | No horizontal scroll, touch targets 44px+ |
| Above-fold Content | 10 | Key info visible without scroll |

## Output

| File | Description |
|------|-------------|
| `qa-report.json` | Score breakdown, pass/fail, issues |
| `screenshots/desktop.png` | Full-page desktop screenshot |
| `screenshots/mobile.png` | Full-page mobile screenshot |
