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

export const SUPPORTED_LOCALES = ['en', 'ms', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
