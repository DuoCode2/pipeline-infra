/**
 * Translate EN content → target locales via Google Translate API v2.
 *
 * Claude Code runs this one command — all translation happens in-script,
 * zero context consumption.
 *
 * Usage:
 *   npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN
 *   npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN --dry-run
 *   npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN --no-cache
 *
 * Requires: GOOGLE_API_KEY in .env (with Cloud Translation API enabled)
 */
import * as fs from 'fs';
import * as path from 'path';
import { getArg, hasFlag } from './cli';
import { requireEnv } from './env';

// ── Types ───────────────────────────────────────────────

interface TranslationJob {
  path: string;
  text: string;
}

interface CacheEntry {
  result: string;
  ts: string;
}

type TranslationCache = Record<string, Record<string, CacheEntry>>;

interface TranslateResult {
  locale: string;
  stringsTranslated: number;
  stringsCached: number;
  stringsSkipped: number;
  qaWarnings: string[];
}

// ── Config ──────────────────────────────────────────────

const GOOGLE_TRANSLATE_V2 = 'https://translation.googleapis.com/language/translate/v2';
const BATCH_SIZE = 100; // Google v2 limit: 128 segments per request
const BATCH_DELAY_MS = 100; // small delay between batches to avoid rate limits
// Resolve from project root, not CWD — works from worktrees and subdirectories
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CACHE_PATH = path.join(PROJECT_ROOT, 'data', 'translation-cache.json');

// ── Field classification ────────────────────────────────
// Paths matching these patterns are NOT sent to the translation API.

const SKIP_PATTERNS: RegExp[] = [
  // URLs, images, technical identifiers
  /\.image$/, /\.src$/, /\.url$/, /\.icon$/, /\.mapsUrl$/, /\.ogImage$/,
  /\.coordinates/,

  // Contact info — keep original
  /^contact\./,

  // Location — keep original address
  /^location\./,

  // Numeric / boolean values
  /\.rating$/, /\.count$/, /\.popular$/,

  // Prices contain currency symbols — keep as-is
  /\.price$/,

  // People's names — keep original
  /^staff\[\d+\]\.name$/,
  /^trainers\[\d+\]\.name$/,
  /^reviews\.featured\[\d+\]\.author$/,
  /^classes\[\d+\]\.instructor$/,

  // Ordering platform names + URLs
  /^ordering\.platforms/,

  // Reservation / donation URLs and phone
  /^reservations\.(url|phone)$/,
  /^donations\.url$/,
];

function shouldSkip(fieldPath: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(fieldPath));
}

// ── Weekday normalization ────────────────────────────────
// Google Translate returns inconsistent day names (周五 vs 星期五).
// Use hardcoded maps to guarantee consistency — no API call needed.

const WEEKDAY_MAP: Record<string, Record<string, string>> = {
  'zh-CN': {
    Monday: '周一', Tuesday: '周二', Wednesday: '周三', Thursday: '周四',
    Friday: '周五', Saturday: '周六', Sunday: '周日',
  },
  'zh-TW': {
    Monday: '週一', Tuesday: '週二', Wednesday: '週三', Thursday: '週四',
    Friday: '週五', Saturday: '週六', Sunday: '週日',
  },
  ms: {
    Monday: 'Isnin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Khamis',
    Friday: 'Jumaat', Saturday: 'Sabtu', Sunday: 'Ahad',
  },
  id: {
    Monday: 'Senin', Tuesday: 'Selasa', Wednesday: 'Rabu', Thursday: 'Kamis',
    Friday: 'Jumat', Saturday: 'Sabtu', Sunday: 'Minggu',
  },
  ja: {
    Monday: '月曜日', Tuesday: '火曜日', Wednesday: '水曜日', Thursday: '木曜日',
    Friday: '金曜日', Saturday: '土曜日', Sunday: '日曜日',
  },
  ko: {
    Monday: '월요일', Tuesday: '화요일', Wednesday: '수요일', Thursday: '목요일',
    Friday: '금요일', Saturday: '토요일', Sunday: '일요일',
  },
  th: {
    Monday: 'วันจันทร์', Tuesday: 'วันอังคาร', Wednesday: 'วันพุธ', Thursday: 'วันพฤหัสบดี',
    Friday: 'วันศุกร์', Saturday: 'วันเสาร์', Sunday: 'วันอาทิตย์',
  },
  vi: {
    Monday: 'Thứ Hai', Tuesday: 'Thứ Ba', Wednesday: 'Thứ Tư', Thursday: 'Thứ Năm',
    Friday: 'Thứ Sáu', Saturday: 'Thứ Bảy', Sunday: 'Chủ Nhật',
  },
  es: {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miércoles', Thursday: 'Jueves',
    Friday: 'Viernes', Saturday: 'Sábado', Sunday: 'Domingo',
  },
  hi: {
    Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार', Thursday: 'गुरुवार',
    Friday: 'शुक्रवार', Saturday: 'शनिवार', Sunday: 'रविवार',
  },
  fil: {
    Monday: 'Lunes', Tuesday: 'Martes', Wednesday: 'Miyerkules', Thursday: 'Huwebes',
    Friday: 'Biyernes', Saturday: 'Sabado', Sunday: 'Linggo',
  },
  ar: {
    Monday: 'الاثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس',
    Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد',
  },
  de: {
    Monday: 'Montag', Tuesday: 'Dienstag', Wednesday: 'Mittwoch', Thursday: 'Donnerstag',
    Friday: 'Freitag', Saturday: 'Samstag', Sunday: 'Sonntag',
  },
  fr: {
    Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi',
    Friday: 'Vendredi', Saturday: 'Samedi', Sunday: 'Dimanche',
  },
  nl: {
    Monday: 'Maandag', Tuesday: 'Dinsdag', Wednesday: 'Woensdag', Thursday: 'Donderdag',
    Friday: 'Vrijdag', Saturday: 'Zaterdag', Sunday: 'Zondag',
  },
};

// ── HTML entity decoding ────────────────────────────────
// Google Translate v2 sometimes returns HTML entities even with format: "text"

function decodeEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

// ── Business name protection ────────────────────────────
// Business names are proper nouns — never translate them.
// When a string CONTAINS the business name (e.g., meta.title = "Mascot Bakery — Fresh Baked Daily"),
// we replace it with a placeholder before sending to Google, then restore after.

const BIZ_NAME_PLACEHOLDER = '{{BIZNAME}}';

function protectBusinessName(text: string, businessName: string): string {
  if (!businessName || !text.includes(businessName)) return text;
  return text.replaceAll(businessName, BIZ_NAME_PLACEHOLDER);
}

function restoreBusinessName(text: string, businessName: string): string {
  if (!businessName || !text.includes(BIZ_NAME_PLACEHOLDER)) return text;
  return text.replaceAll(BIZ_NAME_PLACEHOLDER, businessName);
}

// ── String extraction ───────────────────────────────────

function collectTranslatable(
  content: Record<string, unknown>,
  businessName?: string,
): TranslationJob[] {
  const jobs: TranslationJob[] = [];

  function walk(obj: unknown, prefix: string): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${key}` : key;

      // Special: hours — day names use hardcoded WEEKDAY_MAP, not API.
      // They are NOT added to jobs; applyTranslations handles them directly.
      if (p === 'hours' && typeof value === 'object' && !Array.isArray(value) && value !== null) {
        continue;
      }

      if (shouldSkip(p)) continue;

      // Protect business name — it's a proper noun, never translate
      if (businessName && typeof value === 'string' && value === businessName) continue;

      if (typeof value === 'string' && value.trim()) {
        jobs.push({ path: p, text: value });
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const ap = `${p}[${i}]`;
          if (typeof value[i] === 'string' && value[i].trim()) {
            if (!shouldSkip(ap)) jobs.push({ path: ap, text: value[i] });
          } else if (typeof value[i] === 'object' && value[i] !== null) {
            walk(value[i], ap);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        walk(value, p);
      }
    }
  }

  walk(content, '');
  return jobs;
}

// ── Set value at nested path ────────────────────────────

function setNestedValue(obj: Record<string, unknown>, dotPath: string, value: string): void {
  const segments = dotPath.split('.');
  let current: unknown = obj;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;
    const match = seg.match(/^([^[]+)(?:\[(\d+)\])?$/);
    if (!match) return;

    const key = match[1];
    const idx = match[2] !== undefined ? parseInt(match[2], 10) : undefined;

    if (isLast) {
      if (idx !== undefined) {
        const arr = (current as Record<string, unknown>)[key];
        if (Array.isArray(arr)) arr[idx] = value;
      } else {
        (current as Record<string, unknown>)[key] = value;
      }
    } else {
      if (idx !== undefined) {
        const arr = (current as Record<string, unknown>)[key];
        current = Array.isArray(arr) ? arr[idx] : undefined;
      } else {
        current = (current as Record<string, unknown>)[key];
      }
      if (current === undefined || current === null) return;
    }
  }
}

// ── Reconstruct translated content ──────────────────────

function applyTranslations(
  enContent: Record<string, unknown>,
  jobs: TranslationJob[],
  translated: string[],
  locale: string,
): Record<string, unknown> {
  const result = JSON.parse(JSON.stringify(enContent)) as Record<string, unknown>;

  for (let i = 0; i < jobs.length; i++) {
    setNestedValue(result, jobs[i].path, translated[i]);
  }

  // Rebuild hours with hardcoded weekday map (consistent, no API needed)
  if (result.hours && typeof result.hours === 'object') {
    const oldHours = result.hours as Record<string, string>;
    const dayMap = WEEKDAY_MAP[locale];
    const newHours: Record<string, string> = {};
    for (const [origKey, timeVal] of Object.entries(oldHours)) {
      newHours[dayMap?.[origKey] || origKey] = timeVal;
    }
    result.hours = newHours;
  }

  return result;
}

// ── Google Translate API v2 ─────────────────────────────

async function googleTranslateBatch(
  texts: string[],
  target: string,
  apiKey: string,
  source = 'en',
): Promise<string[]> {
  if (texts.length === 0) return [];

  const results: string[] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const url = `${GOOGLE_TRANSLATE_V2}?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: batch, target, source, format: 'text' }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Translate API ${res.status}: ${body}`);
    }

    const data = (await res.json()) as {
      data: { translations: Array<{ translatedText: string }> };
    };
    results.push(...data.data.translations.map((t) => decodeEntities(t.translatedText)));

    // Small delay between batches
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return results;
}

// ── Cache ───────────────────────────────────────────────

function loadCache(): TranslationCache {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) as TranslationCache;
    }
  } catch {
    /* corrupted cache — start fresh */
  }
  return {};
}

function saveCache(cache: TranslationCache): void {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// ── business.ts parse / write ───────────────────────────

interface ParsedFile {
  data: Record<string, unknown>;
  importLine: string;
  exportPrefix: string; // e.g. "export const business: BusinessData ="
}

function parseBusinessTs(filePath: string): ParsedFile {
  const raw = fs.readFileSync(filePath, 'utf8');

  // Capture original import line (preserve type + path)
  const importMatch = raw.match(/^import\s+.+$/m);
  const importLine = importMatch
    ? importMatch[0]
    : "import type { SiteData } from '@/types/site-data';";

  // Find the export statement and strip everything before it
  const exportRe = /export\s+(const\s+(\w+)\s*(?::\s*(\w+))?\s*=|default)\s*/;
  const match = raw.match(exportRe);
  if (!match) throw new Error('Could not find export statement in business.ts');

  // Reconstruct original export prefix
  const varName = match[2] || 'siteData';
  const typeName = match[3] || 'SiteData';
  const exportPrefix = match[1].startsWith('default')
    ? 'export default'
    : `export const ${varName}: ${typeName} =`;

  // Evaluate the object literal
  const exportStart = raw.indexOf(match[0]);
  let jsBody = raw.slice(exportStart);
  jsBody = jsBody.replace(exportRe, 'return ');
  jsBody = jsBody.replace(/;\s*$/, '');

  try {
    const fn = new Function(jsBody);
    return { data: fn() as Record<string, unknown>, importLine, exportPrefix };
  } catch (err) {
    throw new Error(`Failed to parse business.ts: ${(err as Error).message}`);
  }
}

function writeBusinessTs(
  filePath: string,
  siteData: Record<string, unknown>,
  importLine: string,
  exportPrefix: string,
): void {
  const json = JSON.stringify(siteData, null, 2);

  // Make locale-key quotes consistent: "zh-CN" stays quoted, simple keys unquoted
  const ts = json
    .replace(/"([a-zA-Z_]\w*)":/g, '$1:') // unquote simple keys
    .replace(/^(\s*)([a-zA-Z_]\w*(-\w+)+):/gm, '$1"$2":'); // re-quote hyphenated keys

  const output = [importLine, '', `${exportPrefix} ${ts};`, ''].join('\n');

  fs.writeFileSync(filePath, output);
}

// ── QA checks ───────────────────────────────────────────

function runQA(
  sourceJobs: TranslationJob[],
  translated: string[],
  locale: string,
): string[] {
  const warnings: string[] = [];

  for (let i = 0; i < sourceJobs.length; i++) {
    const { path: p, text: src } = sourceJobs[i];
    const tgt = translated[i];

    if (!tgt || !tgt.trim()) {
      warnings.push(`[${locale}] Empty translation: ${p}`);
      continue;
    }

    // Length check: flag if translation is >2.5× source length
    if (tgt.length > src.length * 2.5 && src.length > 10) {
      warnings.push(`[${locale}] Unusual length (${src.length}→${tgt.length}): ${p}`);
    }

    // Possibly untranslated (identical to source, >3 words)
    if (tgt === src && src.split(/\s+/).length > 3) {
      warnings.push(`[${locale}] Possibly untranslated: ${p}`);
    }
  }

  return warnings;
}

// ── Main ────────────────────────────────────────────────

const log = (msg: string) => process.stderr.write(`[translate] ${msg}\n`);

export async function translateSite(
  dir: string,
  targetLocales: string[],
  opts: { dryRun?: boolean; noCache?: boolean } = {},
): Promise<TranslateResult[]> {
  const apiKey = requireEnv('GOOGLE_API_KEY');
  const businessPath = path.join(dir, 'src/data/business.ts');

  if (!fs.existsSync(businessPath)) {
    throw new Error(`business.ts not found at ${businessPath}`);
  }

  // 1. Parse business.ts (preserves original import/export format)
  log('Parsing business.ts...');
  const { data: siteData, importLine, exportPrefix } = parseBusinessTs(businessPath);
  const contentMap = siteData.content as Record<string, Record<string, unknown>> | undefined;
  const enContent = contentMap?.en;
  if (!enContent) throw new Error('No content.en found in business.ts');

  // 2. Collect translatable strings (business name protected from translation)
  //    businessName can come from siteData.businessName (SiteData type)
  //    or siteData.slug / meta.title (BusinessData type). We also check lead.json.
  let businessName = siteData.businessName as string | undefined;
  if (!businessName) {
    const leadPath = path.join(dir, 'lead.json');
    if (fs.existsSync(leadPath)) {
      try {
        const lead = JSON.parse(fs.readFileSync(leadPath, 'utf8'));
        businessName = lead.displayName?.text || lead.name;
      } catch { /* ignore */ }
    }
  }
  if (businessName) log(`Business name protected: "${businessName}"`);
  const jobs = collectTranslatable(enContent, businessName);
  const totalSkipped =
    Object.keys(flattenAll(enContent)).length - jobs.length;
  log(`Translatable: ${jobs.length} strings, skipped: ${totalSkipped} fields`);

  if (opts.dryRun) {
    log('Dry run — listing strings:');
    for (const j of jobs.slice(0, 20)) log(`  ${j.path}: "${j.text.slice(0, 60)}"`);
    if (jobs.length > 20) log(`  ... and ${jobs.length - 20} more`);
    return targetLocales.map((locale) => ({
      locale,
      stringsTranslated: 0,
      stringsCached: 0,
      stringsSkipped: totalSkipped,
      qaWarnings: [],
    }));
  }

  // 3. Load cache
  const cache = opts.noCache ? ({} as TranslationCache) : loadCache();
  const results: TranslateResult[] = [];

  for (const locale of targetLocales) {
    log(`\n── ${locale} ──`);
    const ck = `en→${locale}`;
    if (!cache[ck]) cache[ck] = {};

    // 4. Protect business name with placeholder before cache/API
    //    Cache key uses the protected text so entries are reusable across sites.
    const protectedTexts = jobs.map((j) =>
      businessName ? protectBusinessName(j.text, businessName) : j.text,
    );

    // 5. Split into cached vs uncached
    const uncachedIdx: number[] = [];
    const translatedTexts: string[] = new Array(jobs.length);
    let cached = 0;

    for (let i = 0; i < jobs.length; i++) {
      const entry = cache[ck][protectedTexts[i]];
      if (entry && !opts.noCache) {
        translatedTexts[i] = businessName
          ? restoreBusinessName(entry.result, businessName)
          : entry.result;
        cached++;
      } else {
        uncachedIdx.push(i);
      }
    }

    log(`Cache hits: ${cached}, API calls needed: ${uncachedIdx.length}`);

    // 6. Translate uncached via Google API
    if (uncachedIdx.length > 0) {
      const textsToSend = uncachedIdx.map((i) => protectedTexts[i]);
      const apiResults = await googleTranslateBatch(textsToSend, locale, apiKey);

      for (let j = 0; j < uncachedIdx.length; j++) {
        const idx = uncachedIdx[j];
        // Cache stores the placeholder version (reusable across sites)
        cache[ck][protectedTexts[idx]] = {
          result: apiResults[j],
          ts: new Date().toISOString().slice(0, 10),
        };
        // Output restores the actual business name
        translatedTexts[idx] = businessName
          ? restoreBusinessName(apiResults[j], businessName)
          : apiResults[j];
      }
    }

    // 7. Reconstruct locale content (weekday names from hardcoded map, not API)
    const localeContent = applyTranslations(enContent, jobs, translatedTexts, locale);
    if (!contentMap) throw new Error('Unreachable');
    contentMap[locale] = localeContent;

    // 8. QA
    const qaWarnings = runQA(jobs, translatedTexts, locale);
    if (qaWarnings.length > 0) {
      log(`QA warnings (${qaWarnings.length}):`);
      for (const w of qaWarnings.slice(0, 5)) log(`  ${w}`);
      if (qaWarnings.length > 5) log(`  ... and ${qaWarnings.length - 5} more`);
    }

    results.push({
      locale,
      stringsTranslated: uncachedIdx.length,
      stringsCached: cached,
      stringsSkipped: totalSkipped,
      qaWarnings,
    });

    log(`✓ ${locale}: ${uncachedIdx.length} translated, ${cached} cached`);
  }

  // 9. Update region.locales
  const region = siteData.region as Record<string, unknown> | undefined;
  if (region) {
    const existing = new Set<string>((region.locales as string[]) || ['en']);
    for (const l of targetLocales) existing.add(l);
    region.locales = Array.from(existing);
  }

  // 10. Write back (preserving original import/export format)
  log('\nWriting business.ts...');
  writeBusinessTs(businessPath, siteData, importLine, exportPrefix);
  log('Done — business.ts updated with all locale blocks');

  // 11. Save cache
  saveCache(cache);
  log(`Cache saved (${Object.keys(cache).length} locale pairs)`);

  return results;
}

// Helper: flatten ALL strings (for skip-count calculation)
function flattenAll(obj: unknown, prefix = ''): Record<string, string> {
  const r: Record<string, string> = {};
  if (!obj || typeof obj !== 'object') return r;
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string' && v.trim()) r[p] = v;
    else if (Array.isArray(v))
      v.forEach((el, i) => {
        if (typeof el === 'string' && el.trim()) r[`${p}[${i}]`] = el;
        else Object.assign(r, flattenAll(el, `${p}[${i}]`));
      });
    else if (typeof v === 'object' && v !== null) Object.assign(r, flattenAll(v, p));
  }
  return r;
}

// ── CLI ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (hasFlag(args, 'help') || hasFlag(args, 'h')) {
    process.stderr.write(`Usage: npx tsx packages/utils/translate.ts --dir output/{slug}/ --locales ms,zh-CN

Translates EN content in business.ts to target locales via Google Translate API v2.
Writes translated locale blocks directly into business.ts.
Claude Code just runs this command — zero context consumption.

Options:
  --dir <path>      Site output directory (REQUIRED)
  --locales <list>  Comma-separated target locales (REQUIRED)
  --dry-run         Show extractable strings without calling API
  --no-cache        Ignore cache, re-translate everything
  --help, -h        Show this help

Environment:
  GOOGLE_API_KEY    Google Cloud API key (Cloud Translation API must be enabled)

Cache:
  data/translation-cache.json — reused across sites for identical strings.
  Common phrases ("Book Now", "View Menu") hit cache after the first site.
`);
    process.exit(0);
  }

  const dir = getArg(args, 'dir', '');
  const localesStr = getArg(args, 'locales', '');

  if (!dir || !localesStr) {
    process.stderr.write('Error: --dir and --locales are required. Use --help for usage.\n');
    process.exit(1);
  }

  const locales = localesStr.split(',').map((s) => s.trim());
  const dryRun = hasFlag(args, 'dry-run');
  const noCache = hasFlag(args, 'no-cache');

  try {
    const results = await translateSite(dir, locales, { dryRun, noCache });
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');

    // QA warnings are informational — only hard-fail on empty translations
    const hasEmpty = results.some((r) =>
      r.qaWarnings.some((w) => w.includes('Empty translation')),
    );
    process.exit(hasEmpty ? 1 : 0);
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { collectTranslatable, applyTranslations };
