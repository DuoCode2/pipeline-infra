#!/usr/bin/env python3
"""Sync sites.json → Google Sheets (gid=1949116940)."""

import json
import csv
import io
import subprocess
import sys

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import google.auth

SPREADSHEET_ID = "16Jr3k5OZD02p7-HMSkda5jyKApPbE_KAureiV4ovYOk"
SHEET_NAME = None  # Will resolve from gid
TARGET_GID = 1949116940

def get_sheet_name(service, spreadsheet_id, gid):
    """Resolve sheet name from gid."""
    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    for sheet in meta["sheets"]:
        if sheet["properties"]["sheetId"] == gid:
            return sheet["properties"]["title"]
    raise ValueError(f"No sheet with gid={gid}")

def build_rows(sites_path, csv_path):
    """Build rows from the CSV export (already has all data including discovered leads)."""
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        rows.append(header)
        for row in reader:
            rows.append(row)
    return rows

def main():
    # Auth via application default credentials
    creds, project = google.auth.default(
        scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    service = build("sheets", "v4", credentials=creds)

    # Resolve sheet name
    sheet_name = get_sheet_name(service, SPREADSHEET_ID, TARGET_GID)
    print(f"Target sheet: '{sheet_name}' (gid={TARGET_GID})")

    # Build data from CSV
    csv_path = "data/exports/sites-sheet-update.csv"
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        for row in reader:
            rows.append(row)

    print(f"Total rows: {len(rows)} (1 header + {len(rows)-1} data)")

    # Clear existing data
    range_clear = f"'{sheet_name}'!A1:Z500"
    service.spreadsheets().values().clear(
        spreadsheetId=SPREADSHEET_ID,
        range=range_clear,
    ).execute()
    print("Cleared existing data")

    # Write new data
    range_write = f"'{sheet_name}'!A1"
    body = {"values": rows}
    result = service.spreadsheets().values().update(
        spreadsheetId=SPREADSHEET_ID,
        range=range_write,
        valueInputOption="RAW",
        body=body,
    ).execute()
    print(f"Updated: {result.get('updatedCells', 0)} cells, {result.get('updatedRows', 0)} rows")

    # Auto-resize columns
    sheet_id = TARGET_GID
    requests = [{
        "autoResizeDimensions": {
            "dimensions": {
                "sheetId": sheet_id,
                "dimension": "COLUMNS",
                "startIndex": 0,
                "endIndex": len(rows[0]),
            }
        }
    }]
    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": requests},
    ).execute()
    print("Auto-resized columns")

    print(f"\nDone! Sheet updated: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid={TARGET_GID}")

if __name__ == "__main__":
    main()
