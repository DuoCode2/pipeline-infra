import { describe, it, expect } from 'vitest';
import {
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
} from '../../packages/generate/industry-config';
import {
  INDUSTRY_TO_ARCHETYPE,
  ARCHETYPE_CONFIGS,
} from '../../packages/generate/archetype-config';

// ---------------------------------------------------------------------------
// Pipeline contract tests
// Verify that all configuration maps are consistent with each other.
// ---------------------------------------------------------------------------
describe('pipeline contracts', () => {
  const archetypeIndustries = Object.keys(INDUSTRY_TO_ARCHETYPE);
  const industryConfigIndustries = Object.keys(INDUSTRY_CONFIG);
  const schemaOrgIndustries = Object.keys(SCHEMA_ORG_TYPE);
  const validArchetypes = Object.keys(ARCHETYPE_CONFIGS);

  describe('INDUSTRY_CONFIG covers INDUSTRY_TO_ARCHETYPE', () => {
    it('every industry in INDUSTRY_TO_ARCHETYPE has a matching INDUSTRY_CONFIG entry', () => {
      for (const industry of archetypeIndustries) {
        expect(
          industryConfigIndustries,
          `INDUSTRY_CONFIG is missing entry for "${industry}"`,
        ).toContain(industry);
      }
    });

    it('every industry in INDUSTRY_CONFIG has a matching INDUSTRY_TO_ARCHETYPE entry', () => {
      for (const industry of industryConfigIndustries) {
        expect(
          archetypeIndustries,
          `INDUSTRY_TO_ARCHETYPE is missing entry for "${industry}"`,
        ).toContain(industry);
      }
    });

    it('both maps have exactly the same set of keys', () => {
      expect(industryConfigIndustries.sort()).toEqual(archetypeIndustries.sort());
    });
  });

  describe('SCHEMA_ORG_TYPE covers INDUSTRY_TO_ARCHETYPE', () => {
    it('every industry in INDUSTRY_TO_ARCHETYPE has a matching SCHEMA_ORG_TYPE entry', () => {
      for (const industry of archetypeIndustries) {
        expect(
          schemaOrgIndustries,
          `SCHEMA_ORG_TYPE is missing entry for "${industry}"`,
        ).toContain(industry);
      }
    });

    it('every industry in SCHEMA_ORG_TYPE has a matching INDUSTRY_TO_ARCHETYPE entry', () => {
      for (const industry of schemaOrgIndustries) {
        expect(
          archetypeIndustries,
          `INDUSTRY_TO_ARCHETYPE is missing entry for "${industry}"`,
        ).toContain(industry);
      }
    });

    it('both maps have exactly the same set of keys', () => {
      expect(schemaOrgIndustries.sort()).toEqual(archetypeIndustries.sort());
    });
  });

  describe('all primary archetypes in INDUSTRY_TO_ARCHETYPE are valid', () => {
    it.each(archetypeIndustries)(
      '%s.primary is a valid Archetype with a config entry',
      (industry) => {
        const mapping = INDUSTRY_TO_ARCHETYPE[industry];
        expect(
          validArchetypes,
          `Archetype "${mapping.primary}" for industry "${industry}" not found in ARCHETYPE_CONFIGS`,
        ).toContain(mapping.primary);
      },
    );
  });

  describe('all secondary archetypes in INDUSTRY_TO_ARCHETYPE are valid', () => {
    const industriesWithSecondary = archetypeIndustries.filter(
      (ind) => INDUSTRY_TO_ARCHETYPE[ind].secondary !== undefined,
    );

    it.each(industriesWithSecondary)(
      '%s.secondary is a valid Archetype with a config entry',
      (industry) => {
        const mapping = INDUSTRY_TO_ARCHETYPE[industry];
        expect(
          validArchetypes,
          `Secondary archetype "${mapping.secondary}" for industry "${industry}" not found in ARCHETYPE_CONFIGS`,
        ).toContain(mapping.secondary);
      },
    );
  });

  describe('ARCHETYPE_CONFIGS covers all referenced archetypes', () => {
    it('every archetype referenced by any industry exists in ARCHETYPE_CONFIGS', () => {
      const referencedArchetypes = new Set<string>();
      for (const mapping of Object.values(INDUSTRY_TO_ARCHETYPE)) {
        referencedArchetypes.add(mapping.primary);
        if (mapping.secondary) {
          referencedArchetypes.add(mapping.secondary);
        }
      }
      for (const archetype of referencedArchetypes) {
        expect(
          validArchetypes,
          `Archetype "${archetype}" is referenced but has no ARCHETYPE_CONFIGS entry`,
        ).toContain(archetype);
      }
    });

    it('every archetype in ARCHETYPE_CONFIGS is referenced by at least one industry', () => {
      const referencedArchetypes = new Set<string>();
      for (const mapping of Object.values(INDUSTRY_TO_ARCHETYPE)) {
        referencedArchetypes.add(mapping.primary);
        if (mapping.secondary) {
          referencedArchetypes.add(mapping.secondary);
        }
      }
      for (const archetype of validArchetypes) {
        expect(
          referencedArchetypes.has(archetype),
          `Archetype "${archetype}" exists in ARCHETYPE_CONFIGS but is not referenced by any industry`,
        ).toBe(true);
      }
    });
  });

  describe('cross-map consistency checks', () => {
    it('all three industry maps have the same number of entries', () => {
      expect(industryConfigIndustries.length).toBe(archetypeIndustries.length);
      expect(schemaOrgIndustries.length).toBe(archetypeIndustries.length);
    });

    it('all three industry maps have exactly 15 entries', () => {
      expect(industryConfigIndustries).toHaveLength(15);
      expect(archetypeIndustries).toHaveLength(15);
      expect(schemaOrgIndustries).toHaveLength(15);
    });

    it('ARCHETYPE_CONFIGS has exactly 8 entries', () => {
      expect(validArchetypes).toHaveLength(8);
    });
  });
});
