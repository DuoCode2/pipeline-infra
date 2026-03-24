import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Vibrant } from 'node-vibrant/node';
import {
  wcagContrast,
  wcagLuminance,
  formatHex,
  clampChroma,
  parse,
  converter,
} from 'culori';

const toOklch = converter('oklch');

export interface BrandColors {
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
  textTitle: string;
  textBody: string;
  // WCAG-safe variants (auto-generated, ≥4.5:1 contrast)
  onPrimary: string;      // text color on primary background
  onPrimaryDark: string;  // text color on primaryDark background
  accentText: string;     // accent adjusted for text use on surface
}

const DEFAULT_COLORS: BrandColors = {
  primary: '#2563EB',
  primaryDark: '#1E3A5F',
  accent: '#F59E0B',
  surface: '#FAFAFA',
  textTitle: '#1A1A2E',
  textBody: '#4A4A68',
  onPrimary: '#FFFFFF',
  onPrimaryDark: '#FFFFFF',
  accentText: '#92400E',
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

/**
 * Adjust a foreground color's lightness in OKLCH space until it meets
 * the required WCAG contrast ratio against the given background.
 * Preserves hue and chroma; clamps to sRGB gamut.
 * Returns the original color unchanged if it already passes.
 */
function ensureContrast(fg: string, bg: string, minRatio: number): string {
  const current = wcagContrast(fg, bg);
  if (current >= minRatio) {
    const parsed = parse(fg);
    return parsed ? formatHex(parsed) : fg;
  }

  const bgLum = wcagLuminance(bg);
  const bgIsLight = bgLum > 0.179;

  const col = toOklch(fg);
  if (!col) return fg;

  // Binary search: darken fg for light bg, lighten fg for dark bg
  let lo = bgIsLight ? 0 : col.l;
  let hi = bgIsLight ? col.l : 1;
  let best = formatHex(col);

  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    col.l = mid;
    const candidate = formatHex(clampChroma(col, 'oklch'));
    const ratio = wcagContrast(candidate, bg);
    if (ratio >= minRatio) {
      best = candidate;
      // Move toward original lightness (minimize change)
      if (bgIsLight) lo = mid;
      else hi = mid;
    } else {
      // Move away from bg (more contrast)
      if (bgIsLight) hi = mid;
      else lo = mid;
    }
  }
  return best;
}

/**
 * Extract brand colors from a business photo using node-vibrant.
 * Maps the 6 palette swatches to semantic CSS variable names.
 */
export async function extractColors(imagePath: string): Promise<BrandColors> {
  if (!fs.existsSync(imagePath)) {
    console.warn(`Image not found: ${imagePath}, using defaults`);
    return { ...DEFAULT_COLORS };
  }

  const palette = await Vibrant.from(imagePath).getPalette();

  const raw = {
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

  return raw as BrandColors;
}

/**
 * Extract colors, enforce WCAG contrast on all pairs, and write brand-colors.json.
 */
export async function extractAndSave(
  imagePath: string,
  outputDir: string
): Promise<BrandColors> {
  const raw = await extractColors(imagePath);

  // ── WCAG enforcement ──────────────────────────────────────────
  // Text on surface: 4.5:1 (normal text)
  raw.textBody = ensureContrast(raw.textBody, raw.surface, 4.5);
  raw.textTitle = ensureContrast(raw.textTitle, raw.surface, 4.5);

  // Primary/accent as large text or icons on surface: 3:1
  raw.primary = ensureContrast(raw.primary, raw.surface, 3.0);
  raw.accent = ensureContrast(raw.accent, raw.surface, 3.0);

  // Text on colored backgrounds — prefer white, adjust if needed
  raw.onPrimary = ensureContrast('#FFFFFF', raw.primary, 4.5);
  raw.onPrimaryDark = ensureContrast('#FFFFFF', raw.primaryDark, 4.5);

  // Accent adjusted for text use on surface (links, highlighted text)
  raw.accentText = ensureContrast(raw.accent, raw.surface, 4.5);

  // Log contrast ratios for debugging
  const pairs: [string, string, string, number][] = [
    ['textBody', raw.textBody, raw.surface, 4.5],
    ['textTitle', raw.textTitle, raw.surface, 4.5],
    ['onPrimary', raw.onPrimary, raw.primary, 4.5],
    ['onPrimaryDark', raw.onPrimaryDark, raw.primaryDark, 4.5],
    ['accentText', raw.accentText, raw.surface, 4.5],
    ['primary (large)', raw.primary, raw.surface, 3.0],
    ['accent (large)', raw.accent, raw.surface, 3.0],
  ];
  for (const [name, fg, bg, threshold] of pairs) {
    const ratio = wcagContrast(fg, bg);
    const status = ratio >= threshold ? 'PASS' : 'FAIL';
    console.log(`  WCAG ${name}: ${fg} on ${bg} → ${ratio.toFixed(2)}:1 [${status}]`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const outPath = path.join(outputDir, 'brand-colors.json');
  fs.writeFileSync(outPath, JSON.stringify(raw, null, 2));
  console.log(`Brand colors saved to ${outPath}`);
  return raw;
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
