import * as fs from 'fs';
import * as path from 'path';
import type { SiteData } from '@/types/site-data';

const SITES_DIR = path.resolve(process.cwd(), 'src/data/sites');

export function getSiteData(slug: string): SiteData | null {
  const filePath = path.join(SITES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as SiteData;
}

export function listSites(): Array<{ slug: string; businessName: string; archetype: string; industry: string }> {
  if (!fs.existsSync(SITES_DIR)) return [];
  return fs.readdirSync(SITES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(SITES_DIR, f), 'utf8')) as SiteData;
      return { slug: data.slug, businessName: data.businessName, archetype: data.archetype, industry: data.industry };
    });
}

export function saveSiteData(data: SiteData): void {
  fs.mkdirSync(SITES_DIR, { recursive: true });
  fs.writeFileSync(path.join(SITES_DIR, `${data.slug}.json`), JSON.stringify(data, null, 2));
}
