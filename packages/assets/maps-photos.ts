import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';

const API_KEY = requireEnv('GOOGLE_API_KEY');

/**
 * Download photos from Google Maps Places API (New).
 * @param photoNames - array of photo resource names from search results (e.g., "places/xxx/photos/yyy")
 * @param outputDir - directory to save photos (e.g., "output/{slug}/public/images")
 * @param maxPhotos - max number of photos to download (default 5)
 */
export async function downloadMapsPhotos(
  photoNames: string[],
  outputDir: string,
  maxPhotos: number = 5
): Promise<string[]> {
  fs.mkdirSync(outputDir, { recursive: true });

  const downloaded: string[] = [];
  const toDownload = photoNames.slice(0, maxPhotos);

  for (let i = 0; i < toDownload.length; i++) {
    const photoName = toDownload[i];
    // NOTE: Google Places Photo Media API requires key as URL param (not header).
    // Ensure GOOGLE_API_KEY has restricted referrers/IP in Google Cloud Console.
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=1200&key=${API_KEY}`;

    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      console.warn(`Failed to download photo ${i}: ${res.status}`);
      continue;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = `maps-${i + 1}.jpg`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, buffer);
    downloaded.push(filepath);
    console.log(`Downloaded: ${filename} (${buffer.length} bytes)`);
  }

  return downloaded;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const photosJson = getArg('photos', '[]');
  const outputDir = getArg('output', 'output/test/public/images');

  let photoNames: string[];
  try {
    photoNames = JSON.parse(photosJson);
  } catch {
    console.error('Invalid --photos JSON array');
    process.exit(1);
  }

  downloadMapsPhotos(photoNames, outputDir)
    .then((files) => console.log(`\nDownloaded ${files.length} photos`))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
