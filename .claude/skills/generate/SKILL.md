---
name: generate
description: End-to-end website generation for a business lead. Takes place_id + industry, prepares assets, designs with frontend-design skill, runs quality gates, and deploys.
allowed-tools: [Bash, Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion]
user-invocable: true
---

# Site Generation (5 Steps)

## Input
- `place_id` — Google Maps place ID
- `industry` — restaurant | beauty | clinic | retail | fitness | service | generic
- `business_name` — for slug generation
- Business data: name, address, phone, hours, photos, rating, reviews count

## Step 1: Prepare Assets

```bash
# Resolve slug
SLUG=$(npx tsx -e "const {slugify} = require('./packages/generate/industry-config'); console.log(slugify('{{business_name}}'))")
mkdir -p output/$SLUG/public/images

# Download Maps photos
npx tsx packages/assets/maps-photos.ts --photos '{{photos_json}}' --output output/$SLUG/public/images

# Extract brand colors (use maps-2 or best interior photo, NOT maps-1)
npx tsx packages/assets/extract-colors.ts --image output/$SLUG/public/images/maps-2.jpg --output output/$SLUG

# Optimize images → WebP variants + manifest
npx tsx packages/assets/optimize-images.ts --input output/$SLUG/public/images

# Optional: stock photos if <3 maps photos available
npx tsx packages/assets/stock-photos.ts --industry {{industry}} --output output/$SLUG/public/images
```

**Verify:** `brand-colors.json` at site root, `image-manifest.json` in `public/`, ≥3 images in `public/images/`

## Step 2: Set Up Scaffolding

```bash
# Copy template scaffolding
cp -r .claude/skills/duocode-design/templates/_shared/* output/$SLUG/
cp .claude/skills/duocode-design/templates/_shared/.gitignore output/$SLUG/
```

- Read `brand-colors.json` → inject into business.ts theme
- Read `.claude/skills/duocode-design/references/malaysia-market.md` for locale rules
- Set `schemaOrgType` from `SCHEMA_ORG_TYPE[industry]` in `packages/generate/industry-config.ts`

## Step 3: Design & Build (Creative Phase)

Read `.claude/skills/frontend-design/SKILL.md` (Anthropic official design skill) and apply its principles. Provide it with:
- Business name, industry, location, hours, contact info
- Brand colors from `brand-colors.json`
- Photos from `public/images/` (visually inspect to choose best hero — NEVER use maps-1)
- Industry context for content sections

**Claude generates ALL of:**
- `src/app/[locale]/page.tsx` — completely free layout, unique to this business
- All components in `src/components/`
- `src/data/business.ts` — 4 languages (en, ms, zh-CN, zh-TW)
- SVGs in `public/svgs/` as needed (no fixed quota)
- Any CSS customizations in `globals.css`

**NO fixed template. Design should be unique to this business.**

## Step 4: Quality Gates

**Gate 1 — Build:**
```bash
cd output/$SLUG && npm install && npm run build
```
Zero errors required. Max 3 fix-and-retry cycles.

**Gate 2 — Lighthouse:**
```bash
npx serve out -l 3456 &
sleep 2
npx lighthouse http://localhost:3456/en/ --output json --output-path lighthouse.json --chrome-flags="--headless"
kill %1
```
Thresholds: Performance ≥ 90, Accessibility = 100, SEO ≥ 95

**Gate 3 — Visual QA (browser-use CLI):**
```bash
npx serve out -l 3456 &
sleep 2
browser-use open http://localhost:3456/en/
browser-use screenshot screenshots/desktop.png
browser-use python "browser._run(browser._session._cdp_set_viewport(375, 812))"
browser-use screenshot screenshots/mobile.png
browser-use close
kill %1
```
Evaluate: professional quality? Matches business identity? Mobile layout clean?
If not satisfied, iterate (max 3 rounds).

## Step 5: Deploy

```bash
cd output/$SLUG
git init && git add -A && git commit -m "feat: generated site for {{business_name}}"
gh repo create DuoCode2/$SLUG --private --source=. --push
gh repo edit DuoCode2/$SLUG --homepage "https://$SLUG.vercel.app"
npx tsx ../../packages/deploy/deploy.ts --build-dir out --slug $SLUG
```

Log result:
```bash
echo '{"slug":"'$SLUG'","url":"https://'$SLUG'.vercel.app","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ../generation-log.jsonl
```
