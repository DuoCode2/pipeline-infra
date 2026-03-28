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

// Resolve from project root (where package.json lives), not CWD.
// This ensures registry works correctly from worktrees and subdirectories.
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'data/sites-registry.json');

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

const LOCK_PATH = REGISTRY_PATH + '.lock';

/** Acquire a file lock with exclusive create + stale detection. */
function acquireLock(maxWaitMs = 10_000): void {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      // O_EXCL: fails if file exists — atomic on POSIX
      fs.writeFileSync(LOCK_PATH, `${process.pid}:${Date.now()}`, { flag: 'wx' });
      return;
    } catch {
      // Check for stale lock (holder crashed)
      try {
        const content = fs.readFileSync(LOCK_PATH, 'utf8');
        const lockTime = parseInt(content.split(':')[1] || '0', 10);
        if (Date.now() - lockTime > 30_000) {
          // Atomic rename to claim the stale lock — only one process wins the rename
          const claimPath = LOCK_PATH + `.claim.${process.pid}`;
          try {
            fs.renameSync(LOCK_PATH, claimPath);
            fs.unlinkSync(claimPath);
            continue; // retry creating the lock
          } catch {
            // Another process won the rename — retry
          }
        }
      } catch { /* lock was just released — retry */ }
      // Wait 50-150ms (jitter to avoid thundering herd) — non-blocking via sync sleep
      const waitMs = 50 + Math.floor(Math.random() * 100);
      const end = Date.now() + waitMs;
      while (Date.now() < end) { /* spin-wait, avoids blocking Atomics.wait */ }
    }
  }
  throw new Error(`Registry lock timeout after ${maxWaitMs}ms. Another process may be stuck. Delete ${LOCK_PATH} manually if needed.`);
}

function releaseLock(): void {
  try { fs.unlinkSync(LOCK_PATH); } catch { /* already released */ }
}

/**
 * Read-modify-write the registry atomically.
 * Always use this instead of separate readRegistry() + writeRegistry() for mutations.
 */
function mutateRegistry(fn: (registry: SiteRegistry) => void): void {
  const dir = path.dirname(REGISTRY_PATH);
  fs.mkdirSync(dir, { recursive: true });
  acquireLock();
  try {
    const registry = readRegistry();
    fn(registry);
    const tmp = REGISTRY_PATH + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(registry, null, 2));
    fs.renameSync(tmp, REGISTRY_PATH);
  } finally {
    releaseLock();
  }
}

/** @deprecated Use mutateRegistry() for concurrent-safe writes. */
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

/** Get all registered slugs as a Set (secondary dedup for sites without place_id). */
export function getRegisteredSlugs(): Set<string> {
  return new Set(Object.values(readRegistry()).map(e => e.slug).filter(Boolean));
}

/** Register a site after prepare (before deploy). Concurrent-safe. */
export function registerPrepared(placeId: string, entry: Omit<SiteEntry, 'preparedAt'>): void {
  mutateRegistry((registry) => {
    registry[placeId] = {
      ...registry[placeId],
      ...entry,
      preparedAt: new Date().toISOString(),
    };
  });
}

/** Register a site after successful deployment. Concurrent-safe. Requires slug. */
export function registerDeployed(placeId: string, slug: string, url: string): void {
  mutateRegistry((registry) => {
    const existing = registry[placeId] ?? {};
    registry[placeId] = {
      ...existing,
      slug: slug || existing.slug || '',
      url,
      deployedAt: new Date().toISOString(),
    };
  });
}

/**
 * Refresh registry URLs by checking which URLs actually respond.
 * Fixes mismatches caused by Vercel hostname truncation (DNS label ≤ 63 chars).
 * Queries the Vercel API for the actual production alias when the expected URL fails.
 */
export async function refreshUrls(): Promise<{ checked: number; fixed: number; errors: string[] }> {
  const registry = readRegistry();
  const entries = Object.entries(registry);
  let checked = 0;
  let fixed = 0;
  const errors: string[] = [];

  const token = process.env.VERCEL_TOKEN;
  const scope = process.env.VERCEL_SCOPE || 'duocodetech';

  for (const [placeId, entry] of entries) {
    if (!entry.url || !entry.slug) continue;
    checked++;

    // Check if current URL responds
    try {
      const res = await fetch(entry.url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
      if (res.ok || res.status === 301 || res.status === 308) continue; // URL works fine
    } catch {
      // URL doesn't respond — try to find the real one
    }

    // Query Vercel API for actual aliases
    if (!token) {
      errors.push(`${entry.slug}: URL unreachable, no VERCEL_TOKEN to query API`);
      continue;
    }

    try {
      const teamQuery = scope ? `?teamId=${scope}` : '';
      const res = await fetch(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(entry.slug)}${teamQuery}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        errors.push(`${entry.slug}: API lookup failed (${res.status})`);
        continue;
      }
      const proj = (await res.json()) as Record<string, unknown>;
      const targets = proj.targets as Record<string, { alias?: string[] }> | undefined;
      const prodAliases = targets?.production?.alias ?? [];
      const domains = Array.isArray(proj.domains)
        ? proj.domains.filter((domain): domain is string => typeof domain === 'string')
        : [];
      const preferredProjectDomain = scope ? `${entry.slug}-${scope}.vercel.app` : '';

      // Prefer a production alias, then fall back to project-owned domains.
      const vercelAlias = prodAliases.find((a: string) => a.endsWith('.vercel.app'))
        || (preferredProjectDomain && domains.includes(preferredProjectDomain) ? preferredProjectDomain : undefined)
        || domains.find((domain: string) => domain.endsWith('.vercel.app'));
      if (vercelAlias) {
        const newUrl = `https://${vercelAlias}`;
        if (newUrl !== entry.url) {
          console.error(`  FIX: ${entry.slug}: ${entry.url} → ${newUrl}`);
          mutateRegistry((reg) => {
            if (reg[placeId]) reg[placeId].url = newUrl;
          });
          fixed++;
        }
      } else {
        errors.push(`${entry.slug}: no project-owned .vercel.app domain found`);
      }
    } catch (err) {
      errors.push(`${entry.slug}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { checked, fixed, errors };
}

/** Bootstrap: scan output directories to build initial registry from existing sites. */
export function bootstrap(): SiteRegistry {
  const outputDir = path.join(PROJECT_ROOT, 'output');
  if (!fs.existsSync(outputDir)) return {};

  const registry = readRegistry();
  let added = 0;

  for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const leadPath = path.join(outputDir, slug, 'lead.json');

    // Try to read lead.json for place_id
    let placeId: string | undefined;
    let industry: string | undefined;
    let regionId: string | undefined;
    let timestamp: string | undefined;

    if (fs.existsSync(leadPath)) {
      try {
        const lead = JSON.parse(fs.readFileSync(leadPath, 'utf8'));
        // Support both old format (id) and new format (place_id)
        placeId = lead.place_id || lead.id;
        industry = lead.industry;
        regionId = lead.regionId;
        timestamp = lead.timestamp;
      } catch { /* skip malformed */ }
    }

    // Fallback: use slug as ID for dirs without lead.json or without place_id
    const registryKey = placeId || `slug:${slug}`;
    if (registry[registryKey]) continue;

    registry[registryKey] = {
      slug,
      url: `https://${slug}.vercel.app`,
      industry,
      regionId,
      preparedAt: timestamp,
    };
    added++;
  }

  if (added > 0) {
    mutateRegistry((current) => {
      for (const [key, entry] of Object.entries(registry)) {
        if (!current[key]) current[key] = entry;
      }
    });
  }
  console.error(`  Added ${added} new entries`);
  return readRegistry();
}

// CLI
if (require.main === module) {
  require('dotenv/config');
  (async () => {
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
  } else if (args.includes('--register')) {
    // Manual registration for custom projects that bypass the pipeline
    const slug = args[args.indexOf('--register') + 1];
    if (!slug) { console.error('Usage: --register <slug> [--url <url>] [--id <placeId>]'); process.exit(1); }
    const url = args.includes('--url') ? args[args.indexOf('--url') + 1] : `https://${slug}.vercel.app`;
    const placeId = args.includes('--id') ? args[args.indexOf('--id') + 1] : `slug:${slug}`;
    registerDeployed(placeId, slug, url || `https://${slug}.vercel.app`);
    console.log(`Registered: ${slug} → ${url} (key: ${placeId})`);
  } else if (args.includes('--refresh-urls')) {
    const { checked, fixed, errors } = await refreshUrls();
    console.log(`Checked ${checked} entries, fixed ${fixed} URLs`);
    if (errors.length) {
      console.error(`Errors (${errors.length}):`);
      for (const e of errors) console.error(`  ${e}`);
    }
  } else if (args.includes('--remove')) {
    const slug = args[args.indexOf('--remove') + 1];
    if (!slug) { console.error('Usage: --remove <slug>'); process.exit(1); }
    mutateRegistry((registry) => {
      for (const [key, entry] of Object.entries(registry)) {
        if (entry.slug === slug) {
          delete registry[key];
          console.log(`Removed: ${slug} (key: ${key})`);
          return;
        }
      }
      console.log(`Not found: ${slug}`);
    });
  } else {
    console.log(`Usage:
  npx tsx packages/utils/registry.ts --bootstrap              # Scan output/ and build registry
  npx tsx packages/utils/registry.ts --list                    # List all registered sites
  npx tsx packages/utils/registry.ts --check <placeId>         # Check if a place ID is registered
  npx tsx packages/utils/registry.ts --register <slug> [--url <url>] [--id <placeId>]  # Manual registration
  npx tsx packages/utils/registry.ts --remove <slug>           # Remove a site from registry
  npx tsx packages/utils/registry.ts --refresh-urls            # Verify + fix stale URLs via Vercel API`);
  }
  })();
}
