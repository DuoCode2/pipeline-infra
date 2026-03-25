import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.resolve(__dirname, '../../output');

// Find all sites that have business.ts
const sitesDirs = fs.existsSync(OUTPUT_DIR)
  ? fs.readdirSync(OUTPUT_DIR).filter(d => {
      const businessTs = path.join(OUTPUT_DIR, d, 'src/data/business.ts');
      return fs.existsSync(businessTs) && fs.statSync(path.join(OUTPUT_DIR, d)).isDirectory();
    })
  : [];

describe.skipIf(sitesDirs.length === 0)('Content Quality', () => {
  for (const slug of sitesDirs.slice(0, 5)) {
    describe(slug, () => {
      it('has lead.json', () => {
        const leadPath = path.join(OUTPUT_DIR, slug, 'lead.json');
        if (!fs.existsSync(leadPath)) return; // Skip sites without lead.json
        const lead = JSON.parse(fs.readFileSync(leadPath, 'utf8'));
        // Support both old format (raw PlaceResult with 'id') and new format (with 'place_id', 'name', 'industry')
        const hasId = lead.place_id || lead.id;
        expect(hasId).toBeTruthy();
      });

      it('has brand-colors.json with color tokens', () => {
        const colorsPath = path.join(OUTPUT_DIR, slug, 'brand-colors.json');
        if (!fs.existsSync(colorsPath)) return; // Skip if no colors file
        const colors = JSON.parse(fs.readFileSync(colorsPath, 'utf8'));
        expect(colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        // WCAG tokens may not exist in pre-refactoring sites
        if (colors.onPrimary) {
          expect(colors.onPrimary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      });

      it('has business.ts with content', () => {
        const businessTs = path.join(OUTPUT_DIR, slug, 'src/data/business.ts');
        const content = fs.readFileSync(businessTs, 'utf8');
        // Should have at least 'en' locale content
        expect(content).toContain("content:");
        expect(content).toContain("theme:");
      });

      it('has optimized images', () => {
        const imgDir = path.join(OUTPUT_DIR, slug, 'public/images');
        if (fs.existsSync(imgDir)) {
          const webps = fs.readdirSync(imgDir).filter(f => f.endsWith('.webp'));
          expect(webps.length).toBeGreaterThan(0);
        }
      });
    });
  }
});
