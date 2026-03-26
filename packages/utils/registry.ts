/**
 * Sites registry — tracks deployed sites by Google Places ID.
 *
 * Automatic deduplication at three levels:
 * 1. search.ts filters out already-registered place IDs from results
 * 2. prepare.ts warns and skips if output/{slug}/ already has a lead.json with same place_id
 * 3. finalize.ts registers the site after successful deployment
 *
 * Registry file: data/sites-registry.json
 * Format: { [placeId]: { slug, url, industry, regionId, deployedAt } }
 */
import * as fs from 'fs';
import * as path from 'path';

const REGISTRY_PATH = path.resolve('data/sites-registry.json');

export interface SiteEntry {
  slug: string;
  url?: string;
  industry?: string;
  regionId?: string;
  deployedAt?: string;
  preparedAt?: string;
}

export type SiteRegistry = Record<string, SiteEntry>;

/** Read the registry, creating it if missing. */
export function readRegistry(): SiteRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  } catch {
    return {};
  }
}

/** Write the registry atomically (write to .tmp, then rename). */
function writeRegistry(registry: SiteRegistry): void {
  const dir = path.dirname(REGISTRY_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = REGISTRY_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(registry, null, 2));
  fs.renameSync(tmp, REGISTRY_PATH);
}

/** Check if a place ID is already registered. */
export function isRegistered(placeId: string): boolean {
  return placeId in readRegistry();
}

/** Get the entry for a place ID. */
export function getEntry(placeId: string): SiteEntry | undefined {
  return readRegistry()[placeId];
}

/** Get all registered place IDs as a Set (for fast lookup in search filtering). */
export function getRegisteredPlaceIds(): Set<string> {
  return new Set(Object.keys(readRegistry()));
}

/** Register a site after prepare (before deploy). */
export function registerPrepared(placeId: string, entry: Omit<SiteEntry, 'preparedAt'>): void {
  const registry = readRegistry();
  registry[placeId] = {
    ...registry[placeId],
    ...entry,
    preparedAt: new Date().toISOString(),
  };
  writeRegistry(registry);
}

/** Register a site after successful deployment. */
export function registerDeployed(placeId: string, url: string): void {
  const registry = readRegistry();
  if (!registry[placeId]) {
    registry[placeId] = { slug: '', url, deployedAt: new Date().toISOString() };
  } else {
    registry[placeId].url = url;
    registry[placeId].deployedAt = new Date().toISOString();
  }
  writeRegistry(registry);
}

/** Bootstrap: scan output directories to build initial registry from existing sites. */
export function bootstrap(): SiteRegistry {
  const outputDir = path.resolve('output');
  if (!fs.existsSync(outputDir)) return {};

  const registry = readRegistry();
  let added = 0;

  for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const leadPath = path.join(outputDir, entry.name, 'lead.json');
    if (!fs.existsSync(leadPath)) continue;

    try {
      const lead = JSON.parse(fs.readFileSync(leadPath, 'utf8'));
      const placeId = lead.place_id;
      if (!placeId || registry[placeId]) continue;

      registry[placeId] = {
        slug: entry.name,
        url: `https://${entry.name}.vercel.app`,
        industry: lead.industry,
        regionId: lead.regionId,
        preparedAt: lead.timestamp,
      };
      added++;
    } catch { /* skip malformed lead.json */ }
  }

  writeRegistry(registry);
  return registry;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--bootstrap')) {
    const registry = bootstrap();
    const count = Object.keys(registry).length;
    console.log(`Registry bootstrapped: ${count} sites`);
    console.log(`Saved to ${REGISTRY_PATH}`);
  } else if (args.includes('--list')) {
    const registry = readRegistry();
    const entries = Object.entries(registry);
    console.log(`${entries.length} registered sites:`);
    for (const [id, entry] of entries) {
      console.log(`  ${entry.slug} (${entry.regionId || '??'}) ${entry.url || 'not deployed'}`);
    }
  } else if (args.includes('--check')) {
    const placeId = args[args.indexOf('--check') + 1];
    if (!placeId) { console.error('Usage: --check <placeId>'); process.exit(1); }
    const entry = getEntry(placeId);
    if (entry) {
      console.log(`REGISTERED: ${entry.slug} → ${entry.url || 'not deployed'}`);
    } else {
      console.log('NOT REGISTERED');
    }
  } else {
    console.log(`Usage:
  npx tsx packages/utils/registry.ts --bootstrap    # Scan output/ and build registry
  npx tsx packages/utils/registry.ts --list          # List all registered sites
  npx tsx packages/utils/registry.ts --check <id>    # Check if a place ID is registered`);
  }
}
