import 'dotenv/config';

/**
 * Get a required environment variable, throwing a clear error if not set.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable ${key} is not set. See .env.template for setup instructions.`
    );
  }
  return value;
}

/**
 * Get an optional environment variable with a fallback.
 */
export function optionalEnv(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

// ── Shared pipeline constants ────────────────────────────────────

export type Locale = string;

/**
 * Get default locales for a region. Returns ['en'] for unknown regions.
 * Multi-locale support can also be overridden via CLI --locales flag.
 */
const REGION_LOCALES: Record<string, string[]> = {
  // English-primary regions
  au: ['en'],
  us: ['en'],
  uk: ['en'],
  ca: ['en'],
  nz: ['en'],
  // Multi-lingual regions
  my: ['en', 'ms', 'zh-CN'],
  sg: ['en', 'zh-CN', 'ms'],
  hk: ['en', 'zh-TW', 'zh-CN'],
  tw: ['zh-TW', 'en'],
  cn: ['zh-CN', 'en'],
  jp: ['ja', 'en'],
  kr: ['ko', 'en'],
  th: ['th', 'en'],
  vn: ['vi', 'en'],
  id: ['id', 'en'],
  ph: ['en', 'tl'],
  in: ['en', 'hi'],
  ae: ['en', 'ar'],
  sa: ['ar', 'en'],
  de: ['de', 'en'],
  fr: ['fr', 'en'],
  nl: ['nl', 'en'],
  bn: ['en', 'ms'],
};

export function getLocalesForRegion(regionId?: string): string[] {
  if (!regionId || regionId === 'xx') return ['en'];
  return REGION_LOCALES[regionId] ?? ['en'];
}

// ── Zero-config region detection ────────────────────────────────
// Maps the country name (last segment of Google Places formattedAddress)
// to an ISO 3166-1 alpha-2 code. Covers markets DuoCode actively targets.
const COUNTRY_TO_REGION: Record<string, string> = {
  'malaysia': 'my',
  'singapore': 'sg',
  'australia': 'au',
  'indonesia': 'id',
  'thailand': 'th',
  'vietnam': 'vn',
  'philippines': 'ph',
  'india': 'in',
  'united states': 'us',
  'usa': 'us',
  'united kingdom': 'uk',
  'uk': 'uk',
  'canada': 'ca',
  'new zealand': 'nz',
  'japan': 'jp',
  'south korea': 'kr',
  'hong kong': 'hk',
  'taiwan': 'tw',
  'china': 'cn',
  'united arab emirates': 'ae',
  'uae': 'ae',
  'saudi arabia': 'sa',
  'germany': 'de',
  'france': 'fr',
  'netherlands': 'nl',
  'brunei': 'bn',
};

/**
 * Detect regionId (ISO alpha-2) from a Google Places formattedAddress.
 * Falls back to 'xx' (unknown) rather than silently assuming a specific country.
 */
export function detectRegionId(formattedAddress: string): string {
  const country = formattedAddress.split(',').pop()?.trim().toLowerCase() || '';
  return COUNTRY_TO_REGION[country] ?? 'xx';
}

// ── Phone prefix for WhatsApp / international format ─────────────
const REGION_PHONE_PREFIX: Record<string, string> = {
  my: '60', sg: '65', au: '61', id: '62', th: '66', vn: '84',
  ph: '63', in: '91', us: '1', uk: '44', ca: '1', nz: '64',
  jp: '81', kr: '82', hk: '852', tw: '886', cn: '86',
  ae: '971', sa: '966', de: '49', fr: '33', nl: '31', bn: '673',
};

/**
 * Convert a local phone number to international format for WhatsApp.
 * E.g., "012-345 6789" with regionId "my" → "60123456789"
 * If the phone already starts with '+' or the country code, returns as-is (digits only).
 */
export function toInternationalPhone(phone: string, regionId: string): string {
  const digits = phone.replace(/[^0-9+]/g, '');
  if (!digits) return '';

  // Already has international prefix
  if (digits.startsWith('+')) return digits.replace(/\+/, '');

  const prefix = REGION_PHONE_PREFIX[regionId];
  if (!prefix) return digits;

  // Strip leading 0 (local format) and prepend country code
  const local = digits.startsWith('0') ? digits.slice(1) : digits;
  return `${prefix}${local}`;
}
