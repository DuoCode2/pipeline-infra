/**
 * Simplified site generation for the multi-tenant architecture.
 *
 * discover lead → generateSite() → SiteData JSON + images saved → done
 * No npm install, no build, no per-site deploy. The multi-tenant app serves it immediately.
 *
 * Usage:
 *   npx tsx packages/pipeline/generate-site.ts --lead-file leads.json --index 0
 *   npx tsx packages/pipeline/generate-site.ts --lead '{"id":"...","displayName":{"text":"..."},...}'
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { downloadMapsPhotos } from '../assets/maps-photos';
import { downloadStockPhotos } from '../assets/stock-photos';
import { extractAndSave, type BrandColors } from '../assets/extract-colors';
import { optimizeImages } from '../assets/optimize-images';
import {
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
  classifyIndustry,
  slugify,
} from '../generate/industry-config';
import { resolveArchetype } from '../generate/archetype-config';
import { type PlaceResult } from '../discover/search';
import { getArg } from '../utils/cli';
import { logAction } from '../utils/n8n';

// ── Types ─────────────────────────────────────────────────────────

interface SiteRegion {
  country: string;
  locales: string[];
  defaultLocale: string;
  currency: { symbol: string; code: string };
  phone: { countryCode: string };
  cultural?: {
    halalBadge?: boolean;
    prayerRoom?: boolean;
    festiveNotes?: string[];
  };
}

interface SiteData {
  slug: string;
  businessName: string;
  archetype: string;
  industry: string;
  region: SiteRegion;
  theme: {
    primary: string;
    primaryDark: string;
    accent: string;
    surface: string;
    textTitle: string;
    textBody: string;
    onPrimary: string;
    onPrimaryDark: string;
    accentText: string;
    fontDisplay: string;
    fontBody: string;
  };
  assets: {
    heroImage: string;
    galleryImages: string[];
  };
  content: Record<string, any>;
  lead: {
    placeId: string;
    primaryType?: string;
    googleMapsUri?: string;
    rating: number;
    reviewCount: number;
    discoveredAt: string;
  };
}

// ── Zero-config country detection ────────────────────────────────
// Any country works — no registration needed. Currency/phone come from lead data.

function detectRegion(address: string, phone?: string): SiteRegion {
  const country = address.split(',').pop()?.trim() || 'Unknown';
  return {
    country,
    locales: ['en'],
    defaultLocale: 'en',
    currency: { symbol: '$', code: 'USD' },
    phone: { countryCode: phone?.match(/^\+\d+/)?.[0] || '' },
  };
}

// ── Hero photo selection ─────────────────────────────────────────

function pickHeroPhoto(slug: string, photos: string[]): string {
  const non1 = photos.filter(p => !p.startsWith('maps-1'));
  const pick = non1[0] ?? photos[0];
  return pick ? `/sites/${slug}/images/${pick.replace('.jpg', '-960.webp')}` : '';
}

// ── Content skeleton generation ──────────────────────────────────

function generateContentSkeleton(
  lead: PlaceResult,
  region: SiteRegion,
  heroImage: string,
): Record<string, any> {
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
    if (day && rest.length > 0) hours[day] = rest.join(': ');
  }

  const content: Record<string, any> = {};
  for (const locale of region.locales) {
    content[locale] = {
      meta: { title: name, description: '' },
      hero: { title: '', subtitle: '', cta: '', image: heroImage },
      hours,
      location: {
        address,
        mapsUrl,
        ...(lead.location ? { coordinates: { lat: lead.location.latitude, lng: lead.location.longitude } } : {}),
      },
      contact: {
        phone,
        ...(whatsapp ? { whatsapp } : {}),
      },
      reviews: { rating, count: reviewCount, featured: [] },
      trustBar: {
        items: [
          { icon: 'star', label: 'Rating', value: `${rating}/5` },
          { icon: 'users', label: 'Reviews', value: `${reviewCount}+` },
        ],
      },
    };
  }
  return content;
}

// ── Main pipeline ────────────────────────────────────────────────

export async function generateSite(lead: PlaceResult): Promise<SiteData> {
  const name = lead.displayName.text;
  const slug = slugify(name);
  const industry = classifyIndustry(lead.primaryType, name);
  const archetype = resolveArchetype(industry).primary;
  const config = INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.generic;
  const region = detectRegion(lead.formattedAddress, lead.nationalPhoneNumber);

  console.error(`\n━━ Generating: ${name} (${industry} → ${archetype}) ━━`);
  console.error(`  Region: ${region.country} (${region.locales.join(', ')})`);

  // Image output goes to the multi-tenant web app's public directory
  const appDir = path.resolve(__dirname, '../../web');
  const imgDir = path.join(appDir, 'public/sites', slug, 'images');
  fs.mkdirSync(imgDir, { recursive: true });

  // 1. Download Maps photos
  const photoNames = (lead.photos || []).map(p => p.name).slice(0, 5);
  if (photoNames.length > 0) {
    console.error(`  Downloading ${photoNames.length} Maps photos...`);
    await downloadMapsPhotos(photoNames, imgDir, 3);
  }

  // 2. Stock photos if needed
  const jpgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
  if (jpgs.length < 3) {
    console.error(`  Only ${jpgs.length} photos, fetching stock...`);
    const locationHint = region.country.toLowerCase();
    await downloadStockPhotos(industry, imgDir, 3 - jpgs.length, undefined, locationHint);
  }

  // 3. Optimize images
  console.error('  Optimizing images to WebP...');
  await optimizeImages(imgDir);

  // 4. Extract brand colors
  const allJpgs = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));
  const colorSource = allJpgs.find(f => f.includes('maps-2')) || allJpgs[0];
  const colorsDir = path.join(appDir, 'src/data/sites');
  fs.mkdirSync(colorsDir, { recursive: true });
  let colors: BrandColors;
  if (colorSource) {
    console.error(`  Extracting brand colors from ${colorSource}...`);
    colors = await extractAndSave(path.join(imgDir, colorSource), colorsDir);
  } else {
    colors = await extractAndSave('nonexistent', colorsDir);
  }

  // 5. Build SiteData
  const heroImage = pickHeroPhoto(slug, allJpgs);
  const galleryImages = allJpgs
    .filter(p => !p.startsWith('maps-1'))
    .slice(1)
    .map(p => `/sites/${slug}/images/${p.replace('.jpg', '-960.webp')}`);

  const content = generateContentSkeleton(lead, region, heroImage);

  const siteData: SiteData = {
    slug,
    businessName: name,
    archetype,
    industry,
    region,
    theme: {
      primary: colors.primary,
      primaryDark: colors.primaryDark,
      accent: colors.accent,
      surface: colors.surface,
      textTitle: colors.textTitle,
      textBody: colors.textBody,
      onPrimary: colors.onPrimary,
      onPrimaryDark: colors.onPrimaryDark,
      accentText: colors.accentText,
      fontDisplay: config.fontDisplay,
      fontBody: config.fontBody,
    },
    assets: { heroImage, galleryImages },
    content,
    lead: {
      placeId: lead.id,
      primaryType: lead.primaryType,
      googleMapsUri: lead.googleMapsUri,
      rating: lead.rating || 0,
      reviewCount: lead.userRatingCount || 0,
      discoveredAt: new Date().toISOString(),
    },
  };

  // 6. Save JSON
  const jsonPath = path.join(appDir, 'src/data/sites', `${slug}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(siteData, null, 2));
  console.error(`  ✓ Saved: ${jsonPath}`);

  // Clean up brand-colors.json from colorsDir (extractAndSave writes it there)
  const tempColors = path.join(colorsDir, 'brand-colors.json');
  if (fs.existsSync(tempColors)) fs.unlinkSync(tempColors);

  // Log to n8n
  logAction({ place_id: lead.id, slug, action: 'generated', result: `/demo/${slug}`, industry });

  console.error(`  ✓ Site ready at /demo/${slug}/${region.defaultLocale}`);
  return siteData;
}

// ── CLI ──────────────────────────────────────────────────────────

function parseLead(raw: unknown): PlaceResult {
  if (!raw || typeof raw !== 'object') throw new Error('Lead data must be a JSON object');
  const obj = raw as Record<string, unknown>;
  if (!obj.id || !obj.displayName) {
    throw new Error('Lead must have "id" and "displayName" fields (full PlaceResult format).');
  }
  return raw as PlaceResult;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const leadJson = getArg(args, 'lead', '');
  const leadFile = getArg(args, 'lead-file', '');
  const index = parseInt(getArg(args, 'index', '0'), 10);

  if (!leadJson && !leadFile) {
    console.error(
      'Usage:\n' +
      '  npx tsx packages/pipeline/generate-site.ts --lead-file leads.json [--index 0]\n' +
      '  npx tsx packages/pipeline/generate-site.ts --lead \'{"id":"...","displayName":{"text":"..."},...}\'\n'
    );
    process.exit(1);
  }

  let lead: PlaceResult;
  try {
    let raw: unknown;
    if (leadFile) {
      if (!fs.existsSync(leadFile)) { console.error(`File not found: ${leadFile}`); process.exit(1); }
      raw = JSON.parse(fs.readFileSync(leadFile, 'utf8'));
    } else {
      raw = JSON.parse(leadJson);
    }

    if (Array.isArray(raw)) {
      if (index >= raw.length) { console.error(`--index ${index} out of range (${raw.length} items)`); process.exit(1); }
      console.error(`Selecting lead [${index}] of ${raw.length}: ${(raw[index] as any).displayName?.text || 'unknown'}`);
      raw = raw[index];
    }
    lead = parseLead(raw);
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  generateSite(lead)
    .then((site) => {
      console.log(JSON.stringify({ slug: site.slug, archetype: site.archetype, industry: site.industry, region: site.region.country, url: `/demo/${site.slug}/${site.region.defaultLocale}` }, null, 2));
    })
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
