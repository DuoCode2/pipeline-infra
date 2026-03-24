---
name: generate
description: "End-to-end website generation for a business lead. Takes a place_id + industry, runs 10 steps: prepare assets, load design skill, generate business.ts (4 languages) + SVGs, Gate 1 build, Gate 2 Lighthouse, Gate 3 visual QA. Use when user says 'generate site', 'build site', 'create prototype', or 'run lead'."
allowed-tools: Bash, Read, Write
disable-model-invocation: true
---

# Generate Business Website

Produce a deployable 4-language website from a lead's Google Maps data.

## Input
A lead with: place_id, name, industry, address, phone, hours, photos, rating, reviews

## Output
A deployable site in `output/{place_id}/` passing all 3 quality gates.

## Workflow

### Step 1: Trigger Asset Preparation
```bash
xh POST http://localhost:5678/webhook/prepare-assets \
  place_id:='"{{place_id}}"' industry:='"{{industry}}"' \
  photos:='{{photos_json}}' output_dir:='"output/{{place_id}}"'
```
Verify: `brand-colors.json` and `image-manifest.json` exist in output dir.

### Step 2: Load Design Context
**CRITICAL**: Before generating anything:
```
Read .claude/skills/duocode-design/SKILL.md
Read .claude/skills/duocode-design/references/{{industry}}.md
Read .claude/skills/duocode-design/schemas/{{industry}}.schema.json
```

### Step 3: Copy & Layer Templates
```bash
DESIGN=".claude/skills/duocode-design"
OUT="output/{{place_id}}"

# Base structure (config files at root level)
cp $DESIGN/templates/_shared/package.json $OUT/
cp $DESIGN/templates/_shared/next.config.js $OUT/
cp $DESIGN/templates/_shared/tailwind.config.ts $OUT/
cp $DESIGN/templates/_shared/tsconfig.json $OUT/
cp $DESIGN/templates/_shared/postcss.config.js $OUT/

# Source code
cp -r $DESIGN/templates/_shared/src/* $OUT/src/

# Industry-specific overrides (page.tsx + components)
if [ -d "$DESIGN/templates/{{industry}}" ]; then
  # Override page.tsx with industry version
  cp $DESIGN/templates/{{industry}}/page.tsx $OUT/src/app/[locale]/page.tsx 2>/dev/null || true
  # Merge industry components into components dir
  cp $DESIGN/templates/{{industry}}/components/*.tsx $OUT/src/components/ 2>/dev/null || true
fi
```

### Step 4: Study Examples
```
Read .claude/skills/duocode-design/examples/{{industry}}/*/business.ts
```

### Step 5: Generate business.ts
Create `output/{{place_id}}/src/data/business.ts` with ALL 4 languages (en, ms, zh-CN, zh-TW).
- Fill every field from schema
- Use brand-colors.json for theme
- Use image-manifest.json for photos
- Write compelling, non-generic copy per industry tone
- Bilingual content: menu item names in original language, descriptions in target language

### Step 6: Generate SVG Assets
Create `output/{{place_id}}/public/svgs/*.svg`:
- Section dividers (per industry SVG vocabulary from design reference)
- Category icons
- Decorative textures (optional)
- Rules: viewBox defined, max 20 paths, currentColor for mono icons
- Run: `npx svgo output/{{place_id}}/public/svgs/*.svg`

### Step 7: Gate 1 -- Build
```bash
cd output/{{place_id}} && npm install && npm run build
```
Fail -> read error -> fix business.ts -> retry (max 3)

### Step 8: Gate 2 -- Lighthouse
```bash
cd output/{{place_id}} && npx serve out -l 3456 &
sleep 3
npx lighthouse http://localhost:3456 --output json --output-path lighthouse.json --chrome-flags="--headless"
kill %1
```
Check: Performance >= 90, Accessibility = 100, SEO >= 95. Fail -> fix -> retry.

### Step 9: Visual QA (Gate 3)
```bash
cd output/{{place_id}}
npx serve out -l 3456 &
sleep 3

# Desktop screenshot
browser-use open http://localhost:3456/en/
sleep 2
browser-use screenshot screenshots/desktop.png

# Mobile screenshot (resize viewport first)
browser-use eval "await page.setViewportSize({width: 375, height: 812})"
browser-use screenshot screenshots/mobile.png

kill %1
```
I analyze both screenshots. Rubric (100 pts):
| Dimension | Pts |
|---|---|
| Hero Impact | 20 |
| Layout & Spacing | 20 |
| Typography | 15 |
| Color Cohesion | 15 |
| Image Quality | 10 |
| Mobile | 10 |
| Above-fold | 10 |

>= 75 -> PASS. < 75 -> fix -> rebuild -> re-screenshot. Max 3 rounds.

### Step 10: Log & Report
```bash
xh POST http://localhost:5678/webhook/log-work \
  place_id:='"{{place_id}}"' action:='"generated"' \
  details:='{"qa_score":{{score}},"rounds":{{rounds}}}'
```
Show user: score, grade, desktop + mobile screenshots.
