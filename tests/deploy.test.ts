import * as fs from 'fs';
import * as path from 'path';

console.log('── Test: Deploy Module Type Safety ──\n');

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

const deployFile = path.join(__dirname, '../packages/deploy/deploy.ts');
const content = fs.readFileSync(deployFile, 'utf8');

// Test 1: No bare 'any' types
const anyMatches = content.match(/:\s*any\b/g);
assert('No bare any types in deploy.ts', !anyMatches, anyMatches ? `Found ${anyMatches.length} any types` : undefined);

// Test 2: Deployment state is explicitly typed
assert('DeploymentState interface defined', content.includes('interface DeploymentState'));
assert('resolveDeploymentUrl helper defined', content.includes('function resolveDeploymentUrl'));

// Test 3: DeployResult interface defined
assert('DeployResult interface defined', content.includes('interface DeployResult'));

// Test 4: Uses requireEnv instead of process.env!
assert('Uses requireEnv for env vars', content.includes('requireEnv'));
assert('No process.env non-null assertions', !content.includes('process.env.') || !content.match(/process\.env\.\w+!/));

// Test 5: Function signature exported
assert('deployToVercel function exported', content.includes('export async function deployToVercel'));
assert(
  'Does not guess slug.vercel.app as fallback',
  !content.includes('https://${slug}.vercel.app')
);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
