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
import {
  evaluateLighthouseReport,
  type QualityCategoryResult,
  type QualityFailure,
} from './shared';
import { getArg } from '../utils/cli';

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

export async function runLocalQualityGate(options: {
  buildDir: string;
  screenshotDir?: string;
  outputDir?: string;
  port?: number;
  /** URL path to check (default: auto-detect from build output). */
  checkPath?: string;
  logger?: (message: string) => void;
  warn?: (message: string) => void;
  commandStdio?: 'inherit' | 'pipe';
}): Promise<{
  port: number;
  lighthouse: Record<string, QualityCategoryResult>;
  failures: QualityFailure[];
  allPass: boolean;
}> {
  const { buildDir, screenshotDir, outputDir } = options;
  const resolvedOutputDir = outputDir ?? path.resolve(buildDir, '..');
  const log = options.logger ?? console.log;
  const warn = options.warn ?? console.warn;
  const commandStdio = options.commandStdio ?? 'inherit';
  fs.mkdirSync(resolvedOutputDir, { recursive: true });

  // 1. Determine port ---------------------------------------------------
  const port = options.port ?? (await findFreePort());
  const baseUrl = `http://localhost:${port}`;

  // Auto-detect check path: if /en/ exists in build, use it; otherwise use /
  let checkPath = options.checkPath;
  if (!checkPath) {
    const fs = await import('fs');
    if (fs.existsSync(path.join(buildDir, 'en', 'index.html'))) {
      checkPath = '/en/';
    } else if (fs.existsSync(path.join(buildDir, 'index.html'))) {
      checkPath = '/';
    } else {
      checkPath = '/en/'; // fallback to legacy behavior
    }
  }
  const checkUrl = `${baseUrl}${checkPath}`;

  log(`\n[serve-and-check] Build dir : ${buildDir}`);
  log(`[serve-and-check] Port      : ${port}`);
  log(`[serve-and-check] Check URL : ${checkUrl}`);

  // 2. Start serve (detached + process group kill ensures entire tree is cleaned up)
  const serve = spawn('npx', ['serve', buildDir, '-l', String(port), '--no-clipboard'], {
    stdio: 'pipe',
    detached: true,
  });

  // Forward serve stderr for troubleshooting (non-blocking).
  serve.stderr?.on('data', (chunk: Buffer) => {
    const line = chunk.toString().trim();
    if (line) log(`[serve] ${line}`);
  });

  const cleanup = () => {
    if (!serve.pid || serve.killed) return;
    try {
      // Kill the entire process group (npx + serve child) to prevent orphaned servers
      process.kill(-serve.pid, 'SIGTERM');
    } catch {
      try { process.kill(-serve.pid, 'SIGKILL'); } catch {
        // Fallback: kill just the direct child
        try { serve.kill('SIGKILL'); } catch { /* already dead */ }
      }
    }

    // Verify the port is actually free after kill. If not, force-kill by port.
    // SIGTERM may be ignored by zombie processes; give 2s then escalate.
    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      try {
        // Check if process group still exists
        process.kill(-serve.pid!, 0);
        // Still alive — wait briefly then SIGKILL
        const waitEnd = Date.now() + 200;
        while (Date.now() < waitEnd) { /* spin */ }
        try { process.kill(-serve.pid!, 'SIGKILL'); } catch { break; }
      } catch {
        break; // Process is gone
      }
    }

    // Final fallback: kill anything on the port via lsof (macOS/Linux)
    try {
      execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null || true`, {
        stdio: 'pipe',
        timeout: 3000,
      });
    } catch { /* best effort */ }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  try {
    // 3. Wait for HTTP 200 ------------------------------------------------
    log('[serve-and-check] Waiting for server...');
    await waitForServer(checkUrl);
    log('[serve-and-check] Server ready.');

    // 4. Run Lighthouse ---------------------------------------------------
    const reportPath = path.join(resolvedOutputDir, 'lighthouse-report.json');

    log(`[serve-and-check] Running Lighthouse on ${checkUrl}...`);
    execSync(
      `npx lighthouse "${checkUrl}" --output json --output-path "${reportPath}" --preset=desktop --chrome-flags="--headless --no-sandbox" --max-wait-for-load=15000 --only-categories=performance,accessibility,seo,best-practices --quiet`,
      { stdio: commandStdio, timeout: 120_000 },
    );

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const { lighthouse, failures, allPass } = evaluateLighthouseReport(report);

    for (const [name, result] of Object.entries(lighthouse)) {
      let label: string;
      if (result.pass) {
        label = 'PASS';
      } else if (result.level === 'warn') {
        label = 'WARN';
      } else {
        label = 'FAIL';
      }
      log(`  ${name}: ${result.score} [${label}]`);
    }

    // 5. (Optional) Gate 3 — browser-use screenshots ----------------------
    if (screenshotDir) {
      fs.mkdirSync(screenshotDir, { recursive: true });
      log(`\n[serve-and-check] Running browser-use screenshots → ${screenshotDir}`);
      try {
        execSync(
          `npx browser-use screenshot "${baseUrl}/en/" --output "${screenshotDir}/en-desktop.png" --width 1440 --height 900`,
          { stdio: commandStdio, timeout: 60_000 },
        );
        execSync(
          `npx browser-use screenshot "${baseUrl}/en/" --output "${screenshotDir}/en-mobile.png" --width 375 --height 812`,
          { stdio: commandStdio, timeout: 60_000 },
        );
        log('[serve-and-check] Screenshots captured.');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        warn(`[serve-and-check] Screenshot step failed (non-fatal): ${msg}`);
      }
    }

    // 6. Save QA report ---------------------------------------------------
    const qaReport = {
      url: checkUrl,
      timestamp: new Date().toISOString(),
      port,
      lighthouse,
      failures,
      allPass,
    };
    const qaPath = path.join(resolvedOutputDir, 'qa-report.json');
    fs.writeFileSync(qaPath, JSON.stringify(qaReport, null, 2));
    log(`\n[serve-and-check] QA report saved to ${qaPath}`);

    if (allPass) {
      log('[serve-and-check] Gate 2 PASSED');
    } else {
      log('[serve-and-check] Gate 2 FAILED — some metrics below threshold');
    }

    return { port, lighthouse, failures, allPass };
  } finally {
    // 5b. Kill serve process -----------------------------------------------
    log('[serve-and-check] Stopping server...');
    cleanup();
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

  const buildDir = getArg(args, 'dir');
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

  const screenshotDir = getArg(args, 'screenshots');
  const outputDir = getArg(args, 'output');
  const portStr = getArg(args, 'port');
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
if (require.main === module) {
  main();
}
