import { describe, it, expect } from 'vitest';
import {
  resolveArchetype,
  ARCHETYPE_CONFIGS,
  INDUSTRY_TO_ARCHETYPE,
  type Archetype,
  type ArchetypeConfig,
} from '../../packages/generate/archetype-config';

// ---------------------------------------------------------------------------
// resolveArchetype
// ---------------------------------------------------------------------------
describe('resolveArchetype', () => {
  describe('maps each industry to the correct primary archetype', () => {
    const cases: [string, string][] = [
      ['food', 'menu-order'],
      ['beauty', 'booking-services'],
      ['clinic', 'booking-services'],
      ['retail', 'ecommerce-catalog'],
      ['fitness', 'membership-schedule'],
      ['service', 'lead-trust'],
      ['automotive', 'lead-trust'],
      ['tech', 'lead-trust'],
      ['education', 'booking-services'],
      ['pet', 'booking-services'],
      ['events', 'portfolio-gallery'],
      ['hospitality', 'property-listing'],
      ['realestate', 'property-listing'],
      ['community', 'community-info'],
      ['generic', 'lead-trust'],
    ];

    it.each(cases)('%s -> %s', (industry, expected) => {
      expect(resolveArchetype(industry).primary).toBe(expected);
    });
  });

  describe('maps industries with secondary archetypes correctly', () => {
    it('beauty has secondary portfolio-gallery', () => {
      expect(resolveArchetype('beauty').secondary).toBe('portfolio-gallery');
    });

    it('clinic has secondary lead-trust', () => {
      expect(resolveArchetype('clinic').secondary).toBe('lead-trust');
    });

    it('retail has secondary lead-trust', () => {
      expect(resolveArchetype('retail').secondary).toBe('lead-trust');
    });

    it('fitness has secondary booking-services', () => {
      expect(resolveArchetype('fitness').secondary).toBe('booking-services');
    });

    it('automotive has secondary booking-services', () => {
      expect(resolveArchetype('automotive').secondary).toBe('booking-services');
    });

    it('tech has secondary booking-services', () => {
      expect(resolveArchetype('tech').secondary).toBe('booking-services');
    });

    it('education has secondary lead-trust', () => {
      expect(resolveArchetype('education').secondary).toBe('lead-trust');
    });

    it('pet has secondary ecommerce-catalog', () => {
      expect(resolveArchetype('pet').secondary).toBe('ecommerce-catalog');
    });

    it('events has secondary booking-services', () => {
      expect(resolveArchetype('events').secondary).toBe('booking-services');
    });
  });

  describe('industries without secondary archetypes', () => {
    it('food has no secondary', () => {
      expect(resolveArchetype('food').secondary).toBeUndefined();
    });

    it('service has no secondary', () => {
      expect(resolveArchetype('service').secondary).toBeUndefined();
    });

    it('hospitality has no secondary', () => {
      expect(resolveArchetype('hospitality').secondary).toBeUndefined();
    });

    it('realestate has no secondary', () => {
      expect(resolveArchetype('realestate').secondary).toBeUndefined();
    });

    it('community has no secondary', () => {
      expect(resolveArchetype('community').secondary).toBeUndefined();
    });

    it('generic has no secondary', () => {
      expect(resolveArchetype('generic').secondary).toBeUndefined();
    });
  });

  describe('fallback for unknown industries', () => {
    it('returns lead-trust for unknown industry', () => {
      expect(resolveArchetype('completely_unknown').primary).toBe('lead-trust');
    });

    it('returns the same mapping as generic for unknown', () => {
      const unknown = resolveArchetype('xyz');
      const generic = resolveArchetype('generic');
      expect(unknown).toEqual(generic);
    });
  });
});

// ---------------------------------------------------------------------------
// ARCHETYPE_CONFIGS completeness
// ---------------------------------------------------------------------------
describe('ARCHETYPE_CONFIGS completeness', () => {
  const ALL_ARCHETYPES: Archetype[] = [
    'menu-order',
    'booking-services',
    'lead-trust',
    'ecommerce-catalog',
    'portfolio-gallery',
    'membership-schedule',
    'property-listing',
    'community-info',
  ];

  it('has entries for all 8 archetypes', () => {
    for (const archetype of ALL_ARCHETYPES) {
      expect(ARCHETYPE_CONFIGS).toHaveProperty(archetype);
    }
  });

  it('has exactly 8 entries', () => {
    expect(Object.keys(ARCHETYPE_CONFIGS)).toHaveLength(8);
  });

  describe('required fields', () => {
    it.each(ALL_ARCHETYPES)('%s has primaryCTA with action', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.primaryCTA).toBeDefined();
      expect(config.primaryCTA.action).toBeTruthy();
    });

    it.each(ALL_ARCHETYPES)('%s has primaryCTA with localized entries', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.primaryCTA.localized).toBeDefined();
      expect(Object.keys(config.primaryCTA.localized).length).toBeGreaterThan(0);
    });

    it.each(ALL_ARCHETYPES)('%s has sections with required, recommended, optional', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.sections).toBeDefined();
      expect(Array.isArray(config.sections.required)).toBe(true);
      expect(config.sections.required.length).toBeGreaterThan(0);
      expect(Array.isArray(config.sections.recommended)).toBe(true);
      expect(Array.isArray(config.sections.optional)).toBe(true);
    });

    it.each(ALL_ARCHETYPES)('%s has designGuidance', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.designGuidance).toBeTruthy();
      expect(typeof config.designGuidance).toBe('string');
    });

    it.each(ALL_ARCHETYPES)('%s has label and description', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.label).toBeTruthy();
      expect(config.description).toBeTruthy();
    });

    it.each(ALL_ARCHETYPES)('%s has conversionElements', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(Array.isArray(config.conversionElements)).toBe(true);
      expect(config.conversionElements.length).toBeGreaterThan(0);
    });

    it.each(ALL_ARCHETYPES)('%s has externalIntegrations', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(Array.isArray(config.externalIntegrations)).toBe(true);
      expect(config.externalIntegrations.length).toBeGreaterThan(0);
    });

    it.each(ALL_ARCHETYPES)('%s has demoFeatures', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(Array.isArray(config.demoFeatures)).toBe(true);
      expect(config.demoFeatures.length).toBeGreaterThan(0);
    });

    it.each(ALL_ARCHETYPES)('%s has archetype field matching its key', (archetype) => {
      const config = ARCHETYPE_CONFIGS[archetype];
      expect(config.archetype).toBe(archetype);
    });
  });

  describe('localization coverage', () => {
    const MY_LOCALES = ['en', 'ms', 'zh-CN', 'zh-TW'];

    it.each(ALL_ARCHETYPES)('%s has CTA localized for all MY locales', (archetype) => {
      const localized = ARCHETYPE_CONFIGS[archetype].primaryCTA.localized;
      for (const locale of MY_LOCALES) {
        expect(localized).toHaveProperty(locale);
        expect(localized[locale]).toBeTruthy();
      }
    });
  });
});

// ---------------------------------------------------------------------------
// INDUSTRY_TO_ARCHETYPE completeness
// ---------------------------------------------------------------------------
describe('INDUSTRY_TO_ARCHETYPE completeness', () => {
  const ALL_INDUSTRIES = [
    'food', 'beauty', 'clinic', 'retail', 'fitness', 'service',
    'automotive', 'tech', 'education', 'pet', 'events',
    'hospitality', 'realestate', 'community', 'generic',
  ];

  it('has mappings for all 15 industries', () => {
    for (const industry of ALL_INDUSTRIES) {
      expect(INDUSTRY_TO_ARCHETYPE).toHaveProperty(industry);
    }
  });

  it('has exactly 15 entries', () => {
    expect(Object.keys(INDUSTRY_TO_ARCHETYPE)).toHaveLength(15);
  });

  it('all primary archetypes are valid Archetype values', () => {
    const validArchetypes = Object.keys(ARCHETYPE_CONFIGS);
    for (const [industry, mapping] of Object.entries(INDUSTRY_TO_ARCHETYPE)) {
      expect(validArchetypes).toContain(mapping.primary);
    }
  });

  it('all secondary archetypes (when present) are valid Archetype values', () => {
    const validArchetypes = Object.keys(ARCHETYPE_CONFIGS);
    for (const [industry, mapping] of Object.entries(INDUSTRY_TO_ARCHETYPE)) {
      if (mapping.secondary) {
        expect(validArchetypes).toContain(mapping.secondary);
      }
    }
  });
});
