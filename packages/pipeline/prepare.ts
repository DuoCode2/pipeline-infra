import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { downloadMapsPhotos } from '../assets/maps-photos';
import { downloadStockPhotos } from '../assets/stock-photos';
import { extractAndSave, type BrandColors } from '../assets/extract-colors';
import { downloadFonts } from '../assets/download-fonts';
import { optimizeImages } from '../assets/optimize-images';
import {
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
  classifyIndustry,
  slugify,
  type IndustryDesign,
} from '../generate/industry-config';

// ── Types ────────────────────────────────────────────────────────

interface LeadInput {
  id: string;
  displayName: { text: string; languageCode?: string };
  primaryType?: string;
  formattedAddress: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions: string[] };
  photos?: Array<{ name: string; widthPx?: number; heightPx?: number }>;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
}

export interface PrepareResult {
  outputDir: string;
  slug: string;
  industry: string;
  brandColors: BrandColors;
  photos: string[];
  photoCount: number;
  config: IndustryDesign & { schemaOrgType: string };
}

// ── SVG decorations (same as orchestrate.ts) ─────────────────────

const INDUSTRY_SVGS: Record<string, { name: string; svg: string }[]> = {
  restaurant: [
    { name: 'steam', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" fill="none"><title>Steam</title><path d="M20 50C20 50 25 30 30 30C35 30 30 50 35 50C40 50 35 30 40 30" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/><path d="M55 50C55 50 60 25 65 25C70 25 65 50 70 50C75 50 70 25 75 25" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><path d="M90 50C90 50 95 32 100 32C105 32 100 50 105 50" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/></svg>' },
    { name: 'wave-divider', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 40" preserveAspectRatio="none"><title>Wave</title><path d="M0 20C200 5 400 35 600 20C800 5 1000 35 1200 20" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.25"/></svg>' },
  ],
  beauty: [
    { name: 'flower-petal', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><title>Flower</title><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(0 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(72 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.3" transform="rotate(144 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.35" transform="rotate(216 40 40)"/><ellipse cx="40" cy="20" rx="8" ry="16" stroke="currentColor" stroke-width="1.5" opacity="0.4" transform="rotate(288 40 40)"/><circle cx="40" cy="40" r="4" fill="currentColor" opacity="0.5"/></svg>' },
    { name: 'sparkle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="currentColor"><title>Sparkle</title><path d="M30 5L33 25L53 28L33 31L30 51L27 31L7 28L27 25Z" opacity="0.3"/></svg>' },
  ],
  clinic: [
    { name: 'pulse', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" fill="none"><title>Pulse</title><path d="M0 30H60L75 10L90 50L105 20L120 35H200" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/></svg>' },
    { name: 'cross', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none"><title>Medical</title><rect x="22" y="8" width="16" height="44" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/><rect x="8" y="22" width="44" height="16" rx="3" stroke="currentColor" stroke-width="1.5" opacity="0.25"/></svg>' },
  ],
  generic: [
    { name: 'dots', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><title>Decoration</title><circle cx="20" cy="20" r="2" opacity="0.2"/><circle cx="50" cy="30" r="2" opacity="0.15"/><circle cx="80" cy="15" r="2" opacity="0.2"/><circle cx="35" cy="60" r="2" opacity="0.15"/><circle cx="70" cy="70" r="2" opacity="0.2"/></svg>' },
  ],
};

// ── Template scaffolding ─────────────────────────────────────────

function copyTemplates(industry: string, outputDir: string) {
  const designDir = path.resolve(__dirname, '../../.claude/skills/duocode-design/templates');
  const sharedDir = path.join(designDir, '_shared');
  const industryDir = path.join(designDir, industry);

  // Copy _shared config files
  for (const f of ['package.json', 'next.config.js', 'tailwind.config.ts', 'tsconfig.json', 'postcss.config.js', 'vercel.json', '.gitignore']) {
    const src = path.join(sharedDir, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outputDir, f));
  }

  // Copy _shared src/ and public/
  execSync(`cp -r "${path.join(sharedDir, 'src')}"/* "${path.join(outputDir, 'src')}/"`, { stdio: 'pipe' });
  if (fs.existsSync(path.join(sharedDir, 'public'))) {
    execSync(`cp -r "${path.join(sharedDir, 'public')}"/* "${path.join(outputDir, 'public')}/"`, { stdio: 'pipe' });
  }

  // Overlay industry-specific files (if any)
  if (fs.existsSync(industryDir)) {
    const pageSrc = path.join(industryDir, 'page.tsx');
    if (fs.existsSync(pageSrc)) {
      fs.copyFileSync(pageSrc, path.join(outputDir, 'src/app/[locale]/page.tsx'));
    }
    const compDir = path.join(industryDir, 'components');
    if (fs.existsSync(compDir)) {
      for (const comp of fs.readdirSync(compDir)) {
        fs.copyFileSync(path.join(compDir, comp), path.join(outputDir, 'src/components', comp));
      }
    }
  }
}

function writeSvgDecorations(industry: string, outputDir: string) {
  const svgs = INDUSTRY_SVGS[industry] || INDUSTRY_SVGS.generic;
  const svgDir = path.join(outputDir, 'public/svgs');
  fs.mkdirSync(svgDir, { recursive: true });
  for (const { name, svg } of svgs) {
    fs.writeFileSync(path.join(svgDir, `${name}.svg`), svg);
  }
}

// ── Business.ts skeleton ─────────────────────────────────────────

function generateBusinessSkeleton(
  lead: LeadInput,
  industry: string,
  colors: BrandColors,
  config: IndustryDesign,
  photos: string[],
  slug: string,
  outputDir: string
) {
  const schemaType = SCHEMA_ORG_TYPE[industry] || 'LocalBusiness';
  const hero = photos.length >= 2 ? `/images/${photos[1].replace('.jpg', '-960.webp')}` : photos[0] ? `/images/${photos[0].replace('.jpg', '-960.webp')}` : '';
  const gallery = photos.slice(2).map(p => `/images/${p.replace('.jpg', '-960.webp')}`);

  const ts = `import type { BusinessData } from '@/types/business';

export const business: BusinessData = {
  schemaOrgType: "${schemaType}",
  siteUrl: "https://${slug}.vercel.app",
  theme: {
    primary: "${colors.primary}",
    primaryDark: "${colors.primaryDark}",
    accent: "${colors.accent}",
    surface: "${colors.surface}",
    textTitle: "${colors.textTitle}",
    textBody: "${colors.textBody}",
    onPrimary: "${colors.onPrimary}",
    onPrimaryDark: "${colors.onPrimaryDark}",
    accentText: "${colors.accentText}",
    fontDisplay: "${config.fontDisplay}",
    fontBody: "${config.fontBody}",
  },
  assets: {
    heroImage: "${hero}",
    galleryImages: ${JSON.stringify(gallery)},
  },
  content: {
    en: {
      meta: { title: "${lead.displayName.text}", description: "" },
      hero: { title: "", subtitle: "", cta: "" },
      hours: {},
      location: { address: "${lead.formattedAddress}", mapsUrl: "${lead.googleMapsUri || ''}" },
      contact: { phone: "${lead.nationalPhoneNumber || ''}" },
      reviews: { rating: ${lead.rating || 0}, count: ${lead.userRatingCount || 0}, featured: [] },
    },
    ms: {
      meta: { title: "${lead.displayName.text}", description: "" },
      hero: { title: "", subtitle: "", cta: "" },
      hours: {},
      location: { address: "${lead.formattedAddress}", mapsUrl: "${lead.googleMapsUri || ''}" },
      contact: { phone: "${lead.nationalPhoneNumber || ''}" },
      reviews: { rating: ${lead.rating || 0}, count: ${lead.userRatingCount || 0}, featured: [] },
    },
    "zh-CN": {
      meta: { title: "${lead.displayName.text}", description: "" },
      hero: { title: "", subtitle: "", cta: "" },
      hours: {},
      location: { address: "${lead.formattedAddress}", mapsUrl: "${lead.googleMapsUri || ''}" },
      contact: { phone: "${lead.nationalPhoneNumber || ''}" },
      reviews: { rating: ${lead.rating || 0}, count: ${lead.userRatingCount || 0}, featured: [] },
    },
    "zh-TW": {
      meta: { title: "${lead.displayName.text}", description: "" },
      hero: { title: "", subtitle: "", cta: "" },
      hours: {},
      location: { address: "${lead.formattedAddress}", mapsUrl: "${lead.googleMapsUri || ''}" },
      contact: { phone: "${lead.nationalPhoneNumber || ''}" },
      reviews: { rating: ${lead.rating || 0}, count: ${lead.userRatingCount || 0}, featured: [] },
    },
  },
};
`;
  fs.mkdirSync(path.join(outputDir, 'src/data'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'src/data/business.ts'), ts);
}

// ── Save lead.json for traceability ──────────────────────────────

function saveLeadJson(lead: LeadInput, industry: string, outputDir: string) {
  fs.writeFileSync(path.join(outputDir, 'lead.json'), JSON.stringify({
    place_id: lead.id,
    name: lead.displayName.text,
    industry,
    address: lead.formattedAddress,
    phone: lead.nationalPhoneNumber,
    rating: lead.rating,
    reviews: lead.userRatingCount,
    mapsUrl: lead.googleMapsUri,
    timestamp: new Date().toISOString(),
  }, null, 2));
}

// ── Main pipeline ────────────────────────────────────────────────

export async function prepare(lead: LeadInput, industry?: string): Promise<PrepareResult> {
  const resolvedIndustry = industry || classifyIndustry(lead.primaryType);
  const config = INDUSTRY_CONFIG[resolvedIndustry] || INDUSTRY_CONFIG.generic;
  const schemaOrgType = SCHEMA_ORG_TYPE[resolvedIndustry] || 'LocalBusiness';
  const slug = slugify(lead.displayName.text);
  const outputDir = path.resolve('output', slug);

  console.error(`\n━━ Preparing: ${lead.displayName.text} (${resolvedIndustry}) ━━`);

  // 1. Create directory structure
  for (const d of ['public/images', 'public/svgs', 'public/fonts', 'src/data', 'src/components', 'src/app/[locale]', 'screenshots']) {
    fs.mkdirSync(path.join(outputDir, d), { recursive: true });
  }

  // 2. Download Maps photos
  const photoNames = (lead.photos || []).map(p => p.name).slice(0, 5);
  if (photoNames.length > 0) {
    console.error(`  Downloading ${photoNames.length} Maps photos...`);
    await downloadMapsPhotos(photoNames, path.join(outputDir, 'public/images'), 3);
  }

  // 3. Stock photos if needed
  const imgDir = path.join(outputDir, 'public/images');
  const jpgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
  if (jpgs.length < 3) {
    console.error(`  Only ${jpgs.length} photos, fetching stock...`);
    await downloadStockPhotos(resolvedIndustry, imgDir, 3 - jpgs.length);
  }

  // 4. Extract brand colors (WCAG-safe)
  const allJpgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
  // Use maps-2 (interior) if available, otherwise first photo
  const colorSource = allJpgs.find(f => f.includes('maps-2')) || allJpgs[0];
  let colors: BrandColors;
  if (colorSource) {
    console.error(`  Extracting brand colors from ${colorSource}...`);
    colors = await extractAndSave(path.join(imgDir, colorSource), outputDir);
  } else {
    console.error('  No photos found, using default colors');
    colors = await extractAndSave('nonexistent', outputDir);
  }

  // 5. Download fonts (self-host Latin)
  console.error(`  Downloading fonts: ${config.fontDisplay}, ${config.fontBody}...`);
  await downloadFonts(
    [config.fontDisplay, config.fontBody],
    [300, 400, 500, 600, 700, 800],
    path.join(outputDir, 'public/fonts')
  );

  // 6. Optimize images
  console.error('  Optimizing images to WebP...');
  await optimizeImages(imgDir);

  // 7. Copy template scaffolding
  console.error('  Copying template scaffolding...');
  copyTemplates(resolvedIndustry, outputDir);

  // 8. Write SVG decorations
  writeSvgDecorations(resolvedIndustry, outputDir);

  // 9. Generate business.ts skeleton
  console.error('  Generating business.ts skeleton...');
  generateBusinessSkeleton(lead, resolvedIndustry, colors, config, allJpgs, slug, outputDir);

  // 10. Save lead.json for traceability
  saveLeadJson(lead, resolvedIndustry, outputDir);

  console.error(`  ✓ Ready for design at ${outputDir}`);

  const result: PrepareResult = {
    outputDir,
    slug,
    industry: resolvedIndustry,
    brandColors: colors,
    photos: allJpgs,
    photoCount: allJpgs.length,
    config: { ...config, schemaOrgType },
  };

  return result;
}

// ── CLI ──────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const leadJson = getArg('lead', '');
  const industry = getArg('industry', '');

  if (!leadJson) {
    console.error('Usage: npx tsx packages/pipeline/prepare.ts --lead \'{"id":"...","displayName":{"text":"..."},...}\' [--industry restaurant]');
    process.exit(1);
  }

  let lead: LeadInput;
  try {
    lead = JSON.parse(leadJson);
  } catch {
    console.error('Error: --lead must be valid JSON');
    process.exit(1);
  }

  prepare(lead, industry || undefined)
    .then((result) => {
      // stdout: clean JSON for Claude to consume
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
