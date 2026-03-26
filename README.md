# DuoCode Pipeline

**Automated business website generation pipeline** -- discovers businesses without websites via Google Maps, generates multilingual Next.js landing pages with Claude-driven design, and deploys to Vercel with shared quality gates.

Region-agnostic, industry-agnostic. Any country, any business.

Primary agentic workflow in Claude Code:

```
/batch "Tokyo 3 restaurants"
```

Batch discovery for parallel Claude agents:

```bash
npx tsx packages/batch/orchestrate.ts --city "New York" --categories "food,beauty" --limit 3 --help
```

---

## System Architecture

<picture>
  <img src="docs/architecture-overview.svg" alt="DuoCode Pipeline Architecture -- 4-phase system from Discovery to Deploy, orchestrated by Claude Code">
</picture>

The pipeline is orchestrated by Claude Code as a central brain. Every phase -- discovery, classification, generation, deployment -- is driven programmatically through TypeScript modules under `packages/`.

### How It Works

1. **Discover** -- Search Google Maps Places API for businesses without websites in a target city
2. **Prepare** -- Download photos, extract brand colors, scaffold from shared template. Auto-classifies the business and outputs `hints` (suggestedIndustry, suggestedArchetype, confidence) -- these are suggestions, not binding decisions
3. **Design** -- Claude reads the full `lead` data + `hints`, decides site structure, picks fonts via `frontend-design` skill, creates unique components. Dev preview via `npm run dev` + browser-use screenshot before finalizing
4. **Finalize** -- Build with Next.js, run Lighthouse quality gates, deploy via Vercel REST API, push to GitHub

Each generated site ships with:
- Locale support driven by region detection (19 regions, `getLocalesForRegion`)
- Brand colors extracted from the business's own photos
- Responsive images in 4 WebP sizes (320/640/960/1280)
- Unique design per business (Claude decides all fonts, layout, and typography via `frontend-design` skill)
- 10 shared UI components from scaffold: Button, Section, Card, Grid, Accordion, Badge, ResponsiveImage, DemoModal, ReviewStars, HoursTable
- Strict accessibility threshold (Lighthouse a11y >= 95)

---

## Data Flow

<picture>
  <img src="docs/data-flow.svg" alt="Data flow from CLI arguments through Google Maps API, asset pipeline, Claude design, quality gates, to live Vercel deployment">
</picture>

---

## Project Structure

```
infra/src/
├── packages/                              # Core TypeScript pipeline modules
│   ├── pipeline/
│   │   ├── prepare.ts                     # Pre-design: photos -> colors -> scaffold -> hints
│   │   ├── finalize.ts                    # Post-design: build -> lighthouse -> deploy
│   │   └── generate-site.ts              # Standalone generate (prepare + finalize)
│   ├── discover/search.ts                 # Google Maps Places API integration
│   ├── assets/
│   │   ├── maps-photos.ts                # Download business photos from Maps
│   │   ├── stock-photos.ts               # Unsplash fallback photos
│   │   ├── extract-colors.ts             # node-vibrant -> 9 WCAG-safe brand colors
│   │   ├── download-fonts.ts             # Self-host Google Fonts as .woff2
│   │   └── optimize-images.ts            # Sharp -> 4 WebP responsive sizes
│   ├── generate/
│   │   ├── industry-config.ts            # Industry classification + legacy design specs
│   │   └── archetype-config.ts           # 8 archetype patterns + resolution logic
│   ├── template/
│   │   ├── scaffold.ts                   # Copy shared template into output dir
│   │   └── _shared/src/components/ui/    # 10 shared UI components
│   │       ├── Button.tsx
│   │       ├── Section.tsx
│   │       ├── Card.tsx
│   │       ├── Grid.tsx
│   │       ├── Accordion.tsx
│   │       ├── Badge.tsx
│   │       ├── ResponsiveImage.tsx
│   │       ├── DemoModal.tsx
│   │       ├── ReviewStars.tsx
│   │       └── HoursTable.tsx
│   ├── quality/
│   │   ├── serve-and-check.ts            # Local Lighthouse with auto port management
│   │   ├── lighthouse-check.ts           # Remote Lighthouse audit
│   │   └── shared.ts                     # Lighthouse thresholds (single source of truth)
│   ├── batch/orchestrate.ts              # Batch discovery -- outputs leads for Claude agents
│   ├── deploy/
│   │   ├── deploy.ts                     # Vercel REST API v13 deployment
│   │   └── publish.ts                    # GitHub repo creation + push
│   └── utils/
│       ├── env.ts                        # requireEnv, optionalEnv, detectRegionId,
│       │                                 #   getLocalesForRegion, toInternationalPhone
│       ├── cli.ts                        # getArg, hasFlag CLI helpers
│       ├── n8n.ts                        # n8n webhook helpers
│       └── translate.ts                  # Extract EN strings for Claude to translate
│
├── .claude/skills/                        # 6 Claude Code skills
│   ├── generate/SKILL.md                 #   /generate -- prepare -> design -> finalize
│   ├── batch/SKILL.md                    #   /batch -- parallel discovery + Claude agents
│   ├── fix-site/SKILL.md                 #   /fix-site -- screenshot -> fix -> redeploy
│   ├── duocode-design/                   #   Auto-load: design system + references
│   │   ├── SKILL.md                      #     Region-agnostic market rules + scaffolding
│   │   ├── references/
│   │   │   ├── archetype-guide.md        #     8 validated archetype patterns
│   │   │   ├── platforms-by-region.md    #     19 regions: review/delivery/social platforms
│   │   │   ├── generic-market.md         #     Generic market rules for any country
│   │   │   ├── malaysia-market.md        #     Malaysia-specific market context
│   │   │   ├── a11y-checklist.md         #     Accessibility requirements
│   │   │   ├── browser-use.md            #     browser-use CLI reference
│   │   │   └── lighthouse-ci.md          #     Lighthouse CI config reference
│   │   ├── schemas/
│   │   │   └── _base.schema.json         #     business.ts JSON schema
│   │   └── templates/_shared/            #     Next.js shared template scaffolding
│   ├── frontend-design/SKILL.md          #   Auto-load: Anthropic design skill
│   └── skill-creator/SKILL.md            #   Skill creation and testing
│
├── data/                                  # Pipeline data (leads, exports)
│   ├── leads/                             #   Discovered leads JSON
│   └── exports/                           #   Exported CSVs
│
├── n8n/                                   # Background automation (Docker)
│   ├── docker-compose.yml                 # n8n service config
│   ├── Dockerfile                         # Custom n8n with npm packages
│   ├── init-workflows.sh                  # Auto-import on container start
│   ├── backup-workflows.sh                # Export workflows from running n8n
│   └── workflows/                         # 4 active + 1 reference
│
├── output/                                # Generated sites (one per slug)
│   └── {slug}/
│       ├── src/data/business.ts           #   Generated: locale content
│       ├── src/components/ui/             #   Shared UI components (from scaffold)
│       ├── public/images/                 #   Optimized WebP photos
│       ├── public/svgs/                   #   Industry SVG decorations
│       └── out/                           #   Next.js static export -> deploy
│
├── tests/                                 # Test suite (428 tests, 10 files)
│   ├── unit/                              #   6 unit test files
│   ├── integration/                       #   2 integration test files
│   ├── e2e/                               #   2 end-to-end test files
│   ├── run-all.sh                         #   Comprehensive test runner
│   └── screenshots/                       #   Visual QA screenshots
│
├── eval/                                  # Evaluation scripts
│   ├── validate-skills.sh                 #   Skill structure & frontmatter
│   ├── validate-templates.sh              #   Template completeness
│   └── quality-metrics.sh                 #   Lighthouse config validation
│
├── scripts/                               # Utility scripts
│   ├── cleanup-output.sh                  #   Remove stale output dirs
│   ├── sync-sheet.py                      #   Sync leads to Google Sheets
│   └── update-n8n-and-sync.py             #   Update n8n workflows + sync
│
├── package.json                           # Dependencies & scripts
├── tsconfig.json                          # TypeScript strict, ES2020
├── vitest.config.ts                       # Vitest test runner config
├── .lighthouserc.json                     # Quality thresholds (single source of truth)
└── .env.template                          # Required API keys
```

---

## Package Dependency Graph

<picture>
  <img src="docs/package-dependency.svg" alt="Package dependency graph showing pipeline modules and their import relationships">
</picture>

### Module Details

| Module | Lines | Purpose | Key Export |
|--------|------:|---------|------------|
| `pipeline/prepare.ts` | 486 | Pre-design: photos, colors, scaffold, hints | `prepare(lead)` -> `PrepareResult` (lead + hints) |
| `pipeline/finalize.ts` | 291 | Post-design: build, quality, deploy | `finalize({dir, slug, dryRun})` -> `FinalizeResult` |
| `pipeline/generate-site.ts` | 309 | Standalone generate (prepare + finalize) | `generateSite(options)` |
| `discover/search.ts` | 254 | Google Maps Places API (New) search | `searchPlaces(category, city)` -> `PlaceResult[]` |
| `generate/industry-config.ts` | 285 | Industry classification + design specs | `classifyIndustry()`, `INDUSTRY_CONFIG`, `slugify()` |
| `generate/archetype-config.ts` | 330 | 8 archetype patterns + resolution | `resolveArchetype()`, `Archetype`, `ArchetypeMapping` |
| `assets/extract-colors.ts` | 196 | Brand color extraction + WCAG enforcement | `extractAndSave(img, dir)` -> `BrandColors` (9 tokens) |
| `assets/download-fonts.ts` | 223 | Self-host Google Fonts as .woff2 | `downloadFonts(fonts, weights, dir)` |
| `assets/stock-photos.ts` | 149 | Unsplash stock photo fallback | `downloadStockPhotos(industry, dir)` |
| `assets/optimize-images.ts` | 142 | Sharp WebP conversion at 4 breakpoints | `optimizeImages(dir)` -> `ImageManifest` |
| `assets/maps-photos.ts` | 95 | Google Places photo download | `downloadMapsPhotos(names, dir)` |
| `quality/serve-and-check.ts` | 249 | Local Lighthouse with auto port mgmt | `runLocalQualityGate(options)` |
| `quality/shared.ts` | 150 | Lighthouse thresholds + config | Quality gate constants |
| `deploy/deploy.ts` | 201 | Vercel REST API v13 deployment | `deployToVercel(buildDir, slug)` -> `DeployResult` |
| `deploy/publish.ts` | 116 | GitHub repo creation + push | `publishGeneratedSite(dir, slug)` |
| `batch/orchestrate.ts` | 131 | Batch discovery -- outputs leads for Claude agents | `discover(config)` -> `PlaceResult[]` |
| `template/scaffold.ts` | 169 | Copy shared template + SVG decorations | `copyTemplates()`, `writeSvgDecorations()` |
| `utils/env.ts` | 124 | Env vars, region detection, phone format, locales | `requireEnv`, `detectRegionId`, `getLocalesForRegion`, `toInternationalPhone` |
| `utils/translate.ts` | 144 | Extract EN strings for translation template | `generateTemplate(dir, locales)` |
| `utils/cli.ts` | 24 | CLI argument parsing | `getArg(args, key, fallback)` |
| `utils/n8n.ts` | 180 | n8n webhook helpers | `logAction()`, `postWebhook()` |

### Key TypeScript Interfaces

```typescript
// PlaceResult -- from Google Maps Places API
interface PlaceResult {
  id: string;
  displayName: { text: string; languageCode: string };
  primaryType?: string;          // e.g., "restaurant", "beauty_salon"
  formattedAddress: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;           // null -> target lead
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions: string[];
    openNow?: boolean;
  };
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  businessStatus?: string;       // OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
}

// ClassificationHint -- from prepare.ts, informational only. Claude may override.
interface ClassificationHint {
  suggestedIndustry: string;       // e.g., "food", "beauty", "clinic"
  suggestedArchetype: Archetype;   // e.g., "menu-order", "portfolio-book"
  secondaryArchetype?: Archetype;
  schemaOrgType: string;           // Schema.org structured data type
  confidence: 'high' | 'medium' | 'low';
  source: string;                  // e.g., "primaryType exact match"
}

// PrepareResult -- what prepare.ts returns for Claude to design from
interface PrepareResult {
  outputDir: string;
  slug: string;
  regionId: string;
  brandColors: BrandColors;
  photos: string[];
  photoCount: number;
  lead: PlaceResult;               // Full business data for Claude
  hints: ClassificationHint;       // Suggestions -- Claude decides final design
}

// BrandColors -- extracted from business photos, WCAG-safe
interface BrandColors {
  primary: string;        // Vibrant swatch (>=3:1 on surface)
  primaryDark: string;    // DarkVibrant
  accent: string;         // LightVibrant (>=3:1 on surface)
  surface: string;        // LightMuted
  textTitle: string;      // DarkMuted (>=4.5:1 on surface)
  textBody: string;       // Muted (>=4.5:1 on surface)
  onPrimary: string;      // Text on primary bg (>=4.5:1)
  onPrimaryDark: string;  // Text on primaryDark bg (>=4.5:1)
  accentText: string;     // Accent for text on surface (>=4.5:1)
}
```

---

## Skill Architecture

<picture>
  <img src="docs/skill-system.svg" alt="Skill architecture -- 6 skills: 3 pipeline + 2 auto-load + 1 utility">
</picture>

6 Claude Code skills under `.claude/skills/`:

**Pipeline Skills** (user-invoked via `/slash-commands`):
`/generate` (prepare -> design -> finalize), `/batch` (batch discovery + parallel Claude agents), `/fix-site` (post-deploy fixes)

**Reference Skills** (Claude auto-loads when relevant):
`duocode-design` (region-agnostic market rules + archetype guide + a11y + browser-use + lighthouse), `frontend-design` (Anthropic design skill -- Claude picks fonts, layout, typography)

**Utility Skill**: `/skill-creator`

### Pipeline Architecture

```
User: "Tokyo 3 restaurants"
  |
search.ts -> 3 leads (PlaceResult[])
  |
prepare.ts x 3 (parallel)  ->  Claude decides x 3   ->  finalize.ts x 3 (parallel)
  (mechanical)                    (creative)               (mechanical)
  |                                                        |
  photos, colors,                                          build, lighthouse,
  scaffold, hints                                          deploy, git push
                                   |
                             Claude reads lead +
                             hints, picks fonts,
                             designs layout,
                             dev preview screenshot
```

Design is driven by the `frontend-design` skill. Claude reads the full `lead` and `hints`, then makes all design decisions autonomously -- fonts, layout, colors, components. Each site gets a unique layout. A dev preview step (`npm run dev` + browser-use screenshot) validates the design before finalize.

---

## Shared UI Components

10 pre-built components scaffolded into every site at `src/components/ui/`. Claude imports these rather than recreating them:

| Component | Purpose |
|-----------|---------|
| `Button` | Primary/secondary/ghost variants with consistent styling |
| `Section` | Page sections with spacing, optional background variants |
| `Card` | Content cards for services, features, menu items |
| `Grid` | Responsive grid layout (auto-columns based on children) |
| `Accordion` | Expandable FAQ / info panels |
| `Badge` | Status indicators, tags, labels |
| `ResponsiveImage` | `<picture>` with 4 WebP breakpoints + lazy loading |
| `DemoModal` | Lightbox modal for image galleries |
| `ReviewStars` | Star rating display (supports half-stars) |
| `HoursTable` | Opening hours table from Google Places data |

---

## Quality Gates

Every generated site must pass 2 required gates before deployment. A dev preview step captures the design before finalize.

| Gate | Tool | Thresholds | Config |
|------|------|------------|--------|
| **Dev Preview** | `npm run dev` + `browser-use` | Screenshot capture for visual QA before finalize | In-design step |
| **Gate 1** | `npm run build` | Zero TypeScript/build errors | `tsconfig.json` |
| **Gate 2** | Lighthouse (local serve) | Accessibility >= 95, SEO >= 95, Best Practices >= 90, Performance >= 90 (warn only) | `.lighthouserc.json` -> `shared.ts` |
| **Support** | `browser-use` screenshots | Desktop + mobile captures when the tool is available; non-fatal if unavailable | `packages/quality/serve-and-check.ts` |

---

## External Services

| Service | Purpose | Auth | Used By |
|---------|---------|------|---------|
| Google Maps Places API (New) | Business discovery + photo download | `GOOGLE_API_KEY` | `discover/search.ts`, `assets/maps-photos.ts` |
| Google Sheets | Lead storage + work logging | n8n OAuth2 | n8n workflows |
| Unsplash | Stock photo fallback | `UNSPLASH_ACCESS_KEY` | `assets/stock-photos.ts` |
| Vercel | Static hosting + CDN | `VERCEL_TOKEN` | `deploy/deploy.ts` |
| GitHub | Source code storage (DuoCode2 org) | `gh` CLI auth | `deploy/publish.ts`, `pipeline/finalize.ts` |
| n8n | Workflow orchestration | Basic Auth | Docker (port 5678) |

### n8n Workflows (background automation only -- not in generation path)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `log-work.json` | Webhook `POST /webhook/log-work` | Log deployment results to Google Sheets |
| `lead-status.json` | Webhook `POST /webhook/lead-status` | Query lead status from Sheets |
| `sheets-init.json` | Webhook `POST /webhook/sheets-init` | Initialize spreadsheet headers |
| `sheets-rebuild.json` | Webhook `POST /webhook/sheets-rebuild` | Clear and rebuild spreadsheet |

---

## Commands

### Pipeline (4 commands)

```bash
# 1. Discover leads (--city and --category required)
npx tsx packages/discover/search.ts --city "Tokyo" --category "restaurant" --limit 3 --out data/leads/leads.json --help

# 2. Prepare (all mechanical work before design -- outputs lead + hints)
npx tsx packages/pipeline/prepare.ts --lead-file data/leads/leads.json --index 0 --help

# 3. Finalize (build + quality + deploy after design)
npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ [--dry-run] --help

# 4. Batch Discovery (discover leads for parallel Claude agents)
npx tsx packages/batch/orchestrate.ts --city "New York" --categories "food,beauty" --limit 3 --out data/leads/batch.json --help
```

### Translation

```bash
# Extract EN strings from business.ts and generate translation template
npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN,zh-TW --help
```

### Font Download

```bash
# Download fonts chosen by Claude during design
npx tsx packages/assets/download-fonts.ts --fonts "Inter,Playfair Display" --output output/{slug}/public/fonts --help
```

### Testing (428 tests, 10 files)

```bash
npm test                  # Unit tests (vitest)
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests (requires API keys)
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Tests with coverage report
npm run test:all          # All tests + evals
npm run build:check       # TypeScript compile check
```

### Evaluation

```bash
npm run eval:skills       # Skill structure validation (frontmatter, references)
npm run eval:templates    # Template completeness (components, archetype coverage)
npm run eval:quality      # Quality metrics (Lighthouse config, thresholds)
npm run eval:all          # All evals
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
| **Runtime** | Node.js | -- | TypeScript execution |
| **Language** | TypeScript | 5.9 | Strict mode, ES2020 target |
| **Framework** | Next.js | 14.2 | Static site generation |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Image Processing** | Sharp | 0.34 | WebP conversion, responsive sizes |
| **Color Extraction** | node-vibrant | 4.0 | Palette extraction from photos |
| **SVG Optimization** | SVGO | 4.0 | SVG minification |
| **Quality** | Lighthouse | 13.0 | Performance/a11y/SEO auditing |
| **Testing** | Vitest | 4.1 | Unit/integration/e2e test runner |
| **Workflows** | n8n | 1.76 | Docker-based workflow orchestration |
| **Hosting** | Vercel | -- | Static CDN + serverless |
| **Source Control** | GitHub | -- | DuoCode2 org, `gh` CLI |
| **Orchestration** | Claude Code | -- | Central pipeline brain -- all design decisions |

---

## Region Support

19 regions with auto-detection from Google Places `formattedAddress` and locale support:

| Region | ID | Default Locales |
|--------|----|-----------------|
| Malaysia | `my` | en, ms, zh-CN, zh-TW |
| Singapore | `sg` | en, zh-CN, ms |
| Hong Kong | `hk` | en, zh-TW, zh-CN |
| Taiwan | `tw` | zh-TW, en |
| China | `cn` | zh-CN, en |
| Japan | `jp` | ja, en |
| South Korea | `kr` | ko, en |
| Thailand | `th` | th, en |
| Vietnam | `vn` | vi, en |
| Indonesia | `id` | id, en |
| Philippines | `ph` | en, tl |
| India | `in` | en, hi |
| UAE | `ae` | en, ar |
| Saudi Arabia | `sa` | ar, en |
| Germany | `de` | de, en |
| France | `fr` | fr, en |
| Netherlands | `nl` | nl, en |
| Brunei | `bn` | en, ms |
| Unknown | `xx` | en |

Additional country mappings (US, UK, Canada, Australia, New Zealand) resolve for region detection but default to English-only locales.

WhatsApp international prefix is handled automatically by `toInternationalPhone(phone, regionId)` -- strips local leading zero and prepends the country code.

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

# 5. Discover leads and run pipeline
npx tsx packages/discover/search.ts --city "Tokyo" --category "restaurant" --limit 1 --out data/leads/leads.json
```

### Required API Keys

| Key | Provider | Required APIs |
|-----|----------|--------------|
| `GOOGLE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | Places API (New) |
| `UNSPLASH_ACCESS_KEY` | [Unsplash Developers](https://unsplash.com/oauth/applications) | Image search |
| `VERCEL_TOKEN` | [Vercel Account](https://vercel.com/account/tokens) | Full Access scope |

---

## Generated Site Structure

Each site produced by the pipeline:

```
output/{slug}/
├── src/
│   ├── app/[locale]/page.tsx        # Unique page layout per business
│   ├── components/
│   │   ├── ui/                      # Shared components (from scaffold)
│   │   │   ├── Button.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── ResponsiveImage.tsx
│   │   │   ├── DemoModal.tsx
│   │   │   ├── ReviewStars.tsx
│   │   │   └── HoursTable.tsx
│   │   └── *.tsx                    # Claude generates unique per business
│   ├── data/business.ts             # All business content (multi-locale)
│   ├── data/images.ts               # Responsive srcset data for <picture>
│   └── styles/globals.css           # CSS variables from brand colors
├── public/
│   ├── images/*-{320,640,960,1280}.webp
│   ├── fonts/*.woff2                # Self-hosted fonts (Claude's choice)
│   └── svgs/*.svg                   # Industry decorations
├── brand-colors.json                # Extracted color palette
├── lead.json                        # Original PlaceResult + photoSource
├── package.json                     # Next.js 14 + React 18 + Tailwind 3
└── out/                             # Static build -> deployed to Vercel
```

---

## License

AGPL-3.0 for DuoCode-authored code. Third-party skills retain their original licenses.
