import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';
import { getArg } from '../utils/cli';

const API_KEY = requireEnv('GOOGLE_API_KEY');

// Align with optimize-images.ts max output width (1280px).
const MAX_WIDTH_PX = 1280;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(url: string, retries: number = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { redirect: 'follow' });
    if (res.ok) return res;

    // Retry on transient errors (429, 5xx). Don't retry on 4xx (except 429).
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= retries) {
      return res; // Return the failed response for caller to handle
    }

    const delay = RETRY_DELAY_MS * (attempt + 1); // Linear backoff
    console.warn(`  Retry ${attempt + 1}/${retries} for photo (${res.status}), waiting ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
  }
  // Unreachable, but TypeScript needs it
  throw new Error('fetchWithRetry: exhausted retries');
}

/**
 * Download photos from Google Maps Places API (New).
 *
 * Uses maxWidthPx (not maxHeightPx) since our images are landscape-oriented
 * and the pipeline generates width-based responsive variants (320/640/960/1280).
 *
 * @param photoNames - array of photo resource names from search results
 * @param outputDir - directory to save photos
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
    const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${MAX_WIDTH_PX}&key=${API_KEY}`;

    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.warn(`  Failed to download photo ${i + 1} after retries: ${res.status}`);
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
  const photosJson = getArg(args, 'photos', '[]');
  const outputDir = getArg(args, 'output', 'output/test/public/images');

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
