import 'dotenv/config';

import * as fs from 'fs';
import * as path from 'path';

import { deployToVercel } from '../deploy/deploy';
import {
  auditDeployedLocaleRoutes,
  readLocalesFromProjectDir,
  type RouteProbe,
  waitForHealthyLocaleRoutes,
  type LocaleRoutesAudit,
} from '../quality/deployed-locale-routes';
import { getArg, hasFlag } from './cli';
import { getLocalesForRegion } from './env';
import { readRegistry, registerDeployed, type SiteEntry } from './registry';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const log = (msg: string) => process.stderr.write(`[repair-locale-routes] ${msg}\n`);
const AUDIT_ATTEMPTS = 3;
const AUDIT_DELAY_MS = 1_500;

interface SiteAudit extends LocaleRoutesAudit {
  registryKey: string;
  slug: string;
  outputDir: string;
  deployedUrl: string;
  registryUrlMissing: boolean;
  auditedBaseUrls: string[];
  extraDomainAudits: Array<{
    baseUrl: string;
    root: RouteProbe;
    localeRoutes: RouteProbe[];
    ok: boolean;
  }>;
}

interface RepairResult {
  slug: string;
  before: SiteAudit;
  after?: SiteAudit;
  redeployedUrl?: string;
  repaired: boolean;
  error?: string;
}

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function readProjectId(outputDir: string): string | null {
  const candidates = [
    path.join(outputDir, '.vercel/project.json'),
    path.join(outputDir, 'out/.vercel/project.json'),
  ];

  for (const projectJsonPath of candidates) {
    if (!fs.existsSync(projectJsonPath)) continue;
    try {
      const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8')) as { projectId?: string };
      if (projectJson.projectId) return projectJson.projectId;
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

async function getProjectOwnedDomains(outputDir: string, slug: string): Promise<string[]> {
  const projectId = readProjectId(outputDir);
  const token = process.env.VERCEL_TOKEN;
  const scope = process.env.VERCEL_SCOPE || 'duocodetech';
  if (!projectId || !token) return [];

  const seen = new Set<string>();
  const collectDomains = (project: { domains?: string[] } | null | undefined): string[] => {
    return (project?.domains || [])
      .filter((domain): domain is string => typeof domain === 'string')
      .filter((domain) => domain.endsWith('.vercel.app'))
      .filter((domain) => {
        if (seen.has(domain)) return false;
        seen.add(domain);
        return true;
      })
      .map((domain) => `https://${domain}`);
  };

  async function fetchProject(ref: string): Promise<{ domains?: string[] } | null> {
    try {
      const res = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(ref)}?teamId=${scope}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) return null;
      return await res.json() as { domains?: string[] };
    } catch {
      return null;
    }
  }

  try {
    const domainsById = collectDomains(await fetchProject(projectId));
    const domainsBySlug = collectDomains(await fetchProject(slug));
    const resolved = [...domainsById, ...domainsBySlug];
    if (resolved.length > 0) return resolved;

    const heuristicCandidates = [
      `https://${slug}.vercel.app`,
      `https://${slug}-one.vercel.app`,
      `https://${slug}-${scope}.vercel.app`,
      `https://${slug}-sunflowers-${scope}.vercel.app`,
    ];

    const liveHeuristics: string[] = [];
    for (const candidate of heuristicCandidates) {
      try {
        const res = await fetch(candidate, {
          redirect: 'manual',
          signal: AbortSignal.timeout(5_000),
        });
        if (res.ok || res.status === 301 || res.status === 302 || res.status === 308) {
          liveHeuristics.push(candidate);
        }
      } catch {
        // Ignore dead heuristic candidates.
      }
    }

    return Array.from(new Set(liveHeuristics));
  } catch {
    return [];
  }
}

async function auditSite(registryKey: string, entry: SiteEntry): Promise<SiteAudit | null> {
  if (!entry.slug) return null;

  const outputDir = path.join(PROJECT_ROOT, 'output', entry.slug);
  if (!fs.existsSync(outputDir)) return null;

  const locales = readLocalesFromProjectDir(outputDir);
  const resolvedLocales = locales.length > 0 ? locales : getLocalesForRegion(entry.regionId);
  if (resolvedLocales.length === 0) return null;
  const projectDomainUrls = await getProjectOwnedDomains(outputDir, entry.slug);
  const auditedBaseUrls = Array.from(new Set([
    ...(entry.url ? [trimTrailingSlash(entry.url)] : []),
    ...projectDomainUrls.map(trimTrailingSlash),
  ]));
  if (auditedBaseUrls.length === 0) return null;
  const [primaryUrl, ...extraUrls] = auditedBaseUrls;
  const audit = await waitForHealthyLocaleRoutes(primaryUrl, resolvedLocales, AUDIT_ATTEMPTS, AUDIT_DELAY_MS);
  const extraDomainAudits = await Promise.all(
    extraUrls.map(async (baseUrl) => ({
      ...(await waitForHealthyLocaleRoutes(baseUrl, resolvedLocales, AUDIT_ATTEMPTS, AUDIT_DELAY_MS)),
      baseUrl,
    })),
  );
  const allAuditsOk = audit.ok && extraDomainAudits.every((domainAudit) => domainAudit.ok);

  return {
    registryKey,
    slug: entry.slug,
    outputDir,
    deployedUrl: audit.baseUrl,
    registryUrlMissing: !entry.url,
    auditedBaseUrls,
    extraDomainAudits,
    ...audit,
    ok: allAuditsOk,
  };
}

async function repairSite(audit: SiteAudit): Promise<RepairResult> {
  const outDir = path.join(audit.outputDir, 'out');
  if (!fs.existsSync(outDir)) {
    return {
      slug: audit.slug,
      before: audit,
      repaired: false,
      error: `Missing out/ directory: ${outDir}`,
    };
  }

  try {
    log(`Redeploying ${audit.slug} from ${outDir}`);
    const deploy = await deployToVercel(outDir, audit.slug);
    registerDeployed(audit.registryKey, audit.slug, deploy.url);

    const afterAudit = await waitForHealthyLocaleRoutes(deploy.url, audit.locales, AUDIT_ATTEMPTS, AUDIT_DELAY_MS);
    const projectDomainUrls = await getProjectOwnedDomains(audit.outputDir, audit.slug);
    const extraDomainAudits = await Promise.all(
      projectDomainUrls
        .map(trimTrailingSlash)
        .filter((baseUrl) => trimTrailingSlash(afterAudit.baseUrl) !== baseUrl)
        .map(async (baseUrl) => ({
          ...(await waitForHealthyLocaleRoutes(baseUrl, audit.locales, AUDIT_ATTEMPTS, AUDIT_DELAY_MS)),
          baseUrl,
        })),
    );
    const after: SiteAudit = {
      registryKey: audit.registryKey,
      slug: audit.slug,
      outputDir: audit.outputDir,
      deployedUrl: afterAudit.baseUrl,
      registryUrlMissing: audit.registryUrlMissing,
      auditedBaseUrls: Array.from(new Set([afterAudit.baseUrl, ...projectDomainUrls.map(trimTrailingSlash)])),
      extraDomainAudits,
      ...afterAudit,
      ok: afterAudit.ok && extraDomainAudits.every((domainAudit) => domainAudit.ok),
    };

    return {
      slug: audit.slug,
      before: audit,
      after: after ?? undefined,
      redeployedUrl: deploy.url,
      repaired: Boolean(after?.ok),
      error: after?.ok ? undefined : 'Locale routes still unhealthy after redeploy',
    };
  } catch (error) {
    return {
      slug: audit.slug,
      before: audit,
      repaired: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const onlySlug = getArg(args, 'slug', '').trim();
  const limitRaw = getArg(args, 'limit', '');
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : Number.POSITIVE_INFINITY;
  const checkOnly = hasFlag(args, 'check-only');
  const includeHealthy = hasFlag(args, 'include-healthy');
  const fillMissing = hasFlag(args, 'fill-missing');

  const audits: SiteAudit[] = [];
  for (const [registryKey, entry] of Object.entries(readRegistry())) {
    if (onlySlug && entry.slug !== onlySlug) continue;
    const audit = await auditSite(registryKey, entry);
    if (!audit) continue;
    audits.push(audit);
  }

  const failing = audits.filter((audit) => !audit.ok).slice(0, limit);
  const healthy = audits.filter((audit) => audit.ok);

  log(`Audited ${audits.length} sites, found ${failing.length} sites with broken locale refresh routes`);

  const repairs: RepairResult[] = [];
  let filledMissing = 0;
  if ((fillMissing || !checkOnly) && !onlySlug) {
    for (const audit of healthy) {
      if (!audit.registryUrlMissing) continue;
      registerDeployed(audit.registryKey, audit.slug, audit.deployedUrl);
      filledMissing++;
    }
  }
  if (!checkOnly) {
    for (const audit of failing) {
      repairs.push(await repairSite(audit));
    }
  }

  const result = {
    checked: audits.length,
    healthy: healthy.length,
    broken: failing.length,
    repaired: repairs.filter((repair) => repair.repaired).length,
    failedRepairs: repairs.filter((repair) => !repair.repaired).length,
    filledMissing,
    sites: [
      ...(includeHealthy ? healthy : []),
      ...(checkOnly ? failing : repairs),
    ],
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (checkOnly) {
    process.exit(failing.length > 0 ? 1 : 0);
  }

  const hasFailure = repairs.some((repair) => !repair.repaired);
  process.exit(hasFailure ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[repair-locale-routes] ${message}\n`);
    process.exit(1);
  });
}
