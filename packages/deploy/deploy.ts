import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { requireEnv, optionalEnv } from '../utils/env';
import { getArg } from '../utils/cli';

const VERCEL_API = 'https://api.vercel.com';

/** Lazy-loaded token — only evaluated when deployToVercel() is actually called. */
function getVercelToken(): string {
  return requireEnv('VERCEL_TOKEN');
}

/** Vercel Team/Org scope (slug). When set, all deploys go to this team. */
function getVercelScope(): string | undefined {
  return process.env.VERCEL_SCOPE || undefined;
}

const EXCLUDE_DIRS = new Set(['.next', 'node_modules', '.git', 'screenshots', 'src', '.vercel']);
const EXCLUDE_FILES = new Set(['.env', '.env.local', '.DS_Store', 'package-lock.json']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

interface DeployResult {
  url: string;
  projectId: string;
  deploymentId: string;
}

interface DeploymentState {
  id: string;
  url: string;
  readyState: string;
  alias?: string[];
  aliasAssigned?: boolean;
}

interface ShadowedCleanUrl {
  directory: string;
  htmlFile: string;
}

interface CliDeployOutput {
  id?: string;
  url?: string;
  deployment?: {
    id?: string;
    url?: string;
  };
}

/**
 * Disable Vercel Authentication (ssoProtection) on a project so .vercel.app URLs are public.
 * Pro teams default to Standard Protection which requires Vercel login on all non-custom-domain URLs.
 * This is a no-op if protection is already disabled.
 */
async function ensureProjectSettings(slug: string, token: string, scope?: string): Promise<void> {
  const teamQuery = scope ? `?teamId=${scope}` : '';
  try {
    const projRes = await fetch(`${VERCEL_API}/v9/projects/${encodeURIComponent(slug)}${teamQuery}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!projRes.ok) {
      console.warn(`[deploy] Could not look up project "${slug}": ${projRes.status}`);
      return;
    }
    const proj = await projRes.json() as Record<string, unknown>;
    const rc = proj.resourceConfig as Record<string, unknown> | undefined;

    // Build patch: disable SSO protection + force Standard build machine
    const patch: Record<string, unknown> = {};
    if (proj.ssoProtection != null) patch.ssoProtection = null;
    if (rc?.buildMachineType !== 'standard') patch.resourceConfig = { buildMachineType: 'standard' };

    if (Object.keys(patch).length === 0) return; // nothing to change

    const patchRes = await fetch(`${VERCEL_API}/v9/projects/${encodeURIComponent(slug)}${teamQuery}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (patchRes.ok) {
      if (patch.ssoProtection === null) console.log(`[deploy] Disabled ssoProtection on "${slug}"`);
      if (patch.resourceConfig) console.log(`[deploy] Forced Standard build machine on "${slug}" (was ${rc?.buildMachineType || 'unknown'})`);
    } else {
      console.warn(`[deploy] Failed to patch project "${slug}": ${patchRes.status}`);
    }
  } catch (err) {
    console.warn(`[deploy] Error patching project: ${err instanceof Error ? err.message : err}`);
  }
}

function toHttps(hostname: string): string {
  return hostname.startsWith('http') ? hostname : `https://${hostname}`;
}

async function resolveStableProjectUrl(
  slug: string,
  token: string,
  scope?: string,
): Promise<string | null> {
  const teamQuery = scope ? `?teamId=${scope}` : '';
  try {
    const projRes = await fetch(`${VERCEL_API}/v9/projects/${encodeURIComponent(slug)}${teamQuery}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!projRes.ok) {
      console.warn(`[deploy] Could not resolve project domains for "${slug}": ${projRes.status}`);
      return null;
    }

    const proj = await projRes.json() as Record<string, unknown>;
    const domains = Array.isArray(proj.domains)
      ? proj.domains.filter((domain): domain is string => typeof domain === 'string')
      : [];

    const preferred = scope ? `${slug}-${scope}.vercel.app` : '';
    const candidates = [
      ...(preferred && domains.includes(preferred) ? [preferred] : []),
      ...domains.filter((domain) => domain !== preferred),
    ];

    for (const domain of candidates) {
      const url = toHttps(domain);
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(5_000),
        });
        if (res.ok || res.status === 301 || res.status === 308) {
          return url;
        }
      } catch {
        // Try the next domain.
      }
    }

    return candidates.length > 0 ? toHttps(candidates[0]) : null;
  } catch (err) {
    console.warn(`[deploy] Error resolving project domains: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function assignAliasToDeployment(
  deploymentId: string,
  alias: string,
  token: string,
  scope?: string,
): Promise<boolean> {
  const teamQuery = scope ? `?teamId=${scope}` : '';
  try {
    const aliasRes = await fetch(`${VERCEL_API}/v2/deployments/${deploymentId}/aliases${teamQuery}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias }),
    });
    if (aliasRes.ok) return true;
    console.warn(`[deploy] Explicit alias failed: ${aliasRes.status} ${await aliasRes.text()}`);
    return false;
  } catch (err) {
    console.warn(`[deploy] Explicit alias request error: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

function resolveDeploymentUrl(
  slug: string,
  current?: Partial<DeploymentState>,
): string {
  // Prefer the alias that matches {slug}.vercel.app (our canonical URL).
  const slugAlias = current?.alias?.find(a => a === `${slug}.vercel.app`);
  if (slugAlias) return toHttps(slugAlias);

  // Fall back to any alias assigned by Vercel.
  const anyAlias = current?.alias?.[0];
  if (anyAlias) return toHttps(anyAlias);

  // Last resort: raw deployment URL.
  if (current?.url) return toHttps(current.url);

  // Construct expected canonical URL (deploy was created with name=slug).
  return `https://${slug}.vercel.app`;
}

/**
 * Scan out/ for .html files and generate Build Output API v3 overrides.
 * Overrides map "en.html" → path "en" so Vercel serves /en without extension.
 * This is the ONLY reliable way to get clean URLs with static deploys.
 */
export function generateHtmlOverrides(outDir: string): Record<string, { path: string }> {
  const overrides: Record<string, { path: string }> = {};
  function scan(dir: string, prefix: string = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory() && entry.name !== '_next' && entry.name !== '.vercel') {
        scan(path.join(dir, entry.name), rel);
      } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
        // en.html → "en", subdir/page.html → "subdir/page"
        overrides[rel] = { path: rel.replace(/\.html$/, '') };
      }
    }
  }
  scan(outDir);
  return overrides;
}

/**
 * Detect clean URL collisions where Vercel's filesystem handling can prefer a
 * directory (for example /en) over the sibling HTML file (en.html).
 *
 * Next.js static export emits exactly this shape when a locale landing page
 * coexists with nested routes such as /en/products.
 */
export function findShadowedCleanUrls(outDir: string): ShadowedCleanUrl[] {
  const collisions: ShadowedCleanUrl[] = [];

  function scan(dir: string, prefix: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const entryNames = new Set(entries.map((entry) => entry.name));

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === '_next' || entry.name === '.vercel') continue;

      const htmlFile = `${entry.name}.html`;
      if (entryNames.has(htmlFile)) {
        const relativeDir = prefix ? `${prefix}/${entry.name}` : entry.name;
        const relativeHtml = prefix ? `${prefix}/${htmlFile}` : htmlFile;
        collisions.push({ directory: relativeDir, htmlFile: relativeHtml });
      }

      const childPrefix = prefix ? `${prefix}/${entry.name}` : entry.name;
      scan(path.join(dir, entry.name), childPrefix);
    }
  }

  scan(outDir);
  return collisions;
}

function readDefaultLocale(projectDir: string): string {
  const leadPath = path.join(projectDir, 'lead.json');
  if (fs.existsSync(leadPath)) {
    try {
      const lead = JSON.parse(fs.readFileSync(leadPath, 'utf8')) as Record<string, unknown>;
      if (typeof lead.defaultLocale === 'string' && lead.defaultLocale) {
        return lead.defaultLocale;
      }
    } catch {
      // Fall through to file-based detection.
    }
  }

  const i18nPath = path.join(projectDir, 'src/lib/i18n.ts');
  if (fs.existsSync(i18nPath)) {
    const source = fs.readFileSync(i18nPath, 'utf8');
    const match = source.match(/defaultLocale:\s*Locale\s*=\s*'([^']+)'/);
    if (match?.[1]) return match[1];
  }

  return 'en';
}

export function buildFallbackVercelConfig(projectDir: string, buildDir: string): string | null {
  const defaultLocale = readDefaultLocale(projectDir);
  const defaultLocaleHtml = path.join(buildDir, `${defaultLocale}.html`);
  if (!fs.existsSync(defaultLocaleHtml)) return null;

  return JSON.stringify({
    cleanUrls: true,
    trailingSlash: false,
    redirects: [
      { source: '/', destination: `/${defaultLocale}`, statusCode: 301 },
    ],
  }, null, 2);
}

/**
 * Convert out/ into Vercel Build Output API v3 format (.vercel/output/).
 * This is required for --prebuilt deploys which skip remote builds entirely.
 * Structure: .vercel/output/config.json + .vercel/output/static/{files}
 *
 * COST IMPACT: --prebuilt = $0 build charges (no remote build machine spins up).
 * Without --prebuilt, even buildCommand="" still costs ~$0.04/deploy on Standard.
 *
 * IMPORTANT: the output directory must be self-contained. Symlinks inside
 * `.vercel/output/static` are not reliable once the CLI uploads the archive,
 * so we copy the files instead of linking them.
 */
export function prepareBuildOutputAPI(outDir: string): string {
  const outputDir = path.join(outDir, '.vercel', 'output');
  const staticDir = path.join(outputDir, 'static');

  // Generate overrides for clean URLs (en.html → /en)
  const overrides = generateHtmlOverrides(outDir);

  // Write config.json with version, routes for clean URLs, and overrides
  fs.mkdirSync(outputDir, { recursive: true });
  const config = {
    version: 3,
    routes: [
      { handle: 'filesystem' as const },
      // Redirect .html URLs to clean versions
      { src: '^/(?:(.+)/)?index(?:\\.html)?/?$', headers: { Location: '/$1' }, status: 308 },
      { src: '^/(.*)\\.html/?$', headers: { Location: '/$1' }, status: 308 },
      // Remove trailing slashes
      { src: '^/(.+)/$', headers: { Location: '/$1' }, status: 308 },
    ],
    overrides,
  };
  fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify(config, null, 2));
  console.log(`[deploy] Build Output API: ${Object.keys(overrides).length} HTML overrides for clean URLs`);

  // Copy static/ contents so the uploaded Build Output archive is self-contained.
  if (fs.existsSync(staticDir)) fs.rmSync(staticDir, { recursive: true });
  fs.mkdirSync(staticDir, { recursive: true });

  for (const entry of fs.readdirSync(outDir)) {
    if (entry === '.vercel') continue;
    const src = path.join(outDir, entry);
    const dest = path.join(staticDir, entry);
    fs.cpSync(src, dest, { recursive: true });
  }

  return outputDir;
}

/**
 * CLI fallback for large sites (>10MB) that exceed REST API limits.
 * Uses --prebuilt with Build Output API v3 format to completely skip
 * remote builds. $0 build charges.
 */
async function tryDeployViaCLI(projectDir: string, slug: string, token: string, scope?: string): Promise<DeployResult | null> {
  try {
    execSync('npx vercel --version', { stdio: 'pipe', timeout: 10_000 });
  } catch {
    console.log('[deploy] Vercel CLI not available');
    return null;
  }

  const outDir = path.join(projectDir, 'out');
  if (!fs.existsSync(outDir)) {
    console.warn('[deploy] No out/ directory found — cannot deploy via CLI');
    return null;
  }

  try {
    console.log(`[deploy] Using Vercel CLI with --prebuilt (${slug}) — zero remote build cost`);

    // Convert out/ to Build Output API v3 format for --prebuilt
    prepareBuildOutputAPI(outDir);

    // Ensure .vercel/project.json exists (required for CLI)
    const vercelDir = path.join(outDir, '.vercel');
    const projectJsonPath = path.join(vercelDir, 'project.json');
    if (!fs.existsSync(projectJsonPath)) {
      try {
        const scopeFlag = scope ? ` --scope ${scope}` : '';
        execSync(`npx vercel link --yes --project ${slug}${scopeFlag}`, {
          cwd: outDir,
          stdio: 'pipe',
          timeout: 30_000,
          env: { ...process.env, VERCEL_TOKEN: token },
        });
      } catch {
        // Link failed — project may not exist yet
      }
    }

    // Copy .vercel/project.json from parent if needed
    const parentVercel = path.join(projectDir, '.vercel', 'project.json');
    if (fs.existsSync(parentVercel) && !fs.existsSync(projectJsonPath)) {
      fs.copyFileSync(parentVercel, projectJsonPath);
    }

    // Verify project.json exists and contains a valid projectId
    if (!fs.existsSync(projectJsonPath)) {
      console.warn('[deploy] CLI: project.json missing after link — falling back to REST API');
      return null;
    }
    try {
      const projJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      if (!projJson.projectId || typeof projJson.projectId !== 'string') {
        console.warn('[deploy] CLI: project.json has no valid projectId — falling back to REST API');
        return null;
      }
    } catch {
      console.warn('[deploy] CLI: project.json is malformed — falling back to REST API');
      return null;
    }

    // --prebuilt: uses .vercel/output/ directly, NO remote build, $0 cost
    const deployScopeFlag = scope ? ` --scope ${scope}` : '';
    const output = execSync(
      `npx vercel deploy --prebuilt --prod --archive=tgz --yes --json --token ${token}${deployScopeFlag}`,
      {
        cwd: outDir,
        stdio: 'pipe',
        timeout: 180_000,
        env: { ...process.env, VERCEL_TOKEN: token },
      },
    ).toString().trim();

    let deployUrl = '';
    let deploymentId = '';

    try {
      const parsed = JSON.parse(output) as CliDeployOutput;
      deployUrl = parsed.deployment?.url || parsed.url || '';
      deploymentId = parsed.deployment?.id || parsed.id || deployUrl;
    } catch {
      const lines = output.split('\n');
      const fallbackUrl = lines[lines.length - 1]?.trim();
      if (fallbackUrl && fallbackUrl.startsWith('http')) {
        deployUrl = fallbackUrl;
        deploymentId = fallbackUrl;
      }
    }

    if (deployUrl) {
      const rawUrl = toHttps(deployUrl);
      const prodUrl = `https://${slug}.vercel.app`;
      const alias = `${slug}.vercel.app`;
      const aliasAssigned = deploymentId
        ? await assignAliasToDeployment(deploymentId, alias, token, scope)
        : false;
      const stableProjectUrl = aliasAssigned
        ? prodUrl
        : await resolveStableProjectUrl(slug, token, scope);
      console.log(`[deploy] CLI deployed (no remote build): ${rawUrl}`);
      if (aliasAssigned) {
        console.log(`[deploy] Production URL: ${prodUrl}`);
      } else {
        console.log(
          `[deploy] Production alias not confirmed, using ${stableProjectUrl || rawUrl} instead of ${prodUrl}`,
        );
      }
      return {
        url: aliasAssigned ? prodUrl : (stableProjectUrl || rawUrl),
        projectId: slug,
        deploymentId,
      };
    }

    console.warn(`[deploy] CLI output unexpected: ${output.slice(0, 200)}`);
    return null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    let stderr = '';
    if (err && typeof err === 'object' && 'stderr' in err) {
      const buf = (err as Record<string, unknown>).stderr;
      stderr = buf instanceof Buffer ? buf.toString() : String(buf);
    }
    console.warn(`[deploy] CLI deploy failed: ${msg.slice(0, 300)}`);
    if (stderr) console.warn(`[deploy] CLI stderr: ${stderr.slice(0, 300)}`);
    return null;
  }
}

export async function deployToVercel(buildDir: string, slug: string): Promise<DeployResult> {
  const token = getVercelToken(); // lazy — only throws when actually deploying
  const scope = getVercelScope();

  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  const projectDir = path.resolve(buildDir, '..');

  if (scope) {
    console.log(`[deploy] Using Vercel Team scope: ${scope}`);
  }

  const shadowedCleanUrls = findShadowedCleanUrls(buildDir);
  if (shadowedCleanUrls.length > 0) {
    const sample = shadowedCleanUrls.slice(0, 3)
      .map((item) => `${item.directory} ↔ ${item.htmlFile}`)
      .join(', ');
    console.log(
      `[deploy] Detected ${shadowedCleanUrls.length} clean URL collisions (${sample}). ` +
      'Using CLI --prebuilt with Build Output API overrides to preserve locale refresh routes.',
    );
    const cliResult = await tryDeployViaCLI(projectDir, slug, token, scope);
    if (cliResult) {
      await ensureProjectSettings(slug, token, scope);
      return cliResult;
    }
    throw new Error(
      'Detected directory/html clean URL collisions that require Build Output API overrides, ' +
      'but CLI --prebuilt deployment failed. Install or enable the Vercel CLI and retry.',
    );
  }

  // ── Strategy 1: REST API (preferred — uploads prebuilt static files, NO remote build) ──
  // Uploads out/ as static files with framework:null → Vercel serves as-is.
  // This is FREE — no Turbo Build Machine charges.
  // Only falls through to CLI if total size exceeds 10MB REST API limit.
  console.log('[deploy] Attempting REST API deploy (static files, no remote build)...');

  // Collect files from out/, skip large dirs
  const files: Array<{ file: string; data: string }> = [];
  function collectFiles(dir: string, prefix: string = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        collectFiles(fullPath, relativePath);
      } else {
        if (EXCLUDE_FILES.has(entry.name)) continue;
        const stat = fs.statSync(fullPath);
        if (stat.size > MAX_FILE_SIZE) {
          console.warn(`Skipping large file (${(stat.size / 1024 / 1024).toFixed(1)}MB): ${relativePath}`);
          continue;
        }
        files.push({ file: relativePath, data: fs.readFileSync(fullPath).toString('base64') });
      }
    }
  }
  collectFiles(buildDir);

  // CRITICAL: Include vercel.json AS an uploaded file for clean URL routing.
  // The REST API body does NOT support cleanUrls/redirects/headers properties —
  // Vercel silently ignores them. Only vercel.json in the uploaded files works.
  const vercelConfigPath = path.join(projectDir, 'vercel.json');
  const fallbackVercelConfig = !fs.existsSync(vercelConfigPath)
    ? buildFallbackVercelConfig(projectDir, buildDir)
    : null;
  if (fs.existsSync(vercelConfigPath) || fallbackVercelConfig) {
    // Remove any existing vercel.json from files (may be in out/)
    const idx = files.findIndex(f => f.file === 'vercel.json');
    if (idx >= 0) files.splice(idx, 1);
    files.push({
      file: 'vercel.json',
      data: (
        fs.existsSync(vercelConfigPath)
          ? fs.readFileSync(vercelConfigPath)
          : Buffer.from(fallbackVercelConfig ?? '', 'utf8')
      ).toString('base64'),
    });
    console.log(
      fs.existsSync(vercelConfigPath)
        ? '[deploy] Including vercel.json as uploaded file for clean URL routing'
        : '[deploy] Synthesized vercel.json for clean locale routes',
    );
  }

  const totalBytes = files.reduce((sum, f) => sum + Buffer.byteLength(f.data, 'base64') * 0.75, 0);
  const totalMB = totalBytes / (1024 * 1024);
  console.log(`[deploy] REST API: ${files.length} files (${totalMB.toFixed(1)}MB)`);

  if (totalMB > 10) {
    // ── Strategy 2: CLI fallback for large sites (>10MB) ──────────────
    // Uses --prebuilt with Build Output API v3 to skip remote builds. $0 cost.
    console.log(`[deploy] REST API limit exceeded (${totalMB.toFixed(1)}MB > 10MB), falling back to CLI --prebuilt...`);
    const cliResult = await tryDeployViaCLI(projectDir, slug, token, scope);
    if (cliResult) {
      await ensureProjectSettings(slug, token, scope);
      return cliResult;
    }
    throw new Error(
      `Build is ${totalMB.toFixed(1)}MB — exceeds REST API 10MB limit, and CLI deploy also failed. ` +
      `Ensure Vercel CLI is installed and VERCEL_TOKEN + VERCEL_SCOPE are set correctly.`
    );
  }

  // Create deployment via REST API
  // IMPORTANT: Do NOT spread vercelConfig into the body — the API ignores it.
  // Clean URLs come from the vercel.json uploaded as a file above.
  const teamQuery = scope ? `?teamId=${scope}` : '';
  const res = await fetch(`${VERCEL_API}/v13/deployments${teamQuery}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: slug,
      files: files.map(f => ({ file: f.file, data: f.data, encoding: 'base64' })),
      projectSettings: { framework: null },
      target: 'production',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel deploy failed: ${res.status} ${err}`);
  }

  const deployment = (await res.json()) as DeploymentState;
  console.log(`Deployment created: ${deployment.url} (${deployment.readyState})`);

  // Disable Vercel Authentication so .vercel.app URLs are publicly accessible
  await ensureProjectSettings(slug, token, scope);

  // Detect slug collision: if Vercel added a scope suffix, the URL won't match {slug}.vercel.app
  const expectedHost = `${slug}.vercel.app`;
  if (deployment.url && !deployment.url.includes(expectedHost)) {
    console.warn(`[deploy] WARNING: Vercel assigned URL "${deployment.url}" instead of "${expectedHost}".`);
    console.warn(`[deploy] This usually means the slug "${slug}" was temporarily unavailable (concurrent deploy race).`);
    console.warn(`[deploy] Will attempt to set alias "${expectedHost}" after deployment is ready.`);
  }

  // Wait for READY + alias assignment
  const POLL_INTERVAL_MS = 5_000;
  const POLL_TIMEOUT_MS = 120_000;
  const maxPolls = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS);

  const MAX_CONSECUTIVE_FAILURES = 3;
  let consecutiveFailures = 0;

  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    let status: DeploymentState;
    try {
      const check = await fetch(`${VERCEL_API}/v13/deployments/${deployment.id}${teamQuery}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!check.ok) {
        throw new Error(`HTTP ${check.status}: ${await check.text()}`);
      }
      status = await check.json() as DeploymentState;
      consecutiveFailures = 0; // reset on success
    } catch (err) {
      consecutiveFailures++;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[deploy] Poll attempt ${i + 1} failed (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}): ${msg}`);
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        // Deployment was created — return expected URL rather than crashing
        console.warn('[deploy] Polling failed repeatedly, but deployment was created. Returning expected URL.');
        return { url: `https://${slug}.vercel.app`, projectId: slug, deploymentId: deployment.id };
      }
      continue;
    }

    if (status.readyState === 'ERROR') {
      throw new Error(`Vercel deployment failed (id=${deployment.id}, state=${status.readyState})`);
    }

    if (status.readyState === 'READY') {
      // Wait a few more polls for alias assignment if not yet done.
      if (status.aliasAssigned || status.alias?.length) {
        const prodUrl = resolveDeploymentUrl(slug, status);
        console.log(`Deployed: ${prodUrl}`);
        return { url: prodUrl, projectId: slug, deploymentId: deployment.id };
      }
      // READY but alias not yet assigned — keep polling (up to overall timeout).
    }
  }

  // Timeout: deployment may be READY but alias never arrived.
  // Explicitly assign alias via Vercel API as fallback.
  const expectedAlias = `${slug}.vercel.app`;
  console.log(`Alias not auto-assigned, explicitly setting ${expectedAlias}...`);
  try {
    if (await assignAliasToDeployment(deployment.id, expectedAlias, token, scope)) {
      const prodUrl = `https://${expectedAlias}`;
      console.log(`Deployed: ${prodUrl} (alias set explicitly)`);
      return { url: prodUrl, projectId: slug, deploymentId: deployment.id };
    }
  }
  catch { /* assignAliasToDeployment already logged */ }

  const stableProjectUrl = await resolveStableProjectUrl(slug, token, scope);
  if (stableProjectUrl) {
    console.log(`Deployed: ${stableProjectUrl} (project domain fallback)`);
    return { url: stableProjectUrl, projectId: slug, deploymentId: deployment.id };
  }

  // Final fallback: verify the URL actually responds before returning it.
  const fallbackUrl = `https://${expectedAlias}`;
  try {
    const verify = await fetch(fallbackUrl, { method: 'HEAD', redirect: 'follow' });
    if (verify.ok || verify.status === 301 || verify.status === 308) {
      console.log(`Deployed: ${fallbackUrl} (alias pending but URL responds)`);
      return { url: fallbackUrl, projectId: slug, deploymentId: deployment.id };
    }
  } catch { /* URL doesn't respond */ }

  // URL doesn't work — return the raw deployment URL with a warning
  const rawUrl = deployment.url ? toHttps(deployment.url) : fallbackUrl;
  console.warn(`[deploy] WARNING: ${fallbackUrl} is not responding. Using raw URL: ${rawUrl}`);
  console.warn(`[deploy] The alias may propagate later. Check manually: ${fallbackUrl}`);
  return { url: rawUrl, projectId: slug, deploymentId: deployment.id };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const buildDir = getArg(args, 'build-dir', '');
  const slug = getArg(args, 'slug', '');
  if (!buildDir || !slug) { console.error('Usage: --build-dir <path> --slug <name>'); process.exit(1); }
  deployToVercel(buildDir, slug)
    .then(r => console.log('Result:', JSON.stringify(r, null, 2)))
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
}
