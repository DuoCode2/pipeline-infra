# DuoCode Pipeline

**Automated business website generation pipeline** — discovers businesses without websites via Google Maps, generates multilingual Next.js landing pages with industry-specific design, and deploys to Vercel with shared quality gates.

Primary agentic workflow in Claude Code:

```
/batch "Kuala Lumpur 3 restaurants"
```

CLI fallback for smoke testing without Claude-driven design:

```bash
npm run batch:fallback -- --city "Kuala Lumpur" --categories "restaurant,beauty" --batch-size 3
```

---

## System Architecture

<picture>
  <img src="docs/architecture-overview.svg" alt="DuoCode Pipeline Architecture — 4-phase system from Discovery to Deploy, orchestrated by Claude Code">
</picture>

The pipeline is orchestrated by Claude Code as a central brain. Every phase — discovery, classification, generation, deployment — is driven programmatically through TypeScript modules under `packages/`.

### How It Works

1. **Discover** — Search Google Maps Places API for businesses without websites in a target city
2. **Classify** — Map the business's Google `primaryType` to one of 7 industry categories
3. **Generate** — Download photos, extract brand colors, scaffold from shared template, design unique pages using the `frontend-design` skill, build with Next.js, run quality gates
4. **Deploy** — Push to GitHub (DuoCode2 org) and deploy via Vercel REST API

Each generated site ships with:
- 4 language versions (English, Malay, Simplified Chinese, Traditional Chinese)
- Brand colors extracted from the business's own photos
- Responsive images in 4 WebP sizes (320/640/960/1280)
- Unique design per business (driven by `frontend-design` skill, not fixed templates)
- Strict accessibility threshold (Lighthouse a11y ≥ 95)

---

## Data Flow

<picture>
  <img src="docs/data-flow.svg" alt="Data flow from CLI arguments through Google Maps API, asset pipeline, template system, quality gates, to live Vercel deployment">
</picture>

---

## Project Structure

```
infra/src/
├── packages/                        # Core TypeScript pipeline modules
│   ├── pipeline/
│   │   ├── prepare.ts               # One-command pre-design: photos → colors → fonts → scaffold
│   │   └── finalize.ts              # One-command post-design: build → lighthouse → deploy
│   ├── discover/search.ts           # Google Maps Places API integration
│   ├── assets/
│   │   ├── maps-photos.ts           # Download business photos from Maps
│   │   ├── stock-photos.ts          # Unsplash fallback photos
│   │   ├── extract-colors.ts        # node-vibrant → 9 WCAG-safe brand colors
│   │   ├── download-fonts.ts        # Self-host Google Fonts as .woff2
│   │   └── optimize-images.ts       # Sharp → 4 WebP responsive sizes
│   ├── generate/industry-config.ts  # Industry classification + design config
│   ├── quality/
│   │   ├── serve-and-check.ts       # Local Lighthouse with auto port management
│   │   └── lighthouse-check.ts      # Remote Lighthouse audit
│   ├── batch/orchestrate.ts         # CLI fallback reusing prepare + finalize
│   ├── deploy/deploy.ts             # Vercel REST API v13 deployment
│   └── utils/env.ts                 # requireEnv() helper
│
├── .claude/skills/                  # 6 Claude Code skills
│   ├── generate/SKILL.md           #   /generate — prepare → design → finalize
│   ├── batch/SKILL.md              #   /batch — parallel prepare → design → parallel finalize
│   ├── fix-site/SKILL.md           #   /fix-site — screenshot → fix → redeploy
│   ├── duocode-design/             #   Auto-load: design system + references
│   │   ├── SKILL.md                #     Malaysia market rules + scaffolding
│   │   ├── references/             #     market, a11y, browser-use, lighthouse
│   │   └── templates/              #     Next.js shared template scaffolding
│   ├── frontend-design/SKILL.md    #   Auto-load: Anthropic design skill
│   └── skill-creator/SKILL.md      #   Skill creation and testing
│
├── n8n/                             # Background automation (Docker)
│   ├── docker-compose.yml           # n8n service config
│   ├── Dockerfile                   # Custom n8n with npm packages
│   ├── init-workflows.sh            # Auto-import on container start
│   ├── backup-workflows.sh          # Export workflows from running n8n
│   └── workflows/                   # 4 active + 1 reference
│
├── output/                          # Generated sites (one per slug)
│   └── {slug}/
│       ├── src/data/business.ts     #   Generated: 4-language content
│       ├── public/images/           #   Optimized WebP photos
│       ├── public/svgs/             #   Industry SVG decorations
│       └── out/                     #   Next.js static export → deploy
│
├── tests/                           # Test suite
│   ├── run-all.sh                   #   7-group comprehensive test (300+ checks)
│   └── *.test.ts                    #   API, env, discover, assets, deploy tests
│
├── eval/                            # Evaluation scripts
│   ├── validate-skills.sh           #   Skill structure & frontmatter
│   ├── validate-templates.sh        #   Template completeness
│   └── quality-metrics.sh           #   Lighthouse config validation
│
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript strict, ES2020
├── .lighthouserc.json               # Quality thresholds (single source of truth)
└── .env.template                    # Required API keys
```

---

## Package Dependency Graph

<picture>
  <img src="docs/package-dependency.svg" alt="Package dependency graph showing batch/orchestrate.ts as the central hub importing all other modules">
</picture>

### Module Details

| Module | Lines | Purpose | Key Export |
|--------|------:|---------|------------|
| `pipeline/prepare.ts` | 240 | One-command pre-design pipeline | `prepare(lead, industry)` → `PrepareResult` |
| `pipeline/finalize.ts` | 360 | One-command post-design pipeline | `finalize({dir, slug, dryRun})` → `FinalizeResult` |
| `discover/search.ts` | 206 | Google Maps Places API (New) search | `searchPlaces(category, city)` → `PlaceResult[]` |
| `generate/industry-config.ts` | 146 | Industry classification + design specs | `classifyIndustry()`, `INDUSTRY_CONFIG`, `slugify()` |
| `assets/extract-colors.ts` | 170 | Brand color extraction + WCAG enforcement | `extractAndSave(img, dir)` → `BrandColors` (9 tokens) |
| `assets/download-fonts.ts` | 200 | Self-host Google Fonts as .woff2 | `downloadFonts(fonts, weights, dir)` |
| `assets/stock-photos.ts` | 106 | Unsplash stock photo fallback | `downloadStockPhotos(industry, dir)` |
| `assets/optimize-images.ts` | 88 | Sharp WebP conversion at 4 breakpoints | `optimizeImages(dir)` → `ImageManifest` |
| `assets/maps-photos.ts` | 71 | Google Places photo download | `downloadMapsPhotos(names, dir)` |
| `quality/serve-and-check.ts` | 200 | Local Lighthouse with auto port mgmt | `runLocalQualityGate(options)` |
| `deploy/deploy.ts` | 113 | Vercel REST API v13 deployment | `deployToVercel(buildDir, slug)` → `DeployResult` |
| `batch/orchestrate.ts` | 600 | CLI fallback built on prepare + finalize | CLI only |
| `utils/env.ts` | 14 | Environment variable validation | `requireEnv(key)` |

### Key TypeScript Interfaces

```typescript
// PlaceResult — from Google Maps Places API
interface PlaceResult {
  id: string;
  displayName: { text: string; languageCode: string };
  primaryType?: string;          // e.g., "restaurant", "beauty_salon"
  formattedAddress: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;           // null → target lead
  rating?: number;
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  googleMapsUri?: string;
}

// BrandColors — extracted from business photos, WCAG-safe
interface BrandColors {
  primary: string;        // Vibrant swatch (≥3:1 on surface)
  primaryDark: string;    // DarkVibrant
  accent: string;         // LightVibrant (≥3:1 on surface)
  surface: string;        // LightMuted
  textTitle: string;      // DarkMuted (≥4.5:1 on surface)
  textBody: string;       // Muted (≥4.5:1 on surface)
  onPrimary: string;      // Text on primary bg (≥4.5:1)
  onPrimaryDark: string;  // Text on primaryDark bg (≥4.5:1)
  accentText: string;     // Accent for text on surface (≥4.5:1)
}

// IndustryDesign — per-industry visual specs
interface IndustryDesign {
  fontDisplay: string;    // e.g., "Playfair Display"
  fontBody: string;       // e.g., "Source Serif Pro"
  svgStyle: 'organic' | 'elegant' | 'geometric' | 'modern';
  colorWarmth: 'warm' | 'soft' | 'cool' | 'vibrant' | 'bold' | 'neutral' | 'from-photo';
  heroStyle: 'full-bleed' | 'split' | 'overlay';
  ctaStyle: 'rounded' | 'pill' | 'square';
}
```

---

## Skill Architecture

<picture>
  <img src="docs/skill-system.svg" alt="Skill architecture — 6 skills: 3 pipeline + 2 auto-load + 1 utility">
</picture>

6 Claude Code skills under `.claude/skills/`:

**Pipeline Skills** (user-invoked via `/slash-commands`):
`/generate` (prepare → design → finalize), `/batch` (parallel version), `/fix-site` (post-deploy fixes)

**Reference Skills** (Claude auto-loads when relevant):
`duocode-design` (Malaysia market + a11y + browser-use + lighthouse), `frontend-design` (Anthropic design skill)

**Utility Skill**: `/skill-creator`

### Pipeline Architecture

```
User: "吉隆坡3个餐厅"
  ↓
search.ts → 3 leads
  ↓
prepare.ts × 3 (parallel)  →  Claude designs × 3  →  finalize.ts × 3 (parallel)
  (mechanical)                   (creative)              (mechanical)
  ↓                                                      ↓
  photos, colors, fonts,                                 build, lighthouse,
  scaffold, business.ts                                  deploy, git push
```

Design is driven by the `frontend-design` skill. Each site gets a unique layout — no fixed templates.

---

## Quality Gates

Every generated site must pass 2 required gates before deployment. Screenshot capture is also attempted during local QA to support visual review.

| Gate | Tool | Thresholds | Config |
|------|------|------------|--------|
| **Gate 1** | `npm run build` | Zero TypeScript/build errors | `tsconfig.json` |
| **Gate 2** | Lighthouse (local serve) | Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, LCP ≤ 2500ms, CLS ≤ 0.1 | `.lighthouserc.json` → `shared.ts` |
| **Support** | `browser-use` screenshots | Desktop + mobile captures when the tool is available; non-fatal if unavailable | `packages/quality/serve-and-check.ts` |

---

## External Services

| Service | Purpose | Auth | Used By |
|---------|---------|------|---------|
| Google Maps Places API (New) | Business discovery + photo download | `GOOGLE_API_KEY` | `discover/search.ts`, `assets/maps-photos.ts` |
| Google Sheets | Lead storage + work logging | n8n OAuth2 | n8n workflows |
| Gemini 2.5 Flash | Industry classification (via n8n) | `GOOGLE_API_KEY` | n8n `classify-industry.json` |
| Unsplash | Stock photo fallback | `UNSPLASH_ACCESS_KEY` | `assets/stock-photos.ts` |
| Vercel | Static hosting + CDN | `VERCEL_TOKEN` | `deploy/deploy.ts` |
| GitHub | Source code storage (DuoCode2 org) | `gh` CLI auth | `pipeline/finalize.ts`, `deploy/publish.ts` |
| n8n | Workflow orchestration | Basic Auth | Docker (port 5678) |

### n8n Workflows (background automation only — not in generation path)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `log-work.json` | Webhook `POST /webhook/log-work` | Log deployment results to Google Sheets |
| `lead-status.json` | Webhook `POST /webhook/lead-status` | Query lead status from Sheets |
| `sheets-init.json` | Webhook `POST /webhook/sheets-init` | Initialize spreadsheet headers |
| `sheets-rebuild.json` | Webhook `POST /webhook/sheets-rebuild` | Clear and rebuild spreadsheet |

---

## Commands

### Pipeline (3 commands)

```bash
# 1. Discover leads
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1

# 2. Prepare (all mechanical work before design)
npx tsx packages/pipeline/prepare.ts --lead '{"id":"...","displayName":{"text":"..."},...}' --industry restaurant

# 3. Finalize (build + quality + deploy after design)
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ [--dry-run]

# CLI fallback (no Claude design, shared pipeline + generated fallback page)
npx tsx packages/batch/orchestrate.ts --city "Kuala Lumpur" --categories "restaurant,beauty" --batch-size 2
```

### Testing

```bash
npm test                  # API keys + env + discover + deploy contract
npm run test:all          # Full 7-group suite (300+ checks)
npm run test:keys         # Validate API key connectivity
npm run test:deploy       # Vercel deployment test
npm run build:check       # TypeScript compile check
```

### Evaluation

```bash
npm run eval:skills       # Skill structure validation (frontmatter, references)
npm run eval:templates    # Template completeness (components, industry coverage)
npm run eval:quality      # Quality metrics (Lighthouse config, thresholds)
npm run eval:all          # All evals + JSON report
```

### n8n (Docker)

```bash
cd n8n && docker compose up -d       # Start workflow engine
docker compose logs -f n8n           # Watch logs
curl http://localhost:5678/healthz   # Health check
```

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | — | TypeScript execution |
| **Language** | TypeScript | 5.9 | Strict mode, ES2020 target |
| **Framework** | Next.js | 14.2 | Static site generation |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Image Processing** | Sharp | 0.34 | WebP conversion, responsive sizes |
| **Color Extraction** | node-vibrant | 4.0 | Palette extraction from photos |
| **SVG Optimization** | SVGO | 4.0 | SVG minification |
| **Quality** | Lighthouse | 13.0 | Performance/a11y/SEO auditing |
| **Workflows** | n8n | 1.76 | Docker-based workflow orchestration |
| **Hosting** | Vercel | — | Static CDN + serverless |
| **Source Control** | GitHub | — | DuoCode2 org, `gh` CLI |
| **Orchestration** | Claude Code | — | Central pipeline brain |

---

## Environment Setup

```bash
# 1. Clone and install
git clone <repo-url> && cd infra/src
npm install

# 2. Configure environment
cp .env.template .env
# Fill in: GOOGLE_API_KEY, UNSPLASH_ACCESS_KEY, VERCEL_TOKEN, etc.

# 3. Verify setup
npm test

# 4. Start n8n (optional, for webhook-based workflows)
cd n8n && docker compose up -d

# 5. Run pipeline
npm run batch:fallback -- --city "Kuala Lumpur" --categories "restaurant" --batch-size 1
```

### Required API Keys

| Key | Provider | Required APIs |
|-----|----------|--------------|
| `GOOGLE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Places API (New) + Generative Language API |
| `UNSPLASH_ACCESS_KEY` | [Unsplash Developers](https://unsplash.com/oauth/applications) | Image search |
| `VERCEL_TOKEN` | [Vercel Account](https://vercel.com/account/tokens) | Full Access scope |

---

## Generated Site Structure

Each site produced by the pipeline:

```
output/{slug}/
├── src/
│   ├── app/[locale]/page.tsx        # Unique page layout per business
│   ├── components/                  # Claude generates unique per business
│   │   └── *.tsx                    #   No fixed set — varies by industry
│   ├── data/business.ts             # All business content (4 languages)
│   └── styles/globals.css           # CSS variables from brand colors
├── public/
│   ├── images/*-{320,640,960,1280}.webp
│   └── svgs/*.svg                   # Industry decorations
├── brand-colors.json                # Extracted color palette
├── package.json                     # Next.js 14 + React 18 + Tailwind 3
└── out/                             # Static build → deployed to Vercel
```

---

## License

AGPL-3.0 for DuoCode-authored code. Third-party skills retain their original licenses.
