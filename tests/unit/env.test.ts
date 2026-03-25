import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { requireEnv, optionalEnv, getLocalesForRegion } from '../../packages/utils/env';

// ---------------------------------------------------------------------------
// requireEnv
// ---------------------------------------------------------------------------
describe('requireEnv', () => {
  const TEST_KEY = 'DUOCODE_TEST_ENV_VAR';

  afterEach(() => {
    delete process.env[TEST_KEY];
  });

  it('returns the value when the env var is set', () => {
    process.env[TEST_KEY] = 'hello';
    expect(requireEnv(TEST_KEY)).toBe('hello');
  });

  it('throws when the env var is not set', () => {
    delete process.env[TEST_KEY];
    expect(() => requireEnv(TEST_KEY)).toThrow();
  });

  it('throws with the variable name in the error message', () => {
    delete process.env[TEST_KEY];
    expect(() => requireEnv(TEST_KEY)).toThrow(TEST_KEY);
  });

  it('throws when the env var is an empty string', () => {
    process.env[TEST_KEY] = '';
    expect(() => requireEnv(TEST_KEY)).toThrow();
  });

  it('error message mentions .env.template', () => {
    delete process.env[TEST_KEY];
    expect(() => requireEnv(TEST_KEY)).toThrow('.env.template');
  });
});

// ---------------------------------------------------------------------------
// optionalEnv
// ---------------------------------------------------------------------------
describe('optionalEnv', () => {
  const TEST_KEY = 'DUOCODE_TEST_OPTIONAL_VAR';

  afterEach(() => {
    delete process.env[TEST_KEY];
  });

  it('returns the value when the env var is set', () => {
    process.env[TEST_KEY] = 'world';
    expect(optionalEnv(TEST_KEY, 'default')).toBe('world');
  });

  it('returns the fallback when the env var is not set', () => {
    delete process.env[TEST_KEY];
    expect(optionalEnv(TEST_KEY, 'fallback')).toBe('fallback');
  });

  it('returns the fallback when the env var is an empty string', () => {
    process.env[TEST_KEY] = '';
    expect(optionalEnv(TEST_KEY, 'fallback')).toBe('fallback');
  });

  it('returns the value even if it matches the fallback', () => {
    process.env[TEST_KEY] = 'fallback';
    expect(optionalEnv(TEST_KEY, 'fallback')).toBe('fallback');
  });

  it('handles special characters in value', () => {
    process.env[TEST_KEY] = 'https://example.com?key=val&foo=bar';
    expect(optionalEnv(TEST_KEY, '')).toBe('https://example.com?key=val&foo=bar');
  });
});

// ---------------------------------------------------------------------------
// getLocalesForRegion
// ---------------------------------------------------------------------------
describe('getLocalesForRegion', () => {
  it('returns MY locales by default (no argument)', () => {
    expect(getLocalesForRegion()).toEqual(['en', 'ms', 'zh-CN', 'zh-TW']);
  });

  it('returns MY locales when "my" is passed', () => {
    expect(getLocalesForRegion('my')).toEqual(['en', 'ms', 'zh-CN', 'zh-TW']);
  });

  it('returns fallback locales for unknown region', () => {
    // The implementation catches errors and returns the default MY locales
    const result = getLocalesForRegion('xx');
    expect(result).toEqual(['en', 'ms', 'zh-CN', 'zh-TW']);
  });

  it('returns an array of strings', () => {
    const locales = getLocalesForRegion();
    expect(Array.isArray(locales)).toBe(true);
    for (const locale of locales) {
      expect(typeof locale).toBe('string');
    }
  });

  it('includes all 4 MY locales', () => {
    const locales = getLocalesForRegion('my');
    expect(locales).toHaveLength(4);
    expect(locales).toContain('en');
    expect(locales).toContain('ms');
    expect(locales).toContain('zh-CN');
    expect(locales).toContain('zh-TW');
  });
});
