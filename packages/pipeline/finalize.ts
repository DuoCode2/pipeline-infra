/**
 * Post-design finalization: build -> quality check -> deploy -> git push -> log.
 *
 * Usage:
 *   npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ [--slug name] [--dry-run]
 *
 * Outputs clean JSON to stdout; progress logs go to stderr.
 */
import 'dotenv/config';

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { deployToVercel } from '../deploy/deploy';
import { publishGeneratedSite } from '../deploy/publish';
import { runLocalQualityGate } from '../quality/serve-and-check';
import { getArg, hasFlag } from '../utils/cli';
import { getLocalesForRegion } from '../utils/env';
import { logAction } from '../utils/n8n';
import { registerDeployed } from '../utils/registry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FinalizeResult {
  status: 'deployed' | 'build-failed' | 'quality-failed';
  url?: string;
  scores?: Record<string, number>;
  failures?: Array<{
    category: string;
    audit: string;
    description: string;
    elements?: string[];
  }>;
  error?: string;
}

const log = (msg: string) => process.stderr.write(`[finalize] ${msg}\n`);

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function finalize(options: {
  dir: string;
  slug?: string;
  dryRun?: boolean;
  /** Override the URL path for quality gate check (default: auto-detect /en/ or /) */
  checkPath?: string;
  /** Skip build step (use existing out/ directory) */
  skipBuild?: boolean;
}): Promise<FinalizeResult> {
  const dir = path.resolve(options.dir);
  const slug = options.slug || path.basename(dir);
  const dryRun = options.dryRun ?? false;
  const outDir = path.join(dir, 'out');

  log(`Dir  : ${dir}`);
  log(`Slug : ${slug}`);
  log(`Dry  : ${dryRun}`);

  // ------------------------------------------------------------------
  // 1. Build (skip if --skip-build and out/ exists)
  // ------------------------------------------------------------------
  if (options.skipBuild && fs.existsSync(outDir)) {
    log('Skipping build (--skip-build, using existing out/)');
  } else {
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
      log('Removed stale out/ — rebuilding...');
    } else {
      log('Building...');
    }

    // Check node_modules exists — worktree cleanup may have removed it
    const nodeModulesDir = path.join(dir, 'node_modules');
    if (!fs.existsSync(nodeModulesDir)) {
      log('node_modules missing — running npm install first...');
    }

    try {
      execSync('npm install --silent && npm run build', {
        cwd: dir,
        stdio: 'pipe',
        timeout: 180_000, // 3min for concurrent builds
      });
    } catch (err: unknown) {
      // Capture BOTH stdout and stderr — Next.js writes errors to both
      let errorOutput = '';
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        if ('stderr' in e) {
          const buf = e.stderr;
          errorOutput += buf instanceof Buffer ? buf.toString() : String(buf);
        }
        if ('stdout' in e) {
          const buf = e.stdout;
          const out = buf instanceof Buffer ? buf.toString() : String(buf);
          if (out.trim()) errorOutput += (errorOutput ? '\n' : '') + out;
        }
      }
      if (!errorOutput) {
        errorOutput = err instanceof Error ? err.message : String(err);
      }
      log('Build FAILED');
      return { status: 'build-failed', error: errorOutput };
    }
  }

  if (!fs.existsSync(outDir)) {
    return { status: 'build-failed', error: 'Build produced no out/ directory' };
  }
  log('Build OK');

  // ------------------------------------------------------------------
  // 1b. Remove non-deployable files from out/ (Next.js copies all of public/)
  // ------------------------------------------------------------------
  const outImagesDir = path.join(outDir, 'images');
  if (fs.existsSync(outImagesDir)) {
    // Remove image-manifest.json (build artifact, not for deployment)
    const manifestInOut = path.join(outDir, 'image-manifest.json');
    if (fs.existsSync(manifestInOut)) {
      fs.unlinkSync(manifestInOut);
    }
    // Remove attribution.json from out/ (keep in project root for compliance)
    const attrInOut = path.join(outDir, 'attribution.json');
    if (fs.existsSync(attrInOut)) {
      fs.unlinkSync(attrInOut);
    }
  }

  // ------------------------------------------------------------------
  // 2. Read region + locale from lead.json (prepared by prepare.ts)
  // ------------------------------------------------------------------
  const leadJsonPath2 = path.join(dir, 'lead.json');
  let regionId = 'xx';
  let defaultLocale = 'en';
  if (fs.existsSync(leadJsonPath2)) {
    try {
      const leadData = JSON.parse(fs.readFileSync(leadJsonPath2, 'utf8'));
      if (leadData.regionId) regionId = leadData.regionId;
      if (leadData.defaultLocale) defaultLocale = leadData.defaultLocale;
    } catch { /* ignore parse errors */ }
  }
  if (regionId === 'xx') {
    log('[warn] No regionId in lead.json — using fallback (xx)');
  }

  // ------------------------------------------------------------------
  // 3. Ensure root vercel.json exists for Vercel REST config
  // ------------------------------------------------------------------
  const vercelConfigPath = path.join(dir, 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    // Only add locale redirect if the build has locale directories
    const hasLocaleDir = fs.existsSync(path.join(outDir, defaultLocale, 'index.html'));
    const vercelConfig = hasLocaleDir
      ? { redirects: [{ source: '/', destination: `/${defaultLocale}`, statusCode: 301 }] }
      : {}; // no redirect needed for non-locale sites
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    log(hasLocaleDir ? `vercel.json created (/ → /${defaultLocale})` : 'vercel.json created (no locale redirect)');
  }

  // ------------------------------------------------------------------
  // 4. Generate sitemap.xml (pre-deploy with expected URL; updated post-deploy)
  // ------------------------------------------------------------------
  const locales = getLocalesForRegion(regionId);
  function writeSitemap(baseUrl: string) {
    const sitemapUrls = locales
      .map((l) => `  <url><loc>${baseUrl}/${l}</loc></url>`)
      .join('\n');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
  }
  writeSitemap(`https://${slug}.vercel.app`);
  log('sitemap.xml written');

  // ------------------------------------------------------------------
  // 4. Run local quality gate (smart retry: only for score fluctuations)
  // ------------------------------------------------------------------
  // Lighthouse performance scores fluctuate ±5 between runs. But a11y, SEO,
  // and best-practices failures are deterministic code issues — retrying the
  // same code won't improve the score. Only retry when the sole failures are
  // warn-level categories (performance).
  const MAX_QA_RETRIES = 2;
  let quality!: Awaited<ReturnType<typeof runLocalQualityGate>>;

  for (let attempt = 1; attempt <= MAX_QA_RETRIES + 1; attempt++) {
    quality = await runLocalQualityGate({
      buildDir: outDir,
      outputDir: dir,
      screenshotDir: path.join(dir, 'screenshots'),
      checkPath: options.checkPath,
      logger: log,
      warn: (msg) => log(`[warn] ${msg}`),
      commandStdio: 'pipe',
    });

    if (quality.allPass || attempt > MAX_QA_RETRIES) break;

    // Check if any error-level category failed — if so, don't retry.
    const hasErrorLevelFailure = Object.values(quality.lighthouse)
      .some(r => !r.pass && r.level === 'error');
    if (hasErrorLevelFailure) {
      log('Quality gate failed on error-level category (a11y/SEO/BP) — no retry, fix code');
      break;
    }

    log(`Quality gate attempt ${attempt}/${MAX_QA_RETRIES + 1}: only warn-level failures, retrying...`);
  }

  const scores = Object.fromEntries(
    Object.entries(quality.lighthouse).map(([name, result]) => [name, result.score]),
  );

  if (!quality.allPass) {
    log('Quality gate FAILED after retries');
    return { status: 'quality-failed', scores, failures: quality.failures };
  }

  log('Quality gate PASSED');

  // ------------------------------------------------------------------
  // 5. Deploy + Git push (unless dry-run)
  // ------------------------------------------------------------------
  if (dryRun) {
    log('Dry run — skipping deploy and git push');
    return { status: 'deployed', scores };
  }

  log('Deploying to Vercel...');
  const deploy = await deployToVercel(outDir, slug);
  log(`Deployed: ${deploy.url}`);

  // ── REGISTER IMMEDIATELY after deploy success ──────────────────
  // This MUST happen before health check, git push, or any other step
  // that could fail. Otherwise the registry stays empty (issue #3 + #7).
  let placeId = slug;
  let industry: string | undefined;
  const leadJsonPath = path.join(dir, 'lead.json');
  if (fs.existsSync(leadJsonPath)) {
    try {
      const leadData = JSON.parse(fs.readFileSync(leadJsonPath, 'utf8'));
      if (leadData.place_id) placeId = leadData.place_id;
      if (leadData.industry) industry = leadData.industry;
    } catch { /* ignore parse errors */ }
  }
  registerDeployed(placeId, slug, deploy.url);
  log(`Registry updated: ${placeId} → ${deploy.url}`);

  // ── Post-deploy health check (non-blocking — warn only) ────────
  try {
    await new Promise(r => setTimeout(r, 3000)); // wait for propagation
    const healthCheck = await fetch(deploy.url, { method: 'HEAD', redirect: 'follow' });
    if (healthCheck.ok) {
      log(`Health check: ${deploy.url} → ${healthCheck.status} OK`);
    } else {
      log(`[warn] Health check: ${deploy.url} → ${healthCheck.status} (may need time to propagate)`);
    }
  } catch {
    log(`[warn] Health check failed for ${deploy.url} (may need time to propagate)`);
  }

  // Update sitemap if actual URL differs from pre-deploy assumption
  const expectedUrl = `https://${slug}.vercel.app`;
  if (deploy.url !== expectedUrl) {
    writeSitemap(deploy.url);
    log(`sitemap.xml updated with actual URL: ${deploy.url}`);
  }

  log(`Publishing git repo for ${slug}...`);
  try {
    const publish = publishGeneratedSite({
      dir,
      slug,
      commitMessage: `feat: generated site for ${slug}`,
      homepage: deploy.url,
      description: `Generated landing page for ${slug}`,
    });
    log(
      publish.pushed
        ? `Pushed: github.com/${publish.repo}`
        : `No git changes to push for ${publish.repo}`,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`Git publish warning (non-fatal): ${msg}`);
  }

  // Log to n8n (optional, fire-and-forget)
  logAction({ place_id: placeId, slug, action: 'deployed', result: deploy.url, url: deploy.url, industry, qa_score: scores });

  return { status: 'deployed', url: deploy.url, scores };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (hasFlag(args, 'help') || hasFlag(args, 'h')) {
    process.stderr.write(`Usage: npx tsx packages/pipeline/finalize.ts --dir <path> [options]

Options:
  --dir <path>        Site directory (REQUIRED)
  --slug <name>       Override slug (default: directory name)
  --dry-run           Build + quality check but skip deploy
  --skip-build        Use existing out/ directory (skip npm install + build)
  --check-path <path> Override URL path for Lighthouse (default: auto-detect /en/ or /)
  --help, -h          Show this help message
`);
    process.exit(0);
  }

  const dir = getArg(args, 'dir');
  if (!dir) {
    process.stderr.write('Error: --dir is required. Use --help for usage info.\n');
    process.exit(1);
  }

  if (!fs.existsSync(dir)) {
    process.stderr.write(`Directory does not exist: ${dir}\n`);
    process.exit(1);
  }

  const slug = getArg(args, 'slug');
  const dryRun = hasFlag(args, 'dry-run');
  const skipBuild = hasFlag(args, 'skip-build');
  const checkPath = getArg(args, 'check-path');

  try {
    const result = await finalize({ dir, slug, dryRun, skipBuild, checkPath });

    // Output clean JSON to stdout for Claude to consume.
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');

    process.exit(result.status === 'deployed' ? 0 : 1);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const errorResult: FinalizeResult = { status: 'build-failed', error: msg };
    process.stdout.write(JSON.stringify(errorResult, null, 2) + '\n');
    process.exit(1);
  }
}

main();
