---
name: discover
description: "Find local businesses via Google Maps API for site generation. Two modes: quick (TypeScript, for pipeline) and deep (Python, for B2B lead enrichment with contact scraping). Use when user says 'discover', 'find leads', 'search businesses'."
allowed-tools: [Bash, Read, Write]
user-invocable: true
---

# Google Maps Lead Discovery

**If the search query (city + keyword) is not provided, use AskUserQuestion to ask for it.** Never output a plain-text question — always use the AskUserQuestion tool.

## Mode 1: Pipeline Discovery (TypeScript) — DEFAULT

Lightweight search for feeding into `/generate` or `/batch`. Uses Google Places API directly.

```bash
npx tsx packages/discover/search.ts --city "Kuala Lumpur" --category "restaurant" --limit 3
```

Returns JSON array of `PlaceResult` objects with: id, name, address, phone, rating, reviews, photos, hours, location. This is the primary discovery tool for the DuoCode pipeline.

**Use this mode** when discovering leads for site generation.

## Mode 2: Deep Lead Enrichment (Python)

Comprehensive B2B pipeline with website scraping, contact extraction, and Google Sheets sync.

### Scripts
- `./scripts/gmaps_lead_pipeline.py` — Main orchestration
- `./scripts/gmaps_parallel_pipeline.py` — Parallel version
- `./scripts/scrape_google_maps.py` — Google Maps scraper (via Apify)
- `./scripts/extract_website_contacts.py` — Website contact extractor
- `./scripts/update_sheet.py` — Google Sheets sync

### Usage
```bash
# Create new sheet with 10 leads
python3 ./scripts/gmaps_lead_pipeline.py --search "plumbers in Austin TX" --limit 10

# Append to existing sheet
python3 ./scripts/gmaps_lead_pipeline.py --search "dentists in Miami FL" --limit 25 \
  --sheet-url "https://docs.google.com/spreadsheets/d/..."

# Higher volume with parallel workers
python3 ./scripts/gmaps_lead_pipeline.py --search "roofing contractors in Austin TX" \
  --limit 50 --workers 5
```

### Pipeline Steps
1. **Google Maps Scrape** — Apify `compass/crawler-google-places`
2. **Website Scraping** — main page + up to 5 contact pages
3. **Web Search Enrichment** — DuckDuckGo for owner contact info
4. **Claude Extraction** — Claude Haiku extracts structured contacts
5. **Google Sheet Sync** — appends, deduplicates by lead_id

### Output Schema (36 fields)
- **Business:** name, category, address, city, state, zip, phone, website, rating, reviews
- **Contacts:** emails, phones, hours
- **Social:** facebook, twitter, linkedin, instagram, youtube, tiktok
- **Owner:** name, title, email, phone, linkedin
- **Team:** JSON array of members
- **Metadata:** lead_id, scraped_at, query, pages_scraped, enrichment_status

### Environment (Mode 2 only)
```
APIFY_API_TOKEN=your_token
ANTHROPIC_API_KEY=your_key
```

### Cost (Mode 2)
~$0.012-0.022 per lead (~$1.50-2.50 per 100 leads)

**Use this mode** when building a lead database, enriching contacts, or syncing to Google Sheets.
