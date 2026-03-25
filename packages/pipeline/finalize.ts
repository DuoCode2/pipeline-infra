/**
 * Post-design finalization: build -> quality check -> deploy -> git push -> log.
 *
 * Usage:
 *   npx tsx packages/pipeline/finalize.ts --dir output/{slug}/ [--slug name] [--dry-run]
 *
 * Outputs clean JSON to stdout; progress logs go to stderr.
 */
import 'dotenv/config';

import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import { deployToVercel } from '../deploy/deploy';

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = (msg: string) => process.stderr.write(`[finalize] ${msg}\n`);

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        server.close(() => reject(new Error('Could not determine port')));
        return;
      }
      const port = addr.port;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

async function waitForServer(
  url: string,
  { intervalMs = 500, maxAttempts = 30 } = {},
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet.
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(
    `Server at ${url} did not return HTTP 200 within ${(maxAttempts * intervalMs) / 1000}s`,
  );
}

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const THRESHOLDS: Record<string, number> = {
  performance: 90,
  accessibility: 100,
  seo: 95,
  'best-practices': 90,
};

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
  // 2. Copy vercel.json redirect into out/
  // ------------------------------------------------------------------
  const vercelConfig = { redirects: [{ source: '/', destination: '/en', permanent: false }] };
  fs.writeFileSync(path.join(outDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
  log('vercel.json written');

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
  // 4. Start local server
  // ------------------------------------------------------------------
  const port = await findFreePort();
  const checkUrl = `http://localhost:${port}/en/`;
  log(`Starting serve on port ${port}...`);

  const serve = spawn('npx', ['serve', outDir, '-l', String(port)], {
    stdio: 'pipe',
    detached: false,
  });

  // Forward serve output to stderr for debugging.
  serve.stderr?.on('data', (chunk: Buffer) => {
    const line = chunk.toString().trim();
    if (line) log(`[serve] ${line}`);
  });

  const cleanup = () => {
    try {
      if (serve.pid && !serve.killed) serve.kill('SIGTERM');
    } catch {
      // Already dead.
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // ------------------------------------------------------------------
    // 5. Wait for server
    // ------------------------------------------------------------------
    log('Waiting for server...');
    await waitForServer(checkUrl);
    log('Server ready');

    // ------------------------------------------------------------------
    // 6. Run Lighthouse
    // ------------------------------------------------------------------
    const reportPath = path.join(dir, 'lighthouse-report.json');
    log(`Running Lighthouse on ${checkUrl}...`);

    execSync(
      `npx lighthouse "${checkUrl}" --output json --output-path "${reportPath}" --chrome-flags="--headless --no-sandbox" --max-wait-for-load=15000 --only-categories=performance,accessibility,seo,best-practices --quiet`,
      { stdio: 'pipe', timeout: 120_000 },
    );

    // ------------------------------------------------------------------
    // 7. Parse Lighthouse results
    // ------------------------------------------------------------------
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const cats = report.categories;

    const scores: Record<string, number> = {};
    let allPass = true;

    for (const [name, threshold] of Object.entries(THRESHOLDS)) {
      const score = Math.round((cats[name]?.score ?? 0) * 100);
      scores[name] = score;
      const pass = score >= threshold;
      if (!pass) allPass = false;
      log(`  ${name}: ${score} [${pass ? 'PASS' : 'FAIL'}]`);
    }

    // ------------------------------------------------------------------
    // 8. If quality failed, collect failing audits
    // ------------------------------------------------------------------
    if (!allPass) {
      const failures: FinalizeResult['failures'] = [];
      const audits = report.audits ?? {};

      for (const [catName] of Object.entries(THRESHOLDS)) {
        const catRef = cats[catName];
        if (!catRef) continue;
        const catScore = Math.round((catRef.score ?? 0) * 100);
        if (catScore >= THRESHOLDS[catName]) continue;

        // Walk audit refs to find failing audits in this category.
        const auditRefs: Array<{ id: string }> = catRef.auditRefs ?? [];
        for (const ref of auditRefs) {
          const audit = audits[ref.id];
          if (!audit || audit.score === null || audit.score >= 0.9) continue;

          const elements: string[] = [];
          const items: Array<{ node?: { snippet?: string } }> =
            audit.details?.items ?? [];
          for (const item of items) {
            if (item.node?.snippet) elements.push(item.node.snippet);
          }

          failures.push({
            category: catName,
            audit: audit.id ?? ref.id,
            description: audit.title ?? audit.description ?? '',
            ...(elements.length > 0 ? { elements } : {}),
          });
        }
      }

      log('Quality gate FAILED');
      return { status: 'quality-failed', scores, failures };
    }

    log('Quality gate PASSED');

    // ------------------------------------------------------------------
    // 9. Deploy + Git push (unless dry-run)
    // ------------------------------------------------------------------
    if (dryRun) {
      log('Dry run — skipping deploy and git push');
      return { status: 'deployed', scores };
    }

    // 9a. Deploy to Vercel
    log('Deploying to Vercel...');
    const deploy = await deployToVercel(outDir, slug);
    log(`Deployed: ${deploy.url}`);

    // 9b. Git push to DuoCode2/{slug}
    log(`Pushing to DuoCode2/${slug}...`);
    try {
      execSync(
        `cd "${dir}" && rm -rf .git && git init -q && git config user.name "LiuWei" && git config user.email "sunflowers0607@outlook.com" && echo ".next/\nnode_modules/\n.vercel/" > .gitignore && git add -A && git commit -q -m "feat: generated site for ${slug}" && gh repo delete DuoCode2/${slug} --yes 2>/dev/null; gh repo create DuoCode2/${slug} --private --source=. --push`,
        { stdio: 'pipe', timeout: 30_000 },
      );
      log(`Pushed: github.com/DuoCode2/${slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`Git push warning (non-fatal): ${msg}`);
    }

    // 9c. Set repo homepage
    try {
      execSync(`gh repo edit DuoCode2/${slug} --homepage "${deploy.url}"`, {
        stdio: 'pipe',
        timeout: 10_000,
      });
    } catch {
      log('Could not set repo homepage (non-fatal)');
    }

    // 9d. Log to n8n (fire and forget)
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
  } finally {
    // ------------------------------------------------------------------
    // Kill serve process
    // ------------------------------------------------------------------
    log('Stopping server...');
    cleanup();
    process.removeListener('exit', cleanup);
    process.removeListener('SIGINT', cleanup);
    process.removeListener('SIGTERM', cleanup);
  }
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
