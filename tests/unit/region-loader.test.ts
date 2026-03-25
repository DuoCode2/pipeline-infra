import { describe, it, expect } from 'vitest';
import { loadRegion, getDefaultRegion, listRegions } from '../../packages/regions/loader';

// ---------------------------------------------------------------------------
// loadRegion
// ---------------------------------------------------------------------------
describe('loadRegion', () => {
  describe('loading Malaysia (my)', () => {
    const my = loadRegion('my');

    it('returns a config with id "my"', () => {
      expect(my.id).toBe('my');
    });

    it('has name "Malaysia"', () => {
      expect(my.name).toBe('Malaysia');
    });

    it('has correct locales', () => {
      expect(my.locales).toEqual(['en', 'ms', 'zh-CN', 'zh-TW']);
    });

    it('has default locale "en"', () => {
      expect(my.defaultLocale).toBe('en');
    });

    it('has correct currency symbol (RM)', () => {
      expect(my.currency.symbol).toBe('RM');
    });

    it('has correct currency code (MYR)', () => {
      expect(my.currency.code).toBe('MYR');
    });

    it('has currency format with prefix position', () => {
      expect(my.currency.position).toBe('prefix');
    });

    it('has correct phone prefix (+60)', () => {
      expect(my.phone.countryCode).toBe('+60');
    });

    it('has WhatsApp prefix "60"', () => {
      expect(my.phone.whatsappPrefix).toBe('60');
    });

    it('has correct default city (Kuala Lumpur)', () => {
      expect(my.discovery.defaultCity).toBe('Kuala Lumpur');
    });

    it('has name keywords for food industry', () => {
      expect(my.discovery.nameKeywords).toHaveProperty('food');
      expect(my.discovery.nameKeywords.food).toBeInstanceOf(RegExp);
    });

    it('has name keywords for automotive industry', () => {
      expect(my.discovery.nameKeywords).toHaveProperty('automotive');
      expect(my.discovery.nameKeywords.automotive).toBeInstanceOf(RegExp);
    });

    it('food keywords match Malaysian terms', () => {
      const foodPattern = my.discovery.nameKeywords.food;
      expect(foodPattern.test('kopitiam')).toBe(true);
      expect(foodPattern.test('mamak')).toBe(true);
      expect(foodPattern.test('nasi')).toBe(true);
      expect(foodPattern.test('warung')).toBe(true);
      expect(foodPattern.test('restoran')).toBe(true);
    });

    it('automotive keywords match "bengkel"', () => {
      const autoPattern = my.discovery.nameKeywords.automotive;
      expect(autoPattern.test('bengkel')).toBe(true);
      expect(autoPattern.test('Bengkel Motor')).toBe(true);
    });

    it('has skip words for company suffixes', () => {
      expect(my.discovery.skipWords).toContain('sdn');
      expect(my.discovery.skipWords).toContain('bhd');
    });

    it('has cultural settings with halal badge', () => {
      expect(my.cultural?.halalBadge).toBe(true);
    });

    it('has cultural festive notes', () => {
      expect(my.cultural?.festiveNotes).toContain('Ramadan');
      expect(my.cultural?.festiveNotes).toContain('Chinese New Year');
    });

    it('has review authors', () => {
      expect(my.reviewAuthors.length).toBeGreaterThan(0);
    });

    it('has photos location hint', () => {
      expect(my.photos.locationHint).toBe('malaysia');
    });
  });

  describe('unknown region', () => {
    it('throws an error for unknown region', () => {
      expect(() => loadRegion('xx')).toThrow();
    });

    it('error message mentions the unknown region', () => {
      expect(() => loadRegion('xx')).toThrow(/xx/);
    });

    it('error message lists available regions', () => {
      expect(() => loadRegion('xx')).toThrow(/my/);
    });

    it('throws with helpful message format', () => {
      expect(() => loadRegion('zz')).toThrow('Unknown region "zz". Available: my');
    });
  });
});

// ---------------------------------------------------------------------------
// getDefaultRegion
// ---------------------------------------------------------------------------
describe('getDefaultRegion', () => {
  it('returns Malaysia config', () => {
    const region = getDefaultRegion();
    expect(region.id).toBe('my');
    expect(region.name).toBe('Malaysia');
  });

  it('returns the same config as loadRegion("my")', () => {
    const defaultRegion = getDefaultRegion();
    const myRegion = loadRegion('my');
    expect(defaultRegion).toEqual(myRegion);
  });
});

// ---------------------------------------------------------------------------
// listRegions
// ---------------------------------------------------------------------------
describe('listRegions', () => {
  it('returns an array', () => {
    expect(Array.isArray(listRegions())).toBe(true);
  });

  it('contains "my"', () => {
    expect(listRegions()).toContain('my');
  });

  it('returns exactly ["my"]', () => {
    expect(listRegions()).toEqual(['my']);
  });
});
