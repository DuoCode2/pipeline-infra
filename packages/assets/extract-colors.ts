import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Vibrant } from 'node-vibrant/node';

export interface BrandColors {
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
  textTitle: string;
  textBody: string;
}

const DEFAULT_COLORS: BrandColors = {
  primary: '#2563EB',
  primaryDark: '#1E3A5F',
  accent: '#F59E0B',
  surface: '#FAFAFA',
  textTitle: '#1A1A2E',
  textBody: '#4A4A68',
};

function hexFromRgb(rgb: number[]): string {
  return (
    '#' +
    rgb
      .map((c) => Math.round(c).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function luminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(h => {
    const v = parseInt(h, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract brand colors from a business photo using node-vibrant.
 * Maps the 6 palette swatches to semantic CSS variable names.
 * @param imagePath - path to the source image
 * @returns BrandColors object with hex values
 */
export async function extractColors(imagePath: string): Promise<BrandColors> {
  if (!fs.existsSync(imagePath)) {
    console.warn(`Image not found: ${imagePath}, using defaults`);
    return { ...DEFAULT_COLORS };
  }

  const palette = await Vibrant.from(imagePath).getPalette();

  const colors: BrandColors = {
    primary: palette.Vibrant
      ? hexFromRgb(palette.Vibrant.rgb)
      : DEFAULT_COLORS.primary,
    primaryDark: palette.DarkVibrant
      ? hexFromRgb(palette.DarkVibrant.rgb)
      : DEFAULT_COLORS.primaryDark,
    accent: palette.LightVibrant
      ? hexFromRgb(palette.LightVibrant.rgb)
      : DEFAULT_COLORS.accent,
    surface: palette.LightMuted
      ? hexFromRgb(palette.LightMuted.rgb)
      : DEFAULT_COLORS.surface,
    textTitle: palette.DarkMuted
      ? hexFromRgb(palette.DarkMuted.rgb)
      : DEFAULT_COLORS.textTitle,
    textBody: palette.Muted
      ? hexFromRgb(palette.Muted.rgb)
      : DEFAULT_COLORS.textBody,
  };

  return colors;
}

/**
 * Extract colors and write brand-colors.json to the output directory.
 */
export async function extractAndSave(
  imagePath: string,
  outputDir: string
): Promise<BrandColors> {
  const colors = await extractColors(imagePath);

  // WCAG contrast validation
  const MIN_CONTRAST = 4.5;
  if (contrastRatio(colors.surface, colors.textBody) < MIN_CONTRAST) {
    console.warn(`WCAG: textBody ${colors.textBody} on surface ${colors.surface} fails 4.5:1. Using fallback.`);
    colors.textBody = '#333333';
  }
  if (contrastRatio(colors.surface, colors.textTitle) < MIN_CONTRAST) {
    console.warn(`WCAG: textTitle ${colors.textTitle} on surface ${colors.surface} fails 4.5:1. Using fallback.`);
    colors.textTitle = '#1a1a1a';
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const outPath = path.join(outputDir, 'brand-colors.json');
  fs.writeFileSync(outPath, JSON.stringify(colors, null, 2));
  console.log(`Brand colors saved to ${outPath}`);
  return colors;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const input = getArg('image', '') || getArg('input', '');
  const output = getArg('output', '');

  if (!input || !output) {
    console.error('Usage: --image <image-path> --output <output-dir>');
    process.exit(1);
  }

  extractAndSave(input, output)
    .then((colors) => console.log('Colors:', colors))
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
