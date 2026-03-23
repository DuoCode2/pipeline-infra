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
