import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    root: '.',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts', 'tests/e2e/**/*.test.ts'],
    exclude: ['tests/*.test.ts'],  // Legacy tests (pre-vitest)
    setupFiles: ['dotenv/config'],
    testTimeout: 30000,
    alias: {
      '@': path.resolve(__dirname, 'packages'),
    },
  },
});
