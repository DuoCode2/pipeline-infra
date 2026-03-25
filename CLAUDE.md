# DuoCode Pipeline

Claude Code drives the full pipeline. Use `frontend-design` skill for all design work.

## Rules
- Use **AskUserQuestion tool** for user input — never plain text questions
- Pipeline runs **end-to-end without pausing** — only stop if a gate fails after max retries
- **ONLY generate sites for businesses WITHOUT a website** — discover defaults to no-website filter
- All sites need **4 languages**: en, ms, zh-CN, zh-TW
- Malaysia market rules: see `.claude/skills/duocode-design/references/malaysia-market.md`
- A11y rules: see `.claude/skills/duocode-design/references/a11y-checklist.md`

## RULE: Self-iterate to deliver
When running /generate or /batch, Claude must:
- Make ALL design decisions autonomously (fonts, layout, colors, copy)
- Fix quality gate failures without asking
- Deploy to Vercel and report the live URL
- NEVER stop to ask "should I continue?" or "does this look good?"
- Only stop if: (a) missing required input (use AskUserQuestion), (b) gate fails after 3 retries

## Pipeline: /generate (3 steps)
1. **Prepare** — `npx tsx packages/pipeline/prepare.ts --lead '...' --industry X` → all mechanical work
2. **Design** — Claude creates unique components + 4-language content (the ONLY creative step)
3. **Finalize** — `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` → build + quality + deploy

## Pipeline Commands
| Command | When |
|---------|------|
| `npx tsx packages/discover/search.ts --city X --category Y --limit N` | Find leads |
| `npx tsx packages/pipeline/prepare.ts --lead '...' --industry X` | Before design (all asset prep + scaffold) |
| `npx tsx packages/pipeline/finalize.ts --dir output/{slug}/` | After design (build + quality + deploy) |

## Dev Commands
```bash
npm test                 # API keys + env + discover
npm run test:all         # Full test suite
npm run build:check      # TypeScript compile check
```

## CLI Fallback (no Claude design, generated fallback page)
```bash
npx tsx packages/batch/orchestrate.ts --city X --categories "a,b" --batch-size N
```

## Skills
| Skill | Type | Purpose |
|-------|------|---------|
| `/generate` | invoke | prepare → design → finalize (one site) |
| `/batch` | invoke | parallel prepare → sequential design → parallel finalize |
| `/fix-site` | invoke | Fix visual issues → rebuild → redeploy |
| `frontend-design` | auto | Anthropic design skill — typography, color, layout, motion |
| `duocode-design` | auto | Malaysia market rules + A11y checklist + template structure |
