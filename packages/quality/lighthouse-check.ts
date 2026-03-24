/**
 * Post-deploy Lighthouse check — runs against live Vercel URLs.
 * Usage: npx tsx packages/quality/lighthouse-check.ts --url https://site.vercel.app/en --output output/{slug}
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const getArg = (name: string, fallback: string) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
};

const url = getArg('url', '');
const outputDir = getArg('output', '.');

if (!url) {
  console.error('Usage: --url <production-url> [--output <dir>]');
  process.exit(1);
}

const reportPath = path.join(outputDir, 'lighthouse-report.json');
fs.mkdirSync(outputDir, { recursive: true });

console.log(`Running Lighthouse on ${url}...`);

try {
  execSync(
    `npx lighthouse "${url}" --output json --output-path "${reportPath}" --chrome-flags="--headless --no-sandbox" --max-wait-for-load=15000 --only-categories=performance,accessibility,seo,best-practices --quiet`,
    { stdio: 'inherit', timeout: 120_000 }
  );

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const cats = report.categories;

  const results: Record<string, { score: number; pass: boolean }> = {};
  const thresholds: Record<string, number> = {
    performance: 90,
    accessibility: 100,
    seo: 95,
    'best-practices': 90,
  };

  let allPass = true;
  for (const [name, threshold] of Object.entries(thresholds)) {
    const score = (cats[name]?.score ?? 0) * 100;
    const pass = score >= threshold;
    if (!pass) allPass = false;
    results[name] = { score, pass };
    console.log(`  ${name}: ${score.toFixed(0)} [${pass ? 'PASS' : 'FAIL'}]`);
  }

  // Save QA report
  const qaReport = {
    url,
    timestamp: new Date().toISOString(),
    lighthouse: results,
    allPass,
  };
  fs.writeFileSync(path.join(outputDir, 'qa-report.json'), JSON.stringify(qaReport, null, 2));
  console.log(`\nQA report saved to ${outputDir}/qa-report.json`);

  if (!allPass) {
    console.log('\nGate 2 FAILED — some metrics below threshold');
    process.exit(1);
  }
  console.log('\nGate 2 PASSED');
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error('Lighthouse failed:', msg);
  process.exit(1);
}
