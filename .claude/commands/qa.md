# Run quality gates on a generated site

Read and follow `.claude/skills/quality-gate/SKILL.md`.

If no site specified, use AskUserQuestion to ask which site to QA.

Run all 3 gates:
- Gate 1: `npm run build` (zero errors)
- Gate 2: Lighthouse audit (Perf>=90, A11y=100, SEO>=95)
- Gate 3: Visual QA via `browser-use` CLI (desktop + mobile screenshots)

Report all results. If any gate fails, fix the issues and retry (max 3 rounds).
