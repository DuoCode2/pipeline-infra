import 'dotenv/config';
import { describe, it, expect } from 'vitest';

describe.skipIf(!process.env.GOOGLE_API_KEY)('API Key Configuration', () => {
  it('GOOGLE_API_KEY is set', () => {
    expect(process.env.GOOGLE_API_KEY).toBeTruthy();
  });

  it('UNSPLASH_ACCESS_KEY is set', () => {
    expect(process.env.UNSPLASH_ACCESS_KEY).toBeTruthy();
  });

  it('VERCEL_TOKEN is set', () => {
    expect(process.env.VERCEL_TOKEN).toBeTruthy();
  });

  it('TELEGRAM_BOT_TOKEN is set', () => {
    expect(process.env.TELEGRAM_BOT_TOKEN).toBeTruthy();
  });

  it('TELEGRAM_CHAT_ID is set', () => {
    expect(process.env.TELEGRAM_CHAT_ID).toBeTruthy();
  });
});
