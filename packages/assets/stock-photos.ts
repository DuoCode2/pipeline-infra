import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';
import { getArg } from '../utils/cli';

const UNSPLASH_KEY = requireEnv('UNSPLASH_ACCESS_KEY');
const UNSPLASH_URL = 'https://api.unsplash.com/search/photos';

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  user: { name: string; links: { html: string } };
  links: { html: string };
  alt_description: string | null;
}

interface Attribution {
  source: 'unsplash';
  photos: Array<{
    id: string;
    photographer: string;
    photographerUrl: string;
    photoUrl: string;
    altDescription: string;
  }>;
}

/** Industry → search terms for stock photos (first term is primary) */
const INDUSTRY_PHOTO_KEYWORDS: Record<string, string[]> = {
  food: ['restaurant interior dining', 'cafe food plating', 'kitchen cooking'],
  beauty: ['beauty salon interior', 'spa treatment room', 'hairdresser styling'],
  clinic: ['medical clinic modern', 'dental office clean', 'healthcare interior'],
  retail: ['retail store display', 'shop interior shelves', 'boutique storefront'],
  fitness: ['gym interior equipment', 'fitness center modern', 'yoga studio'],
  service: ['professional office interior', 'workshop workspace', 'service counter'],
  automotive: ['auto repair shop garage', 'car service mechanic', 'automotive workshop tools'],
  tech: ['phone repair shop', 'electronics workshop tools', 'computer repair store'],
  generic: ['small business storefront', 'modern office interior', 'workspace professional'],
};

/**
 * Search and download stock photos from Unsplash.
 * @param industry - business industry for search query
 * @param outputDir - directory to save photos
 * @param count - number of photos (default 3)
 * @param keywords - optional specific search keywords (overrides industry default)
 */
export async function downloadStockPhotos(
  industry: string,
  outputDir: string,
  count: number = 3,
  keywords?: string[]
): Promise<{ files: string[]; attribution: Attribution }> {
  fs.mkdirSync(outputDir, { recursive: true });

  // Build query: prefer explicit keywords, else use industry map
  const searchTerms = keywords?.length
    ? keywords.join(' ')
    : (INDUSTRY_PHOTO_KEYWORDS[industry] || INDUSTRY_PHOTO_KEYWORDS.generic)[0];
  const query = `${searchTerms} malaysia`;

  let data = await fetchUnsplash(query, count);

  // Retry with broadened query if no results
  if (data.results.length === 0 && keywords?.length) {
    const fallback = (INDUSTRY_PHOTO_KEYWORDS[industry] || INDUSTRY_PHOTO_KEYWORDS.generic)[0];
    console.warn(`  No Unsplash results for "${query}", retrying with "${fallback} malaysia"...`);
    data = await fetchUnsplash(`${fallback} malaysia`, count);
  }

  // Second fallback: just industry name
  if (data.results.length === 0) {
    console.warn(`  Still no results, trying "${industry} business"...`);
    data = await fetchUnsplash(`${industry} business`, count);
  }

  const files: string[] = [];
  const attribution: Attribution = { source: 'unsplash', photos: [] };

  for (let i = 0; i < data.results.length; i++) {
    const photo = data.results[i];

    const imgRes = await fetch(photo.urls.regular);
    if (!imgRes.ok) {
      console.warn(`Failed to download stock photo ${i}: ${imgRes.status}`);
      continue;
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const filename = `stock-${i + 1}.jpg`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    files.push(filepath);

    attribution.photos.push({
      id: photo.id,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      photoUrl: photo.links.html,
      altDescription: photo.alt_description || '',
    });

    console.log(`Downloaded: ${filename} by ${photo.user.name}`);
  }

  // Write attribution.json to site root (alongside brand-colors.json)
  const siteRoot = path.resolve(outputDir, '../..');
  const attrPath = path.join(siteRoot, 'attribution.json');
  fs.writeFileSync(attrPath, JSON.stringify(attribution, null, 2));

  return { files, attribution };
}

/** Fetch from Unsplash API with orientation=landscape and content_filter=high */
async function fetchUnsplash(query: string, count: number) {
  const url = `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape&content_filter=high`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Unsplash API ${res.status}: ${await res.text()}`);
  }

  return (await res.json()) as { results: UnsplashPhoto[] };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const industry = getArg(args, 'industry', 'food');
  const outputDir = getArg(args, 'output', 'output/test/public/images');

  downloadStockPhotos(industry, outputDir)
    .then(({ files }) => console.log(`\nDownloaded ${files.length} stock photos`))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
