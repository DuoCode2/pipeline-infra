#!/bin/sh
# Export full workflow definitions (with nodes) from running n8n container
# Run this after editing workflows in the n8n UI to keep git in sync

WORKFLOW_DIR="$(dirname "$0")/workflows"

# Find the n8n container (handles both docker compose naming conventions)
CONTAINER=$(docker ps --format '{{.Names}}' | grep -E 'n8n' | head -1)

if [ -z "$CONTAINER" ]; then
  echo "Error: No n8n container is running"
  echo "Start it with: docker compose -f n8n/docker-compose.yml up -d"
  exit 1
fi

echo "[DuoCode] Exporting workflows from $CONTAINER..."

# Export to writable /tmp inside container, then copy out
docker exec "$CONTAINER" sh -c "rm -rf /tmp/wf-export && mkdir -p /tmp/wf-export && n8n export:workflow --all --separate --output=/tmp/wf-export/"

# Copy exported files to host
docker cp "$CONTAINER:/tmp/wf-export/." "$WORKFLOW_DIR/"

echo "[DuoCode] Workflows exported to $WORKFLOW_DIR/"
echo ""
for f in "$WORKFLOW_DIR"/*.json; do
  [ -f "$f" ] || continue
  NAME=$(jq -r '.name // "unknown"' "$f")
  NODES=$(jq '.nodes | length' "$f")
  echo "  $NAME: $NODES nodes ($(basename "$f"))"
done
