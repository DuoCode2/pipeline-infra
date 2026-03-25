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
import { getArg } from '../utils/cli';

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
  lead: LeadInput,
  industry: string,
  colors: BrandColors,
  config: IndustryDesign,
  photos: string[],
  slug: string,
  outputDir: string
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
      location: { address: ${JSON.stringify(address)}, mapsUrl: ${JSON.stringify(mapsUrl)} },
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
    en: ${localeBlock('en')},
    ms: ${localeBlock('ms')},
    "zh-CN": ${localeBlock('zh-CN')},
    "zh-TW": ${localeBlock('zh-TW')},
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

  const leadJson = getArg(args, 'lead', '');
  const industry = getArg(args, 'industry', '');

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
