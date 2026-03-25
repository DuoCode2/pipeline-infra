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

/** @deprecated Use getLocalesForRegion(regionId) instead */
export const SUPPORTED_LOCALES = ['en', 'ms', 'zh-CN', 'zh-TW'] as const;
export type Locale = string;

/**
 * Get locales for a region. Defaults to Malaysia locales for backward compat.
 */
export function getLocalesForRegion(regionId?: string): string[] {
  try {
    const { loadRegion } = require('../regions/loader');
    return loadRegion(regionId || 'my').locales;
  } catch {
    return ['en', 'ms', 'zh-CN', 'zh-TW'];
  }
}
