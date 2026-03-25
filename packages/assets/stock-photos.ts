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

/**
 * Search and download stock photos from Unsplash.
 * @param industry - business industry for search query
 * @param outputDir - directory to save photos
 * @param count - number of photos (default 3)
 */
export async function downloadStockPhotos(
  industry: string,
  outputDir: string,
  count: number = 3
): Promise<{ files: string[]; attribution: Attribution }> {
  fs.mkdirSync(outputDir, { recursive: true });

  const query = `${industry} interior malaysia`;
  const url = `${UNSPLASH_URL}?query=${encodeURIComponent(query)}&per_page=${count}`;

  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Unsplash API ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as { results: UnsplashPhoto[] };
  const files: string[] = [];
  const attribution: Attribution = { source: 'unsplash', photos: [] };

  for (let i = 0; i < data.results.length; i++) {
    const photo = data.results[i];

    // Download the regular size image
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

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const industry = getArg(args, 'industry', 'restaurant');
  const outputDir = getArg(args, 'output', 'output/test/public/images');

  downloadStockPhotos(industry, outputDir)
    .then(({ files }) => console.log(`\nDownloaded ${files.length} stock photos`))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
