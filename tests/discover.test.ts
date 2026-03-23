import 'dotenv/config';
import * as assert from 'assert';
import { searchPlaces } from '../packages/discover/search';

async function runTests() {
  console.log('=== Discovery Tests ===\n');

  // Test 1.1: API connectivity
  console.log('Test 1.1: API connectivity...');
  try {
    const result = await searchPlaces('restaurant', 'Kuala Lumpur', 1);
    assert.ok(result.length > 0, 'Should find at least 1 restaurant in KL');
    assert.ok(result[0].id, 'Should have place ID');
    assert.ok(result[0].displayName, 'Should have display name');
    console.log(`PASS: Found ${result.length} restaurants`);
    console.log(`  First: ${result[0].displayName.text} (${result[0].id})`);

    // Test 1.2: Filter no-website
    console.log('\nTest 1.2: Filter no-website...');
    const noWebsite = result.filter((p) => !p.websiteUri);
    console.log(`Found ${noWebsite.length}/${result.length} without website`);
    console.log('PASS: Filter working');

    // Test 1.3: Pagination (optional, uses more quota)
    if (process.argv.includes('--with-pagination')) {
      console.log('\nTest 1.3: Pagination...');
      const paginated = await searchPlaces('restaurant', 'Kuala Lumpur', 3);
      assert.ok(paginated.length <= 60, 'Max 60 results across 3 pages');
      console.log(`PASS: Total with pagination: ${paginated.length}`);
    } else {
      console.log('\nTest 1.3: Pagination (skipped, use --with-pagination)');
    }
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('403')) {
      console.error('FAIL: Places API returned 403');
      console.error(
        'Action: Enable "Places API (New)" at https://console.cloud.google.com/apis/library'
      );
    } else {
      console.error('FAIL:', msg);
    }
    process.exit(1);
  }

  console.log('\n=== All discovery tests passed ===');
}

runTests();
