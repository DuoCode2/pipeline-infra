import 'dotenv/config';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { extractColors } from '../packages/assets/extract-colors';
import { optimizeImages } from '../packages/assets/optimize-images';

async function runTests() {
  console.log('=== Asset Tests ===\n');

  // Test 2.1: Color extraction (uses default when no image)
  console.log('Test 2.1: Color extraction with defaults...');
  const colors = await extractColors('nonexistent.jpg');
  assert.ok(colors.primary, 'Should have primary color');
  assert.ok(
    colors.primary.match(/^#[0-9A-Fa-f]{6}$/),
    'Should be hex format'
  );
  console.log(`PASS: Default colors extracted: ${JSON.stringify(colors)}`);

  // Test 2.2: Image optimization (skip if no test images)
  const testImgDir = 'output/test/public/images';
  if (fs.existsSync(testImgDir)) {
    const jpgs = fs.readdirSync(testImgDir).filter((f) => /\.jpg$/i.test(f));
    if (jpgs.length > 0) {
      console.log('\nTest 2.2: Image optimization...');
      const manifest = await optimizeImages(testImgDir);
      assert.ok(
        Object.keys(manifest).length > 0,
        'Should have entries in manifest'
      );
      const firstKey = Object.keys(manifest)[0];
      assert.ok(
        manifest[firstKey]['320w']?.endsWith('.webp'),
        'Should generate WebP variants'
      );
      console.log(`PASS: Optimized ${Object.keys(manifest).length} images`);
    } else {
      console.log('\nTest 2.2: Image optimization (skipped, no test images)');
    }
  } else {
    console.log(
      '\nTest 2.2: Image optimization (skipped, no output/test directory)'
    );
  }

  console.log('\n=== All asset tests passed ===');
}

runTests();
