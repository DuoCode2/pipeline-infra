import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MANIFEST_PATH = path.resolve(__dirname, '../../data/manifests/sites.json');

describe.skipIf(!fs.existsSync(MANIFEST_PATH))('Sites Manifest', () => {
  it('has valid structure', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    expect(manifest).toHaveProperty('version');
    expect(manifest).toHaveProperty('sites');
    expect(Array.isArray(manifest.sites)).toBe(true);
  });

  it('sites have required fields', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    for (const site of manifest.sites) {
      expect(site).toHaveProperty('slug');
      expect(site).toHaveProperty('industry');
    }
  });
});
