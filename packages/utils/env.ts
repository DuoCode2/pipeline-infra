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
