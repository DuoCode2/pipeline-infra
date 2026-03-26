/**
 * Translation utility — generates locale content blocks from an English baseline.
 *
 * Usage by Claude during design:
 *   1. Write business.ts with complete English content
 *   2. Run: npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN,zh-TW
 *   3. Script reads business.ts, extracts EN content, asks Claude to translate
 *
 * This script extracts all translatable strings from the EN locale block in business.ts
 * and outputs a translation template that Claude fills in during design.
 *
 * For now: generates a structured JSON template of strings to translate.
 * Claude fills the translations during design using its multilingual capability.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getArg } from './cli';

interface TranslationTemplate {
  sourceLocale: string;
  targetLocales: string[];
  strings: Record<string, string>; // key path → English string
}

/**
 * Extract all string values from a nested object, with dot-separated key paths.
 */
function extractStrings(obj: unknown, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string' && value.trim().length > 0) {
      result[path] = value;
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        Object.assign(result, extractStrings(value[i], `${path}[${i}]`));
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, extractStrings(value, path));
    }
  }
  return result;
}

/**
 * Generate a translation template JSON from the EN content in business.ts.
 * Output: {slug}-translations.json with all strings to translate.
 */
function generateTemplate(dir: string, targetLocales: string[]): TranslationTemplate {
  const businessPath = path.join(dir, 'src/data/business.ts');
  if (!fs.existsSync(businessPath)) {
    throw new Error(`business.ts not found at ${businessPath}`);
  }

  // Read business.ts and extract the EN content block
  // This is a simplified parser — works for the skeleton format from prepare.ts
  const source = fs.readFileSync(businessPath, 'utf8');

  // Find the content object
  const contentMatch = source.match(/content:\s*\{([\s\S]*)\}\s*\};?\s*$/);
  if (!contentMatch) {
    throw new Error('Could not parse content block from business.ts');
  }

  // For the template, just extract all strings from the source
  const strings = extractStrings(parseBusinessStrings(source));

  return {
    sourceLocale: 'en',
    targetLocales,
    strings,
  };
}

/**
 * Simple extraction of hero/meta/contact strings from business.ts source.
 */
function parseBusinessStrings(source: string): Record<string, string> {
  const strings: Record<string, string> = {};

  // Extract quoted strings with their context
  const patterns = [
    /hero:\s*\{[^}]*title:\s*"([^"]*)"/,
    /hero:\s*\{[^}]*subtitle:\s*"([^"]*)"/,
    /hero:\s*\{[^}]*cta:\s*"([^"]*)"/,
    /meta:\s*\{[^}]*title:\s*"([^"]*)"/,
    /meta:\s*\{[^}]*description:\s*"([^"]*)"/,
  ];

  const keys = ['hero.title', 'hero.subtitle', 'hero.cta', 'meta.title', 'meta.description'];

  for (let i = 0; i < patterns.length; i++) {
    const match = source.match(patterns[i]);
    if (match?.[1]) {
      strings[keys[i]] = match[1];
    }
  }

  return strings;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN,zh-TW

Extracts English strings from business.ts and generates a translation template.
Claude uses this template to write other locale blocks during design.

Options:
  --dir <path>      Site output directory
  --locales <list>  Comma-separated target locales (e.g., "ms,zh-CN,zh-TW")
  --help, -h        Show this help message`);
    process.exit(0);
  }

  const dir = getArg(args, 'dir', '');
  const localesStr = getArg(args, 'locales', '');

  if (!dir || !localesStr) {
    console.error('Error: --dir and --locales are required. Use --help for usage info.');
    process.exit(1);
  }

  const locales = localesStr.split(',').map(s => s.trim());

  try {
    const template = generateTemplate(dir, locales);
    const outPath = path.join(dir, 'translation-template.json');
    fs.writeFileSync(outPath, JSON.stringify(template, null, 2));
    console.log(`Translation template saved to ${outPath}`);
    console.log(`Strings to translate: ${Object.keys(template.strings).length}`);
    console.log(`Target locales: ${template.targetLocales.join(', ')}`);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  }
}

export { generateTemplate, extractStrings };
