---
name: toolchain
description: "Reference documentation for pipeline tools: browser-use CLI, Lighthouse CI, GitHub CLI, n8n workflows, favicon generation, SVG icon maker, Google Sheets automation, and Tailwind CSS. Loaded automatically when using these tools."
allowed-tools: Bash, Read
user-invocable: false
---

# Toolchain Reference

Consolidated documentation for all pipeline tools. Read the specific reference when working with that tool.

## Tool Index

| Tool | Reference | When to Read |
|------|-----------|-------------|
| browser-use CLI | `references/browser-use.md` | Visual QA screenshots, browser automation, GUI tasks |
| Lighthouse CI | `references/lighthouse-ci.md` | Gate 2 performance auditing, CI/CD integration |
| GitHub CLI | `references/github.md` | Repo creation, PRs, issues for DuoCode2 org |
| n8n | `references/n8n.md` | Webhook workflows, asset preparation, work logging |
| Favicon | `references/favicon-generator.md` | Generating favicon/app icons for sites |
| SVG Icon Maker | `references/svg-icon-maker.md` | Converting raster to SVG with VTracer |
| Google Sheets | `references/sheets-automation.md` | Lead tracking, work logging, data sync |
| Tailwind CSS | `references/tailwind-css.md` | Styling, utility classes, responsive patterns |

## Quick Decision Tree

- Taking screenshots or interacting with browser? → `references/browser-use.md`
- Running Lighthouse audits? → `references/lighthouse-ci.md`
- Pushing to GitHub or DuoCode2 org? → `references/github.md`
- Working with n8n webhooks or workflows? → `references/n8n.md`
- Making favicons or app icons? → `references/favicon-generator.md`
- Converting images to SVG? → `references/svg-icon-maker.md`
- Syncing data with Google Sheets? → `references/sheets-automation.md`
- Styling with Tailwind utilities? → `references/tailwind-css.md`
