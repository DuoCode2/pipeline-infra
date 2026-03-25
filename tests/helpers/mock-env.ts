import { vi } from 'vitest';

export function setupMockEnv(overrides: Record<string, string> = {}) {
  const defaults: Record<string, string> = {
    GOOGLE_API_KEY: 'test-google-key',
    UNSPLASH_ACCESS_KEY: 'test-unsplash-key',
    VERCEL_TOKEN: 'test-vercel-token',
  };

  const env = { ...defaults, ...overrides };

  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }

  return env;
}

export function clearMockEnv() {
  vi.unstubAllEnvs();
}
