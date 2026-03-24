/**
 * Local quality gate — serves a static build, runs Lighthouse, and reports results.
 *
 * Usage:
 *   npx tsx packages/quality/serve-and-check.ts --dir output/{slug}/out [--screenshots output/{slug}/screenshots] [--output output/{slug}] [--port 3456]
 *
 * Steps:
 *   1. Find a free port (or use --port)
 *   2. Start `npx serve` on that port
 *   3. Wait for HTTP 200 on /en/
 *   4. Run Lighthouse headless
 *   5. Kill the serve process
 *   6. Return scores + pass/fail
 */
import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

// ---------------------------------------------------------------------------
// Free port detection
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Wait for server readiness
// ---------------------------------------------------------------------------

async function waitForServer(
  url: string,
  { intervalMs = 500, maxAttempts = 30 } = {},
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // Server not ready yet — ignore.
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(
    `Server at ${url} did not return HTTP 200 within ${(maxAttempts * intervalMs) / 1000}s`,
  );
}

// ---------------------------------------------------------------------------
// Thresholds (same as lighthouse-check.ts)
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

export async function runLocalQualityGate(options: {
  buildDir: string;
  screenshotDir?: string;
  outputDir?: string;
  port?: number;
}): Promise<{
  port: number;
  lighthouse: Record<string, { score: number; pass: boolean }>;
  allPass: boolean;
}> {
  const { buildDir, screenshotDir, outputDir } = options;
  const resolvedOutputDir = outputDir ?? path.resolve(buildDir, '..');
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  // 1. Determine port ---------------------------------------------------
  const port = options.port ?? (await findFreePort());
  const baseUrl = `http://localhost:${port}`;
  const checkUrl = `${baseUrl}/en/`;

  console.log(`\n[serve-and-check] Build dir : ${buildDir}`);
  console.log(`[serve-and-check] Port      : ${port}`);
  console.log(`[serve-and-check] Check URL : ${checkUrl}`);

  // 2. Start serve ------------------------------------------------------
  const serve = spawn('npx', ['serve', buildDir, '-l', String(port)], {
    stdio: 'pipe',
    detached: false,
  });

  // Forward serve stderr for troubleshooting (non-blocking).
  serve.stderr?.on('data', (chunk: Buffer) => {
    const line = chunk.toString().trim();
    if (line) console.log(`[serve] ${line}`);
  });

  // Ensure cleanup on unexpected exit of this process.
  const cleanup = () => {
    try {
      if (serve.pid && !serve.killed) {
        serve.kill('SIGTERM');
      }
    } catch {
      // Already dead — ignore.
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // 3. Wait for HTTP 200 ------------------------------------------------
    console.log('[serve-and-check] Waiting for server...');
    await waitForServer(checkUrl);
    console.log('[serve-and-check] Server ready.');

    // 4. Run Lighthouse ---------------------------------------------------
    const reportPath = path.join(resolvedOutputDir, 'lighthouse-report.json');

    console.log(`[serve-and-check] Running Lighthouse on ${checkUrl}...`);
    execSync(
      `npx lighthouse "${checkUrl}" --output json --output-path "${reportPath}" --chrome-flags="--headless --no-sandbox" --max-wait-for-load=15000 --only-categories=performance,accessibility,seo,best-practices --quiet`,
      { stdio: 'inherit', timeout: 120_000 },
    );

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const cats = report.categories;

    const results: Record<string, { score: number; pass: boolean }> = {};
    let allPass = true;

    for (const [name, threshold] of Object.entries(THRESHOLDS)) {
      const score = (cats[name]?.score ?? 0) * 100;
      const pass = score >= threshold;
      if (!pass) allPass = false;
      results[name] = { score, pass };
      console.log(`  ${name}: ${score.toFixed(0)} [${pass ? 'PASS' : 'FAIL'}]`);
    }

    // 5. (Optional) Gate 3 — browser-use screenshots ----------------------
    if (screenshotDir) {
      fs.mkdirSync(screenshotDir, { recursive: true });
      console.log(`\n[serve-and-check] Running browser-use screenshots → ${screenshotDir}`);
      try {
        execSync(
          `npx browser-use screenshot "${baseUrl}/en/" --output "${screenshotDir}/en-desktop.png" --width 1440 --height 900`,
          { stdio: 'inherit', timeout: 60_000 },
        );
        execSync(
          `npx browser-use screenshot "${baseUrl}/en/" --output "${screenshotDir}/en-mobile.png" --width 375 --height 812`,
          { stdio: 'inherit', timeout: 60_000 },
        );
        console.log('[serve-and-check] Screenshots captured.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[serve-and-check] Screenshot step failed (non-fatal): ${msg}`);
      }
    }

    // 6. Save QA report ---------------------------------------------------
    const qaReport = {
      url: checkUrl,
      timestamp: new Date().toISOString(),
      port,
      lighthouse: results,
      allPass,
    };
    const qaPath = path.join(resolvedOutputDir, 'qa-report.json');
    fs.writeFileSync(qaPath, JSON.stringify(qaReport, null, 2));
    console.log(`\n[serve-and-check] QA report saved to ${qaPath}`);

    if (allPass) {
      console.log('[serve-and-check] Gate 2 PASSED');
    } else {
      console.log('[serve-and-check] Gate 2 FAILED — some metrics below threshold');
    }

    return { port, lighthouse: results, allPass };
  } finally {
    // 5b. Kill serve process by PID ---------------------------------------
    console.log('[serve-and-check] Stopping server...');
    if (serve.pid && !serve.killed) {
      try {
        process.kill(serve.pid, 'SIGTERM');
      } catch {
        // Already exited — ignore.
      }
    }
    // Remove listeners to avoid double-cleanup.
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
  const getArg = (name: string, fallback?: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const buildDir = getArg('dir');
  if (!buildDir) {
    console.error(
      'Usage: npx tsx packages/quality/serve-and-check.ts --dir <build-dir> [--screenshots <dir>] [--output <dir>] [--port <port>]',
    );
    process.exit(1);
  }

  if (!fs.existsSync(buildDir)) {
    console.error(`Build directory does not exist: ${buildDir}`);
    process.exit(1);
  }

  const screenshotDir = getArg('screenshots');
  const outputDir = getArg('output');
  const portStr = getArg('port');
  const port = portStr ? parseInt(portStr, 10) : undefined;

  if (port !== undefined && (isNaN(port) || port < 1 || port > 65535)) {
    console.error(`Invalid port: ${portStr}`);
    process.exit(1);
  }

  try {
    const result = await runLocalQualityGate({
      buildDir,
      screenshotDir,
      outputDir,
      port,
    });

    process.exit(result.allPass ? 0 : 1);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[serve-and-check] Fatal error: ${msg}`);
    process.exit(1);
  }
}

// Run CLI when executed directly.
main();
