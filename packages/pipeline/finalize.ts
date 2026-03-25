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
import { SUPPORTED_LOCALES } from '../utils/env';
import { logAction } from '../utils/n8n';

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
}): Promise<FinalizeResult> {
  const dir = path.resolve(options.dir);
  const slug = options.slug || path.basename(dir);
  const dryRun = options.dryRun ?? false;
  const outDir = path.join(dir, 'out');

  log(`Dir  : ${dir}`);
  log(`Slug : ${slug}`);
  log(`Dry  : ${dryRun}`);

  // ------------------------------------------------------------------
  // 1. Build (if out/ does not exist)
  // ------------------------------------------------------------------
  if (!fs.existsSync(outDir)) {
    log('out/ not found — running build...');
    try {
      execSync('npm install --silent && npm run build', {
        cwd: dir,
        stdio: 'pipe',
        timeout: 120_000,
      });
    } catch (err: unknown) {
      let stderr: string;
      if (err && typeof err === 'object' && 'stderr' in err) {
        const buf = (err as Record<string, unknown>).stderr;
        stderr = buf instanceof Buffer ? buf.toString() : String(buf);
      } else {
        stderr = err instanceof Error ? err.message : String(err);
      }
      log('Build FAILED');
      return { status: 'build-failed', error: stderr };
    }

    if (!fs.existsSync(outDir)) {
      return { status: 'build-failed', error: 'Build produced no out/ directory' };
    }
    log('Build OK');
  } else {
    log('out/ already exists — skipping build');
  }

  // ------------------------------------------------------------------
  // 2. Ensure root vercel.json exists for Vercel REST config
  // ------------------------------------------------------------------
  const vercelConfigPath = path.join(dir, 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    const vercelConfig = {
      redirects: [{ source: '/', destination: '/en', statusCode: 301 }],
    };
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
    log('vercel.json created');
  }

  // ------------------------------------------------------------------
  // 3. Generate sitemap.xml
  // ------------------------------------------------------------------
  const locales = SUPPORTED_LOCALES;
  const sitemapUrls = locales
    .map((l) => `  <url><loc>https://${slug}.vercel.app/${l}</loc></url>`)
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>
`;
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
  log('sitemap.xml written');

  // ------------------------------------------------------------------
  // 4. Run local quality gate (with retry — Lighthouse scores vary ±5)
  // ------------------------------------------------------------------
  const MAX_QA_RETRIES = 2;
  let quality!: Awaited<ReturnType<typeof runLocalQualityGate>>;

  for (let attempt = 1; attempt <= MAX_QA_RETRIES + 1; attempt++) {
    quality = await runLocalQualityGate({
      buildDir: outDir,
      outputDir: dir,
      screenshotDir: path.join(dir, 'screenshots'),
      logger: log,
      warn: (msg) => log(`[warn] ${msg}`),
      commandStdio: 'pipe',
    });

    if (quality.allPass || attempt > MAX_QA_RETRIES) break;
    log(`Quality gate attempt ${attempt}/${MAX_QA_RETRIES + 1} failed, retrying...`);
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
  logAction({ place_id: placeId, slug, action: 'deployed', result: deploy.url, url: deploy.url, industry, qa_score: scores });

  return { status: 'deployed', url: deploy.url, scores };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  const dir = getArg(args, 'dir');
  if (!dir) {
    process.stderr.write(
      'Usage: npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ [--slug name] [--dry-run]\n',
    );
    process.exit(1);
  }

  if (!fs.existsSync(dir)) {
    process.stderr.write(`Directory does not exist: ${dir}\n`);
    process.exit(1);
  }

  const slug = getArg(args, 'slug');
  const dryRun = hasFlag(args, 'dry-run');

  try {
    const result = await finalize({ dir, slug, dryRun });

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
