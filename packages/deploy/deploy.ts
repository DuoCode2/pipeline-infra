import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';
import { getArg } from '../utils/cli';

const VERCEL_API = 'https://api.vercel.com';

/** Lazy-loaded token — only evaluated when deployToVercel() is actually called. */
function getVercelToken(): string {
  return requireEnv('VERCEL_TOKEN');
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

function toHttps(hostname: string): string {
  return hostname.startsWith('http') ? hostname : `https://${hostname}`;
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

export async function deployToVercel(buildDir: string, slug: string): Promise<DeployResult> {
  const token = getVercelToken(); // lazy — only throws when actually deploying

  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build directory not found: ${buildDir}`);
  }

  // Read vercel.json from project root (one level up from out/)
  const vercelConfigPath = path.join(path.resolve(buildDir, '..'), 'vercel.json');
  let vercelConfig: Record<string, unknown> = {};
  if (fs.existsSync(vercelConfigPath)) {
    vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  }

  // Collect files, skip large dirs
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
  console.log(`Deploying ${files.length} files to Vercel...`);

  // Create deployment via REST API
  const res = await fetch(`${VERCEL_API}/v13/deployments`, {
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
      ...vercelConfig,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vercel deploy failed: ${res.status} ${err}`);
  }

  const deployment = (await res.json()) as DeploymentState;
  console.log(`Deployment created: ${deployment.url} (${deployment.readyState})`);

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
      const check = await fetch(`${VERCEL_API}/v13/deployments/${deployment.id}`, {
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
    const aliasRes = await fetch(`${VERCEL_API}/v2/deployments/${deployment.id}/aliases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alias: expectedAlias }),
    });
    if (aliasRes.ok) {
      const prodUrl = `https://${expectedAlias}`;
      console.log(`Deployed: ${prodUrl} (alias set explicitly)`);
      return { url: prodUrl, projectId: slug, deploymentId: deployment.id };
    }
    console.warn(`Explicit alias failed: ${aliasRes.status} ${await aliasRes.text()}`);
  } catch (err) {
    console.warn(`Explicit alias request error: ${err instanceof Error ? err.message : err}`);
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
