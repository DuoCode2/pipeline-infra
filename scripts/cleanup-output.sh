#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$SRC_DIR/output"

echo "=== DuoCode Output Cleanup ==="
echo ""

BEFORE=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)
echo "Before: $BEFORE"

count=0
for dir in "$OUTPUT_DIR"/*/; do
  [ -d "$dir" ] || continue

  if [ -d "$dir/node_modules" ]; then
    rm -rf "$dir/node_modules"
    ((count++))
  fi

  if [ -d "$dir/.next" ]; then
    rm -rf "$dir/.next"
  fi
done

AFTER=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)
echo "After:  $AFTER"
echo "Cleaned $count site(s)"
echo ""
echo "Sites can be rebuilt with: cd output/{slug} && npm install && npm run build"
