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
      const stderr =
        err && typeof err === 'object' && 'stderr' in err
          ? (err as { stderr: Buffer }).stderr?.toString()
          : err instanceof Error
            ? err.message
            : String(err);
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
  const locales = ['en', 'ms', 'zh-CN', 'zh-TW'];
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
  // 4. Run local quality gate
  // ------------------------------------------------------------------
  const quality = await runLocalQualityGate({
    buildDir: outDir,
    outputDir: dir,
    screenshotDir: path.join(dir, 'screenshots'),
    logger: log,
    warn: (msg) => log(`[warn] ${msg}`),
    commandStdio: 'pipe',
  });

  const scores = Object.fromEntries(
    Object.entries(quality.lighthouse).map(([name, result]) => [name, result.score]),
  );

  if (!quality.allPass) {
    log('Quality gate FAILED');
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

  fetch('http://localhost:5678/webhook/log-work', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      place_id: slug,
      action: 'deployed',
      result: deploy.url,
      qa_score: scores,
    }),
  }).catch(() => {}); // fire and forget

  return { status: 'deployed', url: deploy.url, scores };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : undefined;
  };
  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  const dir = getArg('dir');
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

  const slug = getArg('slug');
  const dryRun = hasFlag('dry-run');

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
