import * as fs from 'fs';
import * as path from 'path';
import { requireEnv } from '../utils/env';
import { getArg } from '../utils/cli';
import { postWebhook } from '../utils/n8n';

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
  'places.location',
  'places.googleMapsUri',
  'places.businessStatus',
].join(',');

/**
 * NOTE: Google Places API (New) returns rating + userRatingCount but NOT
 * individual review text. Review content in business.ts must be
 * synthesized during generation based on rating data.
 */
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
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  businessStatus?: string; // OPERATIONAL | CLOSED_TEMPORARILY | CLOSED_PERMANENTLY
}

/**
 * Check if a website URL is actually reachable (not a dead link).
 * Returns true if the site responds with 2xx/3xx within 5 seconds.
 */
async function isWebsiteReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res.ok || (res.status >= 300 && res.status < 400);
  } catch {
    return false; // timeout, DNS error, connection refused, etc.
  }
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
    const errText = await res.text();
    throw new Error(`Places API ${res.status}: ${errText}`);
  }

  const text = await res.text();
  const sanitized = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  return JSON.parse(sanitized) as SearchResponse;
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

  // Always filter out closed businesses
  const operational = allResults.filter(
    (p) => !p.businessStatus || p.businessStatus === 'OPERATIONAL'
  );

  // Quality filter: must have phone, at least 1 photo, and some reviews
  const quality = operational.filter((p) => {
    const hasPhone = !!p.nationalPhoneNumber;
    const hasPhotos = (p.photos?.length || 0) >= 1;
    const hasReviews = (p.userRatingCount || 0) >= 3;
    const decentRating = !p.rating || p.rating >= 3.0;
    return hasPhone && hasPhotos && hasReviews && decentRating;
  });

  let finalResults: PlaceResult[];

  if (filterNoWebsite) {
    // Quick filter: no websiteUri at all
    const noSite = quality.filter((p) => !p.websiteUri);

    // Also check: businesses whose listed website is unreachable (dead sites = good leads)
    const withSite = quality.filter((p) => !!p.websiteUri);
    const deadSites: PlaceResult[] = [];

    for (const place of withSite) {
      const alive = await isWebsiteReachable(place.websiteUri!);
      if (!alive) {
        console.error(`  Dead site: ${place.displayName.text} → ${place.websiteUri}`);
        deadSites.push({ ...place, websiteUri: undefined }); // treat as no website
      }
    }

    if (deadSites.length > 0) {
      console.error(`Found ${deadSites.length} businesses with dead websites — added as leads`);
    }

    finalResults = [...noSite, ...deadSites];
  } else {
    finalResults = quality;
  }

  // Log discovered leads to Sheets (fire-and-forget)
  for (const lead of finalResults) {
    postWebhook('log-lead', {
      place_id: lead.id,
      name: lead.displayName?.text || '',
      industry: category,
      address: lead.formattedAddress || '',
      phone: lead.nationalPhoneNumber || '',
      rating: lead.rating || 0,
      reviews_count: lead.userRatingCount || 0,
      maps_url: lead.googleMapsUri || '',
    }).catch(() => {});
  }

  return finalResults;
}

// CLI usage: npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1
if (require.main === module) {
  const args = process.argv.slice(2);
  const city = getArg(args, 'city', 'Kuala Lumpur');
  const category = getArg(args, 'category', 'restaurant');
  const limit = parseInt(getArg(args, 'limit', '1'), 10);
  // Default: filter out businesses WITH websites (we only want leads without sites)
  const includeAll = args.includes('--include-all');
  const filterNoWebsite = !includeAll;

  const compact = args.includes('--compact');
  const outFile = getArg(args, 'out', '');

  searchPlaces(category, city, limit, filterNoWebsite)
    .then((results) => {
      let output: unknown;
      if (compact) {
        output = results.map((p) => ({
          id: p.id,
          name: p.displayName?.text || '',
          type: p.primaryType || null,
          address: p.formattedAddress,
          phone: p.nationalPhoneNumber || null,
          rating: p.rating || null,
          reviews: p.userRatingCount || null,
          photoCount: p.photos?.length || 0,
          photos: (p.photos || []).map((ph) => ph.name),
          hours: p.regularOpeningHours?.weekdayDescriptions || null,
          mapsUrl: p.googleMapsUri || null,
          coords: p.location
            ? { lat: p.location.latitude, lng: p.location.longitude }
            : null,
        }));
      } else {
        output = results;
      }

      const json = JSON.stringify(output, null, 2);
      if (outFile) {
        fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
        fs.writeFileSync(outFile, json);
        console.error(`Written to ${outFile}`);
      } else {
        console.log(json);
      }
      console.error(`\nQualified leads: ${results.length}`);
      console.error(`Filters: operational + has phone + has photos + reviews≥3 + rating≥3.0${filterNoWebsite ? ' + no website' : ''}`);
      console.error(`Output: ${compact ? 'compact (use default for full PlaceResult)' : 'full (PlaceResult[], pipe-ready for prepare.ts)'}`);
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
