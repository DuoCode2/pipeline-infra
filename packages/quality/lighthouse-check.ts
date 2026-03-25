/**
 * Post-deploy Lighthouse check — runs against live Vercel URLs.
 * Usage: npx tsx packages/quality/lighthouse-check.ts --url https://site.vercel.app/en --output output/{slug}
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { evaluateLighthouseReport } from './shared';

import { getArg } from '../utils/cli';

const args = process.argv.slice(2);
const url = getArg(args, 'url', '');
const outputDir = getArg(args, 'output', '.');

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
  const { lighthouse, failures, allPass } = evaluateLighthouseReport(report);

  for (const [name, result] of Object.entries(lighthouse)) {
    console.log(`  ${name}: ${result.score} [${result.pass ? 'PASS' : 'FAIL'}]`);
  }

  // Save QA report
  const qaReport = {
    url,
    timestamp: new Date().toISOString(),
    lighthouse,
    failures,
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
