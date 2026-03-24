import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const GOOGLE_FONTS_CSS_BASE = 'https://fonts.googleapis.com/css2';

/**
 * Build the Google Fonts CSS URL for the requested families and weights.
 *
 * Format: https://fonts.googleapis.com/css2?family=Font+Name:wght@300;400;500&family=Other+Font:wght@300;400&display=swap
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

  // Match each @font-face block
  const blockRegex = /@font-face\s*\{[^}]+\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(css)) !== null) {
    const block = match[0];

    // Extract font-family
    const familyMatch = block.match(/font-family:\s*['"]([^'"]+)['"]/);
    if (!familyMatch) continue;
    const family = familyMatch[1];

    // Extract font-weight
    const weightMatch = block.match(/font-weight:\s*(\d+)/);
    if (!weightMatch) continue;
    const weight = weightMatch[1];

    // Extract woff2 URL
    const urlMatch = block.match(
      /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/
    );
    if (!urlMatch) continue;
    const url = urlMatch[1];

    blocks.push({ family, weight, url, block });
  }

  return blocks;
}

/**
 * Download Google Font families as .woff2 files for self-hosting.
 *
 * Fetches the CSS from Google Fonts, downloads each .woff2 file,
 * then writes a rewritten font-face.css with relative paths.
 *
 * @param fonts - Array of font family names (e.g. ["Cormorant Garamond", "Quicksand"])
 * @param weights - Array of font weights (e.g. [300, 400, 500, 600, 700])
 * @param outputDir - Directory to save .woff2 files and font-face.css
 */
export async function downloadFonts(
  fonts: string[],
  weights: number[],
  outputDir: string
): Promise<void> {
  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  const cssUrl = buildCssUrl(fonts, weights);
  console.log(`Fetching Google Fonts CSS…`);
  console.log(`  URL: ${cssUrl}`);

  // Fetch CSS with Chrome UA to get woff2 format
  const cssResponse = await fetch(cssUrl, {
    headers: { 'User-Agent': CHROME_UA },
  });

  if (!cssResponse.ok) {
    throw new Error(
      `Failed to fetch Google Fonts CSS: ${cssResponse.status} ${cssResponse.statusText}`
    );
  }

  const css = await cssResponse.text();
  const faces = parseFontFaces(css);

  if (faces.length === 0) {
    throw new Error(
      'No @font-face blocks found in CSS. Check font names and weights.'
    );
  }

  console.log(`Found ${faces.length} @font-face rules`);

  // Download each woff2 file and build rewritten CSS
  // Track per-family+weight index for unicode-range subsets
  const seen = new Map<string, number>();
  let rewrittenCss = '';

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

      // Rewrite the CSS block to use the local filename
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

  // Write the rewritten CSS
  const cssPath = path.join(outputDir, 'font-face.css');
  fs.writeFileSync(cssPath, rewrittenCss.trim() + '\n');
  console.log(`\nSaved font-face.css → ${cssPath}`);
  console.log(
    `Downloaded ${faces.length} font files to ${path.resolve(outputDir)}`
  );
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const fontsRaw = getArg('fonts', '');
  const weightsRaw = getArg('weights', '400,500,600,700');
  const outputDir = getArg('output', 'output/test/public/fonts');

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
