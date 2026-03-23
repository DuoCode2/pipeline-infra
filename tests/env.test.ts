import { requireEnv } from '../packages/utils/env';

console.log('── Test: Environment Validation Utility ──\n');

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

// Test 1: requireEnv returns value for set variable
process.env.TEST_ENV_VAR = 'test-value';
try {
  const val = requireEnv('TEST_ENV_VAR');
  assert('requireEnv returns value for set variable', val === 'test-value');
} catch {
  assert('requireEnv returns value for set variable', false, 'threw unexpectedly');
}

// Test 2: requireEnv throws for missing variable
delete process.env.TEST_MISSING_VAR;
try {
  requireEnv('TEST_MISSING_VAR');
  assert('requireEnv throws for missing variable', false, 'did not throw');
} catch (err: unknown) {
  const msg = (err as Error).message;
  assert('requireEnv throws for missing variable', true);
  assert('error message contains variable name', msg.includes('TEST_MISSING_VAR'));
  assert('error message mentions .env.template', msg.includes('.env.template'));
}

// Test 3: requireEnv throws for empty string
process.env.TEST_EMPTY_VAR = '';
try {
  requireEnv('TEST_EMPTY_VAR');
  assert('requireEnv throws for empty string', false, 'did not throw');
} catch {
  assert('requireEnv throws for empty string', true);
}

// Cleanup
delete process.env.TEST_ENV_VAR;
delete process.env.TEST_EMPTY_VAR;

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
