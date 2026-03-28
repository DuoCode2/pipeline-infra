#!/bin/bash
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1: $2"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  Locale Route Verification"
echo "═══════════════════════════════════════"
echo ""

if [ -f "$SRC_DIR/packages/utils/repair-locale-routes.ts" ]; then
  pass "1.1 repair-locale-routes.ts exists"
else
  fail "1.1 repair-locale-routes.ts" "missing"
fi

if grep -q "waitForHealthyLocaleRoutes" "$SRC_DIR/packages/pipeline/finalize.ts"; then
  pass "1.2 finalize.ts performs deployed locale route verification"
else
  fail "1.2 finalize.ts" "does not verify deployed locale routes"
fi

if grep -q "findShadowedCleanUrls" "$SRC_DIR/packages/deploy/deploy.ts"; then
  pass "1.3 deploy.ts guards clean URL collisions"
else
  fail "1.3 deploy.ts" "missing clean URL collision guard"
fi

REGISTRY_PATH="$SRC_DIR/data/sites-registry.json"
if [ ! -f "$REGISTRY_PATH" ]; then
  warn "2.0 registry audit" "data/sites-registry.json missing"
else
  COUNT=$(python3 - <<PY
import json
with open("$REGISTRY_PATH") as f:
    print(len(json.load(f)))
PY
)
  if [ "$COUNT" -eq 0 ]; then
    warn "2.0 registry audit" "registry is empty"
  else
    echo ""
    echo "── Live audit: $COUNT registered sites ──"
    if OUTPUT=$(cd "$SRC_DIR" && npx tsx packages/utils/repair-locale-routes.ts --check-only 2>&1); then
      echo "$OUTPUT"
      pass "2.1 deployed locale routes audit"
    else
      echo "$OUTPUT"
      fail "2.1 deployed locale routes audit" "one or more registered URLs failed locale refresh verification"
    fi
  fi
fi

echo ""
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
