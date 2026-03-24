#!/bin/sh
# Export full workflow definitions (with nodes) from running n8n container
# Run this after editing workflows in the n8n UI to keep git in sync

CONTAINER="duocode-n8n"
WORKFLOW_DIR="$(dirname "$0")/workflows"

echo "[DuoCode] Exporting workflows from $CONTAINER..."

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Error: Container $CONTAINER is not running"
  echo "Start it with: docker compose -f n8n/docker-compose.yml up -d"
  exit 1
fi

docker exec -u node "$CONTAINER" n8n export:workflow --all --separate --output=/workflows/

echo "[DuoCode] Workflows exported to $WORKFLOW_DIR/"
echo "Files:"
ls -la "$WORKFLOW_DIR"/*.json 2>/dev/null
echo ""
echo "Verify with: jq '.nodes | length' $WORKFLOW_DIR/*.json"
