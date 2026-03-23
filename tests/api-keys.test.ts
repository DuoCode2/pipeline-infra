import 'dotenv/config';
import * as assert from 'assert';

console.log('=== API Key Verification ===\n');

const keys = [
  'GOOGLE_API_KEY',
  'UNSPLASH_ACCESS_KEY',
  'VERCEL_TOKEN',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
];

let passed = 0;
let failed = 0;

for (const key of keys) {
  const value = process.env[key];
  if (value && value.length > 0) {
    console.log(`PASS: ${key} is set (${value.length} chars)`);
    passed++;
  } else {
    console.log(`WARN: ${key} is not set`);
    failed++;
  }
}

console.log(`\n${passed}/${keys.length} keys configured`);
if (failed > 0) {
  console.log(`${failed} keys missing — some features may not work`);
}

// At minimum, GOOGLE_API_KEY must be set
assert.ok(process.env.GOOGLE_API_KEY, 'GOOGLE_API_KEY must be set');
console.log('\nPASS: Core API keys verified');
