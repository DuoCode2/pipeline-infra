import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';

const API_KEY = requireEnv('GOOGLE_API_KEY');
const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.primaryType',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.regularOpeningHours',
  'places.photos',
  'places.googleMapsUri',
].join(',');

export interface PlaceResult {
  id: string;
  displayName: { text: string; languageCode: string };
  primaryType?: string;
  formattedAddress: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: {
    weekdayDescriptions: string[];
    openNow?: boolean;
  };
  photos?: Array<{ name: string; widthPx: number; heightPx: number }>;
  googleMapsUri?: string;
}

interface SearchResponse {
  places?: PlaceResult[];
  nextPageToken?: string;
}

async function fetchPage(
  query: string,
  pageToken?: string
): Promise<SearchResponse> {
  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 20,
  };
  if (pageToken) {
    body.pageToken = pageToken;
  }

  const res = await fetch(PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Places API ${res.status}: ${text}`);
  }

  return res.json() as Promise<SearchResponse>;
}

/**
 * Search Google Maps Places API (New) for businesses.
 * @param category - business type (e.g., "restaurant")
 * @param city - city name (e.g., "Kuala Lumpur")
 * @param maxPages - max pages to fetch (1 page = up to 20 results, max 3)
 * @param filterNoWebsite - if true, only return places without a website
 */
export async function searchPlaces(
  category: string,
  city: string,
  maxPages: number = 1,
  filterNoWebsite: boolean = false
): Promise<PlaceResult[]> {
  const query = `${category} in ${city}`;
  const allResults: PlaceResult[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < Math.min(maxPages, 3); page++) {
    const response = await fetchPage(query, pageToken);
    const places = response.places || [];
    allResults.push(...places);

    pageToken = response.nextPageToken;
    if (!pageToken) break;

    // API requires a short delay before using nextPageToken
    if (page < maxPages - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (filterNoWebsite) {
    return allResults.filter((p) => !p.websiteUri);
  }

  return allResults;
}

// CLI usage: npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1
if (require.main === module) {
  const args = process.argv.slice(2);
  const getArg = (name: string, fallback: string) => {
    const idx = args.indexOf(`--${name}`);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const city = getArg('city', 'Kuala Lumpur');
  const category = getArg('category', 'restaurant');
  const limit = parseInt(getArg('limit', '1'), 10);
  const noWebsite = args.includes('--no-website');

  searchPlaces(category, city, limit, noWebsite)
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
      console.error(`\nTotal: ${results.length} results`);
      const withoutWebsite = results.filter((r) => !r.websiteUri).length;
      console.error(`Without website: ${withoutWebsite}`);
    })
    .catch((err) => {
      console.error('Error:', err.message);
      if (err.message.includes('403')) {
        console.error(
          '\nHint: Enable "Places API (New)" at https://console.cloud.google.com/apis/library'
        );
      }
      process.exit(1);
    });
}
