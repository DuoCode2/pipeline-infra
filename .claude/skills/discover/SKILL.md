---
name: discover
description: "Find local businesses WITHOUT websites via Google Maps API. Always filters out businesses that already have a website. Use when user says 'discover', 'find leads', 'search businesses'."
allowed-tools: [Bash, Read, Write]
user-invocable: true
---

# Google Maps Lead Discovery

**CRITICAL: Always use `--no-website` flag.** We only generate sites for businesses that DON'T have a website. Never generate a site for a business that already has one.

If the search query (city + keyword) is not provided, use AskUserQuestion to ask for it.

## Usage

```bash
# ALWAYS include --no-website
npx tsx packages/discover/search.ts \
  --city "Kuala Lumpur" \
  --category "beauty_salon" \
  --limit 3 \
  --no-website
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
- `--limit N` controls how many pages to fetch (1 page = up to 20 results)
- Results with `websiteUri` are filtered out by `--no-website`
- Google Reviews text is NOT returned by the API (only rating + count)
- Photos are resource names, not URLs — download via `maps-photos.ts`
