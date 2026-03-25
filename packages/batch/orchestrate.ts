/**
 * Batch lead discovery — finds leads and outputs them for parallel Claude agents.
 *
 * This script ONLY does discovery. Each lead is processed by a Claude agent
 * running the full /generate pipeline (prepare → design → finalize).
 *
 * Usage:
 *   npx tsx packages/batch/orchestrate.ts --city "Tokyo" --category "food" --limit 5 --out data/leads/batch.json
 *   npx tsx packages/batch/orchestrate.ts --city "New York" --categories "food,beauty" --limit 3
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { searchPlaces, type PlaceResult } from '../discover/search';
import { getArg } from '../utils/cli';

interface BatchDiscoveryResult {
  timestamp: string;
  config: { city: string; categories: string[]; limit: number };
  leads: Array<{
    id: string;
    name: string;
    primaryType?: string;
    address: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    photoCount: number;
  }>;
  totalLeads: number;
}

async function discover(config: {
  city: string;
  categories: string[];
  limit: number;
  includeAll?: boolean;
}): Promise<PlaceResult[]> {
  const allLeads: PlaceResult[] = [];

  for (const category of config.categories) {
    console.error(`Searching: ${category} in ${config.city}...`);
    const leads = await searchPlaces(category, config.city, 1, !config.includeAll);
    allLeads.push(...leads.slice(0, config.limit));
  }

  // Deduplicate by place ID
  const deduped = Array.from(new Map(allLeads.map(l => [l.id, l])).values());
  console.error(`Total unique leads: ${deduped.length}`);
  return deduped;
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: npx tsx packages/batch/orchestrate.ts --city <city> --categories <types> [options]

Required:
  --city <name>           City to search in
  --categories <types>    Comma-separated business categories (e.g., "food,beauty,clinic")

Options:
  --limit <n>             Max leads per category (default: 3)
  --out <file>            Write leads JSON to file (default: stdout)
  --include-all           Include businesses WITH websites
  --help, -h              Show this help message

Output: JSON array of PlaceResult objects, ready for /batch skill to process with parallel Claude agents.

Example:
  npx tsx packages/batch/orchestrate.ts --city "Tokyo" --categories "food,beauty" --limit 5 --out data/leads/batch.json`);
    process.exit(0);
  }

  const city = getArg(args, 'city', '');
  const categoriesRaw = getArg(args, 'categories', '') || getArg(args, 'category', '');
  const limit = parseInt(getArg(args, 'limit', '3'), 10);
  const outFile = getArg(args, 'out', '');
  const includeAll = args.includes('--include-all');

  if (!city || !categoriesRaw) {
    console.error('Error: --city and --categories are required. Use --help for usage info.');
    process.exit(1);
  }

  const categories = categoriesRaw.split(',').map(s => s.trim()).filter(Boolean);

  discover({ city, categories, limit, includeAll })
    .then((leads) => {
      // Full PlaceResult output for /batch skill consumption
      const fullJson = JSON.stringify(leads, null, 2);

      if (outFile) {
        fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
        fs.writeFileSync(outFile, fullJson);
        console.error(`Written ${leads.length} leads to ${outFile}`);
      } else {
        console.log(fullJson);
      }

      // Summary to stderr
      const summary: BatchDiscoveryResult = {
        timestamp: new Date().toISOString(),
        config: { city, categories, limit },
        leads: leads.map(l => ({
          id: l.id,
          name: l.displayName?.text || 'unknown',
          primaryType: l.primaryType,
          address: l.formattedAddress,
          phone: l.nationalPhoneNumber,
          rating: l.rating,
          reviewCount: l.userRatingCount,
          photoCount: l.photos?.length || 0,
        })),
        totalLeads: leads.length,
      };

      console.error('\n── Discovery Summary ──');
      for (const lead of summary.leads) {
        console.error(`  ${lead.name} (${lead.primaryType || 'unknown'}) — ${lead.photoCount} photos, ${lead.rating || 'no'} rating`);
      }
      console.error(`\nReady for /batch: ${summary.totalLeads} leads. Each will be processed by a Claude agent.`);
    })
    .catch((err) => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

export { discover };
