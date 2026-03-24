#!/bin/sh
# Auto-import workflows from JSON files on container start
# Ensures cloned repos get working n8n workflows out of the box

echo "[DuoCode] Importing workflows from /workflows/*.json..."
for f in /workflows/*.json; do
  [ -f "$f" ] || continue
  NAME=$(basename "$f" .json)
  # Skip metadata-only files (no nodes array = empty shell)
  if ! node -e "const d=require('$f'); if(!d.nodes||!d.nodes.length)process.exit(1)" 2>/dev/null; then
    echo "  ⊘ $NAME (metadata only, no nodes — run backup-workflows.sh to export full definitions)"
    continue
  fi
  n8n import:workflow --input="$f" 2>/dev/null && echo "  ✓ $NAME" || echo "  ✗ $NAME (may already exist)"
done

echo "[DuoCode] Publishing all workflows..."
for f in /workflows/*.json; do
  [ -f "$f" ] || continue
  # Extract ID using node since python3 may not be available
  ID=$(node -e "const d=require('$f'); console.log(d.id||'')" 2>/dev/null || echo "")
  if [ -n "$ID" ]; then
    n8n publish:workflow --id="$ID" 2>/dev/null || true
  fi
done

echo "[DuoCode] Workflow setup complete. Starting n8n..."
exec n8n start
