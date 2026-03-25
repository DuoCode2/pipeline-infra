import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { searchPlaces } from '../../packages/discover/search';

describe.skipIf(!process.env.GOOGLE_API_KEY)('Google Places Discovery', () => {
  it('finds restaurants in Kuala Lumpur', async () => {
    const results = await searchPlaces('restaurant', 'Kuala Lumpur', 1, false);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].displayName).toBeDefined();
    expect(results[0].id).toBeDefined();
  }, 30000);

  it('filters businesses without websites', async () => {
    const results = await searchPlaces('restaurant', 'Kuala Lumpur', 1, true);
    for (const r of results) {
      expect(r.websiteUri).toBeUndefined();
    }
  }, 30000);

  it('returns expected PlaceResult fields', async () => {
    const results = await searchPlaces('food', 'Kuala Lumpur', 1, false);
    const place = results[0];
    expect(place).toHaveProperty('id');
    expect(place).toHaveProperty('displayName');
    expect(place).toHaveProperty('formattedAddress');
  }, 30000);
});
