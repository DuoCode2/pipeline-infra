---
description: TypeScript code conventions for the DuoCode pipeline
paths:
  - "packages/**/*.ts"
  - "tests/**/*.ts"
---

# Code Conventions

- TypeScript strict — no `any`, use `requireEnv()` from `packages/utils/env.ts`
- Never include `claude` in branch names
- Gate 3 visual QA: use `browser-use` CLI, NOT Playwright MCP
- `maps-1` is always exterior — never use as hero image
