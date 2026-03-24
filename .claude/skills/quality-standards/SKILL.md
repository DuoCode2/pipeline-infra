---
name: quality-standards
description: "Web quality reference covering accessibility (WCAG 2.2), performance optimization, Core Web Vitals, SEO, structured data, visual testing, and best practices. Loaded automatically when working on quality issues."
allowed-tools: Bash, Read
user-invocable: false
---

# Quality Standards Reference

Consolidated web quality documentation. Read specific references based on the quality dimension you're working on.

## Reference Index

| Dimension | Reference | Key Targets |
|-----------|-----------|-------------|
| Accessibility | `references/accessibility.md` | WCAG 2.2 AA, Lighthouse a11y = 100 |
| Core Web Vitals | `references/core-web-vitals.md` | LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 |
| Performance | `references/performance.md` | Lighthouse perf >= 90, page weight < 1.5MB |
| SEO | `references/seo.md` | Lighthouse SEO >= 95, technical SEO |
| SEO Images | `references/seo-images.md` | Alt text, lazy loading, responsive images |
| Schema Markup | `references/schema-markup.md` | JSON-LD, rich results, LocalBusiness |
| Best Practices | `references/best-practices.md` | Security, compatibility, code quality |
| Visual Testing | `references/visual-testing.md` | Pixel comparison, responsive validation, AI-powered diff |
| UI Validation | `references/ui-visual-validator.md` | Design system compliance, a11y verification |
| Web Quality Audit | `references/web-quality-audit.md` | Comprehensive Lighthouse-based audit |
| Webapp Testing | `references/webapp-testing.md` | Playwright-based functional testing |

## DuoCode Quality Thresholds

| Metric | Target | Gate |
|--------|--------|------|
| Build | Zero errors | Gate 1 |
| Performance | >= 90 | Gate 2 |
| Accessibility | = 100 | Gate 2 |
| Best Practices | >= 90 | Gate 2 |
| SEO | >= 95 | Gate 2 |
| Visual QA Score | >= 75/100 | Gate 3 |

## Deep References

Sub-references available for specific topics:
- `references/a11y-patterns.md` — ARIA patterns, skip links, focus management
- `references/wcag.md` — WCAG success criteria reference
- `references/lcp.md` — Deep LCP optimization techniques
- `references/schema-decision-tree.md` — Which schema type to use
- `references/schema-templates.md` — Ready-to-use JSON-LD templates
- `references/validation-guide.md` — Schema validation procedures
