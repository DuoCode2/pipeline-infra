import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { downloadMapsPhotos } from '../assets/maps-photos';
import { downloadStockPhotos } from '../assets/stock-photos';
import { extractAndSave, type BrandColors } from '../assets/extract-colors';
import { downloadFonts } from '../assets/download-fonts';
import { optimizeImages } from '../assets/optimize-images';
import { copyTemplates, writeSvgDecorations } from '../template/scaffold';
import {
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
  classifyIndustry,
  slugify,
  type IndustryDesign,
} from '../generate/industry-config';
import { resolveArchetype, type Archetype, type ArchetypeMapping } from '../generate/archetype-config';
import { type PlaceResult } from '../discover/search';
import { getArg } from '../utils/cli';
import { detectRegionId } from '../utils/env';
import { logAction } from '../utils/n8n';

// ── Industry-specific favicon SVGs ──────────────────────────────
// Each returns a 32x32 SVG with rounded-rect background + icon path.
const INDUSTRY_FAVICON: Record<string, (bg: string, fg: string) => string> = {
  food: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M10 8v6c0 1.7 1.3 3 3 3v7h1V17c1.7 0 3-1.3 3-3V8h-1v5h-1V8h-1v5h-1V8h-1v5h-1V8zm10 0c-1.1 0-2 1.3-2 3v5h2v8h1V8z" fill="${fg}"/></svg>`,
  beauty: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M16 6l1.8 5.5H23l-4.2 3 1.6 5.1L16 16.5l-4.4 3.1 1.6-5.1-4.2-3h5.2z" fill="${fg}"/></svg>`,
  clinic: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M14 8h4v6h6v4h-6v6h-4v-6H8v-4h6z" fill="${fg}"/></svg>`,
  retail: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M10 10h12l-1.5 10h-9zM13 8v2M19 8v2" stroke="${fg}" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  fitness: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M6 16h2v-4h3v-2h2v12h-2v-2H8v-4H6zm20 0h-2v-4h-3v-2h-2v12h2v-2h3v-4h2z" fill="${fg}"/><rect x="13" y="14" width="6" height="4" rx="1" fill="${fg}"/></svg>`,
  service: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M12.5 7a5 5 0 014.9 6l6.6 6.6a2 2 0 01-2.8 2.8L14.6 16A5 5 0 1112.5 7zm0 2a3 3 0 100 6 3 3 0 000-6z" fill="${fg}"/></svg>`,
  automotive: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M16 7a9 9 0 110 18 9 9 0 010-18zm0 3a6 6 0 100 12 6 6 0 000-12zm0 2.5a1 1 0 011 1v1.8l1.3.7a1 1 0 01-.9 1.8L16 17v-3.5a1 1 0 011-1z" fill="${fg}" fill-rule="evenodd"/></svg>`,
  tech: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><rect x="10" y="6" width="12" height="20" rx="2" stroke="${fg}" stroke-width="2" fill="none"/><circle cx="16" cy="22" r="1.5" fill="${fg}"/></svg>`,
  education: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M16 6l10 5-10 5-10-5zm-7 7v6l7 3.5 7-3.5v-6" fill="none" stroke="${fg}" stroke-width="2"/></svg>`,
  pet: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M16 20c-2 0-4 2-4 4s2 2 4 2 4 0 4-2-2-4-4-4zm-5-6a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zm-7-4a2 2 0 100-4 2 2 0 000 4zm4 0a2 2 0 100-4 2 2 0 000 4z" fill="${fg}"/></svg>`,
  events: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M9 10h14a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V12a2 2 0 012-2zm3-3v3m8-3v3m-12 4h16" stroke="${fg}" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  hospitality: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M7 24V14l9-6 9 6v10H7z" fill="none" stroke="${fg}" stroke-width="2"/><path d="M13 24v-5h6v5M12 8v2m8-2v2" stroke="${fg}" stroke-width="2" fill="none"/></svg>`,
  realestate: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M6 24V14l10-7 10 7v10H6zm5-7v4h4v-4zm7 0v4h4v-4z" fill="${fg}"/></svg>`,
  community: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M16 6c-3 0-6 4-6 8 0 5 6 12 6 12s6-7 6-12c0-4-3-8-6-8zm0 5a3 3 0 110 6 3 3 0 010-6z" fill="${fg}"/></svg>`,
  generic: (bg, fg) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><path d="M7 24V14l9-6 9 6v10H7zm4-8v5h4v-5zm7 0v5h4v-5z" fill="${fg}"/></svg>`,
};

export interface PrepareResult {
  outputDir: string;
  slug: string;
  industry: string;
  archetype: Archetype;
  archetypeMapping: ArchetypeMapping;
  regionId: string;
  brandColors: BrandColors;
  photos: string[];
  photoCount: number;
  config: IndustryDesign & { schemaOrgType: string };
}

// ── Business.ts skeleton ─────────────────────────────────────────

/**
 * Pick the hero image from the photo list.
 * Convention: NEVER use maps-1 (exterior shot) as hero — prefer maps-2+
 * (interior / food / ambience). Falls back to the first non-maps-1 photo.
 */
function pickHeroPhoto(photos: string[]): string {
  const non1 = photos.filter(p => !p.startsWith('maps-1'));
  const pick = non1[0] ?? photos[0];
  return pick ? `/images/${pick.replace('.jpg', '-960.webp')}` : '';
}

function generateBusinessSkeleton(
  lead: PlaceResult,
  industry: string,
  colors: BrandColors,
  config: IndustryDesign,
  photos: string[],
  slug: string,
  outputDir: string,
  _locales: string[] = ['en']
) {
  const schemaType = SCHEMA_ORG_TYPE[industry] || 'LocalBusiness';
  const hero = pickHeroPhoto(photos);
  const gallery = photos
    .filter(p => !p.startsWith('maps-1'))
    .slice(1)
    .map(p => `/images/${p.replace('.jpg', '-960.webp')}`);

  const name = lead.displayName.text;
  const address = lead.formattedAddress;
  const phone = lead.nationalPhoneNumber || '';
  const whatsapp = phone ? phone.replace(/[^+0-9]/g, '') : '';
  const rating = lead.rating || 0;
  const reviewCount = lead.userRatingCount || 0;
  const mapsUrl = lead.googleMapsUri || '';

  const hours: Record<string, string> = {};
  for (const row of lead.regularOpeningHours?.weekdayDescriptions || []) {
    const [day, ...rest] = row.split(': ');
    if (day && rest.length > 0) {
      hours[day] = rest.join(': ');
    }
  }

  const localeBlock = (locale: string) => `{
      meta: { title: ${JSON.stringify(name)}, description: "" },
      hero: { title: "", subtitle: "", cta: "", image: ${JSON.stringify(hero)} },
      hours: ${JSON.stringify(hours)},
      location: { address: ${JSON.stringify(address)}, mapsUrl: ${JSON.stringify(mapsUrl)}${lead.location ? `, coordinates: { lat: ${lead.location.latitude}, lng: ${lead.location.longitude} }` : ''} },
      contact: { phone: ${JSON.stringify(phone)}${whatsapp ? `, whatsapp: ${JSON.stringify(whatsapp)}` : ''} },
      reviews: { rating: ${rating}, count: ${reviewCount}, featured: [] },
      trustBar: {
        items: [
          { icon: "star", label: "Rating", value: ${JSON.stringify(`${rating}/5`)} },
          { icon: "users", label: "Reviews", value: ${JSON.stringify(`${reviewCount}+`)} },
          { icon: "map-pin", label: "Locale", value: ${JSON.stringify(locale)} },
        ],
      },
    }`;

  const locales = _locales;
  const contentEntries = locales
    .map((locale: string) => `    ${JSON.stringify(locale)}: ${localeBlock(locale)}`)
    .join(',\n');

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
    heroImage: ${JSON.stringify(hero)},
    galleryImages: ${JSON.stringify(gallery)},
  },
  content: {
${contentEntries}
  },
};
`;
  fs.mkdirSync(path.join(outputDir, 'src/data'), { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'src/data/business.ts'), ts);
}

// ── Save lead.json for traceability ──────────────────────────────

/** Extract search keywords from lead data for stock photo queries */
function extractPhotoKeywords(lead: PlaceResult, industry: string, regionSkipWords: string[] = []): string[] {
  const keywords: string[] = [];

  // Use primaryType as keyword (replace underscores with spaces)
  if (lead.primaryType) {
    keywords.push(lead.primaryType.replace(/_/g, ' '));
  }

  // Extract relevant words from business name
  const defaultSkip = ['sdn', 'bhd', 'enterprise', 'trading', 'the', 'and', 'or', 'di', 'dan'];
  const skipWordsSet = new Set([...defaultSkip, ...regionSkipWords]);
  const nameWords = lead.displayName.text.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !skipWordsSet.has(w));
  if (nameWords.length > 0) {
    keywords.push(nameWords.slice(0, 3).join(' '));
  }

  return keywords.length > 0 ? keywords : [industry];
}

function saveLeadJson(lead: PlaceResult, industry: string, archetype: Archetype, regionId: string, outputDir: string) {
  fs.writeFileSync(path.join(outputDir, 'lead.json'), JSON.stringify({
    place_id: lead.id,
    name: lead.displayName.text,
    industry,
    archetype,
    regionId,
    address: lead.formattedAddress,
    phone: lead.nationalPhoneNumber,
    rating: lead.rating,
    reviews: lead.userRatingCount,
    mapsUrl: lead.googleMapsUri,
    timestamp: new Date().toISOString(),
  }, null, 2));
}

// ── Main pipeline ────────────────────────────────────────────────

export async function prepare(lead: PlaceResult, industry?: string, regionId?: string): Promise<PrepareResult> {
  // Zero-config: auto-detect region from address if not explicitly provided
  const resolvedRegionId = regionId ?? detectRegionId(lead.formattedAddress);

  // Derive location hint from lead address for stock photo queries
  let regionNameKeywords: Record<string, RegExp> | undefined;
  const locationHint = lead.formattedAddress.split(',').pop()?.trim().toLowerCase() || 'local';
  const skipWords: string[] = [];

  const resolvedIndustry = industry || classifyIndustry(lead.primaryType, lead.displayName.text, regionNameKeywords);
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

  // 3. Stock photos if needed (with keywords from lead)
  const imgDir = path.join(outputDir, 'public/images');
  const jpgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
  if (jpgs.length < 3) {
    const photoKeywords = extractPhotoKeywords(lead, resolvedIndustry, skipWords);
    console.error(`  Only ${jpgs.length} photos, fetching stock...`);
    console.error(`  Stock photo keywords: ${photoKeywords.join(', ')}`);
    await downloadStockPhotos(resolvedIndustry, imgDir, 3 - jpgs.length, photoKeywords, locationHint);
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
  copyTemplates(resolvedIndustry, outputDir, ['en'], 'en');

  // 8. Write SVG decorations
  writeSvgDecorations(resolvedIndustry, outputDir);

  // 8b. Generate industry-specific favicon from brand colors
  const faviconFn = INDUSTRY_FAVICON[resolvedIndustry] || INDUSTRY_FAVICON.generic;
  const faviconSvg = faviconFn(colors.primary, colors.onPrimary);
  fs.writeFileSync(path.join(outputDir, 'public/favicon.svg'), faviconSvg);
  console.error(`  Favicon: ${resolvedIndustry} icon on ${colors.primary}`);

  // 9. Generate business.ts skeleton
  console.error('  Generating business.ts skeleton...');
  generateBusinessSkeleton(lead, resolvedIndustry, colors, config, allJpgs, slug, outputDir, ['en']);

  // 10. Resolve archetype
  const archetypeMapping = resolveArchetype(resolvedIndustry);
  const archetype = archetypeMapping.primary;
  console.error(`  Archetype: ${archetype}${archetypeMapping.secondary ? ` (secondary: ${archetypeMapping.secondary})` : ''}`);

  // 11. Save lead.json for traceability
  saveLeadJson(lead, resolvedIndustry, archetype, resolvedRegionId, outputDir);

  console.error(`  Region: ${resolvedRegionId}${regionId ? '' : ' (auto-detected)'}`);
  console.error(`  ✓ Ready for design at ${outputDir}`);

  // Notify n8n (optional, fire-and-forget)
  logAction({ place_id: lead.id, slug, action: 'prepared', result: outputDir, industry: resolvedIndustry });

  const result: PrepareResult = {
    outputDir,
    slug,
    industry: resolvedIndustry,
    archetype,
    archetypeMapping,
    regionId: resolvedRegionId,
    brandColors: colors,
    photos: allJpgs,
    photoCount: allJpgs.length,
    config: { ...config, schemaOrgType },
  };

  return result;
}

// ── CLI ──────────────────────────────────────────────────────────

function parseLead(raw: unknown): PlaceResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Lead data must be a JSON object');
  }
  const obj = raw as Record<string, unknown>;
  if (!obj.id || !obj.displayName) {
    throw new Error(
      'Lead must have at least "id" and "displayName" fields.\n' +
      'Use search.ts default output (full PlaceResult format), not --compact.'
    );
  }
  return raw as PlaceResult;
}

if (require.main === module) {
  const args = process.argv.slice(2);

  const leadJson = getArg(args, 'lead', '');
  const leadFile = getArg(args, 'lead-file', '');
  const industry = getArg(args, 'industry', '');
  const regionId = getArg(args, 'region', '') || undefined;
  const index = parseInt(getArg(args, 'index', '0'), 10);

  if (!leadJson && !leadFile) {
    console.error(
      'Usage:\n' +
      '  npx tsx packages/pipeline/prepare.ts --lead-file leads.json [--index 0] [--industry food]\n' +
      '  npx tsx packages/pipeline/prepare.ts --lead \'{"id":"...","displayName":{"text":"..."},...}\' [--industry food]\n\n' +
      'Typical workflow:\n' +
      '  npx tsx packages/discover/search.ts --city "KL" --category "food" --out leads.json\n' +
      '  npx tsx packages/pipeline/prepare.ts --lead-file leads.json --index 0'
    );
    process.exit(1);
  }

  let lead: PlaceResult;
  try {
    let raw: unknown;
    if (leadFile) {
      if (!fs.existsSync(leadFile)) {
        console.error(`File not found: ${leadFile}`);
        process.exit(1);
      }
      raw = JSON.parse(fs.readFileSync(leadFile, 'utf8'));
    } else {
      raw = JSON.parse(leadJson);
    }

    // Support both single object and array (pick by --index)
    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        console.error('Error: lead array is empty');
        process.exit(1);
      }
      if (index >= raw.length) {
        console.error(`Error: --index ${index} out of range (array has ${raw.length} items)`);
        process.exit(1);
      }
      console.error(`Selecting lead [${index}] of ${raw.length}: ${(raw[index] as Record<string, unknown>).displayName ? ((raw[index] as Record<string, {text: string}>).displayName?.text) : 'unknown'}`);
      raw = raw[index];
    }

    lead = parseLead(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    process.exit(1);
  }

  prepare(lead, industry || undefined, regionId)
    .then((result) => {
      // stdout: clean JSON for Claude to consume
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
