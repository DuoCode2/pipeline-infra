import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { getArg } from '../utils/cli';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const GOOGLE_FONTS_CSS_BASE = 'https://fonts.googleapis.com/css2';

/**
 * Unicode-range subsets to keep. Google Fonts splits fonts by script.
 * For English-only sites we only need Latin (base + extended covers accented chars).
 * Each entry is a substring that appears in the Google Fonts CSS `unicode-range` line.
 */
const LATIN_RANGE_MARKERS = [
  'U+0000-00FF',   // Latin (base ASCII + common symbols)
  'U+0100-02BA',   // Latin Extended (accented characters, ligatures)
];

function isLatinSubset(block: string): boolean {
  const rangeMatch = block.match(/unicode-range:\s*([^;]+)/);
  if (!rangeMatch) return true; // no unicode-range = keep it
  const range = rangeMatch[1];
  return LATIN_RANGE_MARKERS.some(marker => range.includes(marker));
}

/**
 * Build the Google Fonts CSS URL for the requested families and weights.
 */
function buildCssUrl(fonts: string[], weights: number[]): string {
  const weightStr = weights.join(';');
  const familyParams = fonts
    .map((f) => `family=${encodeURIComponent(f)}:wght@${weightStr}`)
    .join('&');
  return `${GOOGLE_FONTS_CSS_BASE}?${familyParams}&display=swap`;
}

/**
 * Sanitize a font-family name for use as a filename.
 * e.g. "Cormorant Garamond" → "cormorant-garamond"
 */
function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parse @font-face blocks from Google Fonts CSS.
 * Extracts font-family, font-weight, and woff2 URL from each block.
 */
function parseFontFaces(css: string): Array<{
  family: string;
  weight: string;
  url: string;
  block: string;
}> {
  const blocks: Array<{
    family: string;
    weight: string;
    url: string;
    block: string;
  }> = [];

  const blockRegex = /@font-face\s*\{[^}]+\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(css)) !== null) {
    const block = match[0];

    const familyMatch = block.match(/font-family:\s*['"]([^'"]+)['"]/);
    if (!familyMatch) continue;
    const family = familyMatch[1];

    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    if (!weightMatch) continue;
    const weight = weightMatch[1];

    const urlMatch = block.match(
      /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/
    );
    if (!urlMatch) continue;
    const url = urlMatch[1];

    blocks.push({ family, weight, url, block });
  }

  return blocks;
}

export interface DownloadFontsOptions {
  /** Font family names (e.g. ["Montserrat", "Source Sans 3"]) */
  fonts: string[];
  /** Font weights to download (e.g. [400, 500, 600, 700]) */
  weights: number[];
  /** Output directory for .woff2 files and font-face.css */
  outputDir: string;
  /** Only keep Latin subsets (default: true). Set false for multi-script sites. */
  latinOnly?: boolean;
}

/**
 * Download Google Font families as .woff2 files for self-hosting.
 *
 * Improvements over naive approach:
 * - Filters to Latin-only subsets by default (saves ~85% for English sites)
 * - Only downloads requested weights
 */
export async function downloadFonts(
  fonts: string[],
  weights: number[],
  outputDir: string,
  latinOnly: boolean = true,
): Promise<void> {
  fs.mkdirSync(outputDir, { recursive: true });

  const cssUrl = buildCssUrl(fonts, weights);
  console.log(`Fetching Google Fonts CSS…`);
  console.log(`  URL: ${cssUrl}`);

  const cssResponse = await fetch(cssUrl, {
    headers: { 'User-Agent': CHROME_UA },
  });

  if (!cssResponse.ok) {
    throw new Error(
      `Failed to fetch Google Fonts CSS: ${cssResponse.status} ${cssResponse.statusText}`
    );
  }

  const css = await cssResponse.text();
  let faces = parseFontFaces(css);

  if (faces.length === 0) {
    throw new Error(
      'No @font-face blocks found in CSS. Check font names and weights.'
    );
  }

  const totalFaces = faces.length;

  // Filter to Latin subsets only (English-only sites don't need Cyrillic, Vietnamese, etc.)
  if (latinOnly) {
    faces = faces.filter(f => isLatinSubset(f.block));
    console.log(`  Filtered: ${faces.length}/${totalFaces} @font-face rules (Latin only)`);
  } else {
    console.log(`  Found ${faces.length} @font-face rules (all subsets)`);
  }

  // Download each woff2 file and build rewritten CSS
  const seen = new Map<string, number>();
  let rewrittenCss = '';
  let downloaded = 0;

  for (const face of faces) {
    const key = `${sanitizeName(face.family)}-${face.weight}`;
    const idx = (seen.get(key) || 0);
    seen.set(key, idx + 1);
    const filename = idx === 0 ? `${key}.woff2` : `${key}-${idx}.woff2`;
    const outPath = path.join(outputDir, filename);

    try {
      console.log(`  Downloading ${filename}…`);
      const fontResponse = await fetch(face.url, {
        headers: { 'User-Agent': CHROME_UA },
      });

      if (!fontResponse.ok) {
        console.warn(
          `  ⚠ Failed to download ${filename}: ${fontResponse.status} ${fontResponse.statusText}`
        );
        continue;
      }

      const buffer = Buffer.from(await fontResponse.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      downloaded++;

      const rewrittenBlock = face.block.replace(
        /url\(https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2\)/,
        `url(./${filename})`
      );
      rewrittenCss += rewrittenBlock + '\n\n';
    } catch (err) {
      console.warn(
        `  ⚠ Error downloading ${filename}: ${(err as Error).message}`
      );
    }
  }

  const cssPath = path.join(outputDir, 'font-face.css');
  fs.writeFileSync(cssPath, rewrittenCss.trim() + '\n');
  console.log(`\nSaved font-face.css → ${cssPath}`);
  console.log(
    `Downloaded ${downloaded} font files to ${path.resolve(outputDir)}`
  );
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const fontsRaw = getArg(args, 'fonts', '');
  const weightsRaw = getArg(args, 'weights', '400,500,600,700');
  const outputDir = getArg(args, 'output', 'output/test/public/fonts');

  if (!fontsRaw) {
    console.error(
      'Usage: npx tsx packages/assets/download-fonts.ts --fonts "Cormorant Garamond,Quicksand" --weights "300,400,500,600,700,800" --output output/slug/public/fonts'
    );
    process.exit(1);
  }

  const fonts = fontsRaw.split(',').map((f) => f.trim());
  const weights = weightsRaw.split(',').map((w) => parseInt(w.trim(), 10));

  downloadFonts(fonts, weights, outputDir).catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
