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
 * Get locales for a site. Zero-config: defaults to English only.
 * Multi-locale support is opt-in via CLI --locales flag.
 */
export function getLocalesForRegion(_regionId?: string): string[] {
  return ['en'];
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
