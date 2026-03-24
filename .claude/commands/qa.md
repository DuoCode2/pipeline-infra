# Run quality gates on a generated site

Read and follow:

1. `Read .claude/skills/quality-gate/SKILL.md`

If no place_id given, use AskUserQuestion to ask which site to QA.

Run all 3 gates:
- Gate 1: `npm run build` (zero errors)
- Gate 2: Lighthouse on production URL via `npx tsx packages/quality/lighthouse-check.ts`
- Gate 3: Visual QA via `browser-use` CLI (desktop + mobile screenshots, score rubric)

Report all scores and pass/fail. If any gate fails, read `.claude/skills/iterate-quality/SKILL.md` and follow its fix-and-retry loop.
