#!/usr/bin/env python3
"""Update N8N workflows and sync all site data to Google Sheets via N8N webhooks."""

import json
import csv
import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

N8N_BASE = os.environ.get("N8N_WEBHOOK_URL", "").rsplit("/webhook/", 1)[0]
N8N_API_KEY = os.environ.get("N8N_API_KEY", "")
HEADERS = {"X-N8N-API-KEY": N8N_API_KEY, "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{N8N_BASE}/api/v1{path}"
    r = requests.request(method, url, headers=HEADERS, json=data, timeout=30)
    r.raise_for_status()
    return r.json()

def update_log_lead_workflow():
    """Update log-lead Prepare node to pass through all fields."""
    wf = api("GET", "/workflows/log-lead-v1")

    new_code = """const body = $input.first().json.body || {};
return [{
  json: {
    place_id: body.place_id || '',
    name: body.name || '',
    slug: body.slug || '',
    industry: body.industry || '',
    archetype: body.archetype || '',
    region: body.region || '',
    address: body.address || '',
    phone: body.phone || '',
    rating: body.rating ?? '',
    reviews_count: body.reviews_count ?? '',
    maps_url: body.maps_url || '',
    status: body.status || 'discovered',
    qa_perf: body.qa_perf ?? '',
    qa_a11y: body.qa_a11y ?? '',
    qa_bp: body.qa_bp ?? '',
    qa_seo: body.qa_seo ?? '',
    url: body.url || '',
    github_repo: body.github_repo || '',
    created_at: body.created_at || new Date().toISOString()
  }
}];"""

    for node in wf["nodes"]:
        if node["name"] == "Prepare":
            node["parameters"]["jsCode"] = new_code

    api("PUT", "/workflows/log-lead-v1", wf)
    print("[OK] Updated log-lead workflow")

def update_sheets_init_workflow():
    """Update sheets-init to write new headers."""
    wf = api("GET", "/workflows/sheets-init-final")

    new_headers = '{"values":[["place_id","name","slug","industry","archetype","region","address","phone","rating","reviews_count","maps_url","status","qa_perf","qa_a11y","qa_bp","qa_seo","url","github_repo","created_at"]]}'

    for node in wf["nodes"]:
        if node["name"] == "Write Leads Headers":
            node["parameters"]["jsonBody"] = new_headers
            node["parameters"]["url"] = "https://sheets.googleapis.com/v4/spreadsheets/16Jr3k5OZD02p7-HMSkda5jyKApPbE_KAureiV4ovYOk/values/Leads!A1:S1"

    api("PUT", "/workflows/sheets-init-final", wf)
    print("[OK] Updated sheets-init workflow")

def call_webhook(path, data=None):
    url = f"{N8N_BASE}/webhook/{path}"
    r = requests.post(url, json=data or {}, timeout=30)
    r.raise_for_status()
    return r.json()

def sync_data():
    """Clear sheets, init headers, then write all rows."""
    # Step 1: Clear
    print("\n[1/3] Clearing sheets...")
    result = call_webhook("sheets-rebuild")
    print(f"  Rebuild: {result}")
    time.sleep(1)

    # Step 2: Init headers
    print("[2/3] Writing headers...")
    result = call_webhook("sheets-init")
    print(f"  Init: {result}")
    time.sleep(1)

    # Step 3: Write all rows
    print("[3/3] Writing data rows...")
    csv_path = "data/exports/sites-sheet-update.csv"

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    success = 0
    errors = 0
    for i, row in enumerate(rows):
        try:
            call_webhook("log-lead", row)
            success += 1
            slug = row.get("slug", row.get("name", "?"))
            print(f"  [{i+1}/{len(rows)}] {slug} ✓")
        except Exception as e:
            errors += 1
            print(f"  [{i+1}/{len(rows)}] ERROR: {e}")
        # Small delay to avoid overwhelming N8N
        if (i + 1) % 10 == 0:
            time.sleep(0.5)

    print(f"\nDone! {success} written, {errors} errors")
    print(f"Sheet: https://docs.google.com/spreadsheets/d/16Jr3k5OZD02p7-HMSkda5jyKApPbE_KAureiV4ovYOk/edit#gid=1949116940")

def main():
    print("=== Updating N8N workflows ===")
    update_log_lead_workflow()
    update_sheets_init_workflow()

    print("\n=== Syncing data to Google Sheets ===")
    sync_data()

if __name__ == "__main__":
    main()
