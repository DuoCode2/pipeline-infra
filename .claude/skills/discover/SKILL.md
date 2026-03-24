---
name: discover
description: "Find local businesses WITHOUT websites via Google Maps API. Always filters out businesses that already have a website. Use when user says 'discover', 'find leads', 'search businesses'."
allowed-tools: [Bash, Read, Write]
user-invocable: true
---

# Google Maps Lead Discovery

**CRITICAL:** We only generate sites for businesses that DON'T have a website. The default behavior already filters these out — no flag needed.

If the search query (city + keyword) is not provided, use AskUserQuestion to ask for it.

## Usage

```bash
# Default: only returns businesses WITHOUT websites
npx tsx packages/discover/search.ts \
  --city "Kuala Lumpur" \
  --category "beauty_salon" \
  --limit 3

# Override: include businesses WITH websites
npx tsx packages/discover/search.ts \
  --city "Kuala Lumpur" \
  --category "beauty_salon" \
  --limit 3 \
  --include-all

# Compact output (default) vs full JSON
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 1 --full
```

## Output

JSON array of `PlaceResult` objects:
```json
{
  "id": "ChIJ...",
  "displayName": { "text": "Business Name" },
  "primaryType": "beauty_salon",
  "formattedAddress": "...",
  "nationalPhoneNumber": "012-345 6789",
  "websiteUri": null,        // <-- MUST be null/missing
  "rating": 4.5,
  "userRatingCount": 120,
  "photos": [{ "name": "places/xxx/photos/yyy", ... }],
  "location": { "latitude": 3.1, "longitude": 101.7 },
  "googleMapsUri": "https://maps.google.com/..."
}
```

## After Discovery

For each lead, run `/generate` with the place data. Or use `/batch` for multiple leads.

## Notes
- Default behavior filters out businesses with websites (use `--include-all` to override)
- `--limit N` controls pages to fetch (1 page = up to 20 results)
- Also checks for dead websites and treats them as leads
- Google Reviews text is NOT returned by API (only rating + count)
- Photos are resource names, not URLs — download via `maps-photos.ts`
- Output is compact by default; use `--full` for complete API response
