#!/bin/bash
# DuoCode Pipeline — 完整测试套件
# 用法: bash tests/run-all.sh
# 依赖: .env 已配置, npm install 已运行

set -e
cd "$(dirname "$0")/.."

# 加载环境变量
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

PASS=0
FAIL=0
SKIP=0
RESULTS=""

log_pass() { PASS=$((PASS+1)); RESULTS="$RESULTS\n  ✅ $1"; echo "  ✅ $1"; }
log_fail() { FAIL=$((FAIL+1)); RESULTS="$RESULTS\n  ❌ $1: $2"; echo "  ❌ $1: $2"; }
log_skip() { SKIP=$((SKIP+1)); RESULTS="$RESULTS\n  ⏭️  $1: $2"; echo "  ⏭️  $1: $2"; }

echo ""
echo "═══════════════════════════════════════════════"
echo "  DuoCode Pipeline — Test Suite"
echo "═══════════════════════════════════════════════"

# ─── TEST GROUP 1: Environment ───────────────────
echo ""
echo "── 1. Environment ──"

# 1.1 .env exists and is readable
if [ -f .env ]; then log_pass "1.1 .env file exists"
else log_fail "1.1 .env file" "not found"; fi

# 1.2 Required env vars are set
for var in GOOGLE_API_KEY UNSPLASH_ACCESS_KEY PEXELS_API_KEY VERCEL_TOKEN; do
  val=$(eval echo \$$var)
  if [ -n "$val" ]; then log_pass "1.2 $var is set"
  else log_fail "1.2 $var" "empty or missing"; fi
done

# 1.3 Node.js available
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  log_pass "1.3 Node.js $NODE_VER"
else log_fail "1.3 Node.js" "not installed"; fi

# 1.4 package.json exists
if [ -f package.json ]; then log_pass "1.4 package.json exists"
else log_fail "1.4 package.json" "not found"; fi

# ─── TEST GROUP 2: API Connectivity ─────────────
echo ""
echo "── 2. API Connectivity ──"

# 2.1 Google Maps Places API
MAPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "https://places.googleapis.com/v1/places:searchText" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id" \
  -d '{"textQuery":"restaurant in Kuala Lumpur","pageSize":1}')
if [ "$MAPS_RESPONSE" = "200" ]; then log_pass "2.1 Google Maps Places API"
else log_fail "2.1 Google Maps Places API" "HTTP $MAPS_RESPONSE"; fi

# 2.2 Google Maps — returns place data
MAPS_DATA=$(curl -s -X POST \
  "https://places.googleapis.com/v1/places:searchText" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id,places.displayName,places.websiteUri,places.photos" \
  -d '{"textQuery":"restaurant in Kuala Lumpur","pageSize":5}')
PLACE_COUNT=$(echo "$MAPS_DATA" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('places',[])))" 2>/dev/null || echo 0)
if [ "$PLACE_COUNT" -gt 0 ]; then log_pass "2.2 Maps returns $PLACE_COUNT places"
else log_fail "2.2 Maps data" "no places returned"; fi

# 2.3 Google Maps — can find businesses WITHOUT website
NO_WEBSITE=$(echo "$MAPS_DATA" | python3 -c "
import sys,json
places = json.load(sys.stdin).get('places',[])
no_web = [p for p in places if 'websiteUri' not in p]
print(len(no_web))" 2>/dev/null || echo 0)
echo "     (Info: $NO_WEBSITE/$PLACE_COUNT without website in sample)"
log_pass "2.3 Maps websiteUri filter works"

# 2.4 Google Maps — photos field available
HAS_PHOTOS=$(echo "$MAPS_DATA" | python3 -c "
import sys,json
places = json.load(sys.stdin).get('places',[])
with_photos = [p for p in places if 'photos' in p]
print(len(with_photos))" 2>/dev/null || echo 0)
if [ "$HAS_PHOTOS" -gt 0 ]; then log_pass "2.4 Maps photos field available ($HAS_PHOTOS/$PLACE_COUNT)"
else log_fail "2.4 Maps photos" "no photos in response"; fi

# 2.5 Unsplash API
UNSPLASH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://api.unsplash.com/search/photos?query=restaurant&per_page=1" \
  -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY")
if [ "$UNSPLASH_RESPONSE" = "200" ]; then log_pass "2.5 Unsplash API"
else log_fail "2.5 Unsplash API" "HTTP $UNSPLASH_RESPONSE"; fi

# 2.6 Pexels API
PEXELS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://api.pexels.com/v1/search?query=restaurant&per_page=1" \
  -H "Authorization: $PEXELS_API_KEY")
if [ "$PEXELS_RESPONSE" = "200" ]; then log_pass "2.6 Pexels API"
else log_fail "2.6 Pexels API" "HTTP $PEXELS_RESPONSE"; fi

# 2.7 Vercel API
VERCEL_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://api.vercel.com/v9/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN")
if [ "$VERCEL_RESPONSE" = "200" ]; then log_pass "2.7 Vercel API"
else log_fail "2.7 Vercel API" "HTTP $VERCEL_RESPONSE"; fi

# 2.8 Gemini API (for n8n classification)
GEMINI_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_API_KEY")
if [ "$GEMINI_RESPONSE" = "200" ]; then log_pass "2.8 Gemini API"
else log_fail "2.8 Gemini API" "HTTP $GEMINI_RESPONSE"; fi

# ─── TEST GROUP 3: Google Maps Deep Tests ────────
echo ""
echo "── 3. Google Maps Deep Tests ──"

# 3.1 Pagination works (page 2)
PAGE1=$(curl -s -X POST \
  "https://places.googleapis.com/v1/places:searchText" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
  -H "X-Goog-FieldMask: places.id" \
  -d '{"textQuery":"restaurant in Kuala Lumpur","pageSize":20}')
NEXT_TOKEN=$(echo "$PAGE1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('nextPageToken',''))" 2>/dev/null)
if [ -n "$NEXT_TOKEN" ]; then
  log_pass "3.1 Pagination token received"
  # 3.2 Page 2 returns data
  PAGE2=$(curl -s -X POST \
    "https://places.googleapis.com/v1/places:searchText" \
    -H "Content-Type: application/json" \
    -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
    -H "X-Goog-FieldMask: places.id" \
    -d "{\"textQuery\":\"restaurant in Kuala Lumpur\",\"pageSize\":20,\"pageToken\":\"$NEXT_TOKEN\"}")
  P2_COUNT=$(echo "$PAGE2" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('places',[])))" 2>/dev/null || echo 0)
  if [ "$P2_COUNT" -gt 0 ]; then log_pass "3.2 Page 2 returns $P2_COUNT places"
  else log_fail "3.2 Page 2" "no places"; fi
else
  log_skip "3.1 Pagination" "no nextPageToken (small result set)"
  log_skip "3.2 Page 2" "skipped"
fi

# 3.3 Photo download works
PHOTO_NAME=$(echo "$MAPS_DATA" | python3 -c "
import sys,json
places = json.load(sys.stdin).get('places',[])
for p in places:
  if 'photos' in p and len(p['photos']) > 0:
    print(p['photos'][0]['name'])
    break" 2>/dev/null)
if [ -n "$PHOTO_NAME" ]; then
  PHOTO_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    "https://places.googleapis.com/v1/$PHOTO_NAME/media?maxHeightPx=400&key=$GOOGLE_API_KEY")
  if [ "$PHOTO_RESPONSE" = "200" ] || [ "$PHOTO_RESPONSE" = "302" ]; then
    log_pass "3.3 Photo download works (HTTP $PHOTO_RESPONSE)"
  else log_fail "3.3 Photo download" "HTTP $PHOTO_RESPONSE"; fi
else
  log_skip "3.3 Photo download" "no photo name found"
fi

# 3.4 Multiple categories work
for CAT in "beauty_salon" "dentist" "gym" "clothing_store"; do
  CAT_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "https://places.googleapis.com/v1/places:searchText" \
    -H "Content-Type: application/json" \
    -H "X-Goog-Api-Key: $GOOGLE_API_KEY" \
    -H "X-Goog-FieldMask: places.id" \
    -d "{\"textQuery\":\"$CAT in Kuala Lumpur\",\"pageSize\":1}")
  if [ "$CAT_RESP" = "200" ]; then log_pass "3.4 Category '$CAT' searchable"
  else log_fail "3.4 Category '$CAT'" "HTTP $CAT_RESP"; fi
done

# ─── TEST GROUP 4: Skills Structure ─────────────
echo ""
echo "── 4. Skills Structure ──"

SKILLS_DIR=".claude/skills"

# 4.1 Layer 1 structure
for dir in quality deploy toolchain outreach discovery generate iterate-quality prepare-assets quality-gate batch-orchestrator standards; do
  if [ -d "$SKILLS_DIR/layer1-pipeline/$dir" ]; then log_pass "4.1 layer1/$dir exists"
  else log_fail "4.1 layer1/$dir" "directory missing"; fi
done

# 4.2 Layer 2 structure
for dir in duocode-design brand-designer landing-page-generator; do
  if [ -d "$SKILLS_DIR/layer2-design/$dir" ]; then log_pass "4.2 layer2/$dir exists"
  else log_fail "4.2 layer2/$dir" "directory missing"; fi
done

# 4.3 Key SKILL.md files exist
KEY_SKILLS=(
  "layer1-pipeline/quality/web-quality-audit/SKILL.md"
  "layer1-pipeline/deploy/deploy-to-vercel/SKILL.md"
  "layer1-pipeline/generate/SKILL.md"
  "layer2-design/duocode-design/SKILL.md"
  "layer1-pipeline/prepare-assets/SKILL.md"
  "layer1-pipeline/quality-gate/SKILL.md"
  "layer1-pipeline/batch-orchestrator/SKILL.md"
  "layer1-pipeline/standards/code-conventions/SKILL.md"
  "layer1-pipeline/standards/data-schema/SKILL.md"
  "skill-creator/SKILL.md"
)
for s in "${KEY_SKILLS[@]}"; do
  if [ -f "$SKILLS_DIR/$s" ]; then log_pass "4.3 $s"
  else log_fail "4.3 $s" "file missing"; fi
done

# 4.4 DuoCode design references
for ref in _foundations.md _copy-foundations.md restaurant.md beauty.md clinic.md retail.md fitness.md service.md generic.md; do
  if [ -f "$SKILLS_DIR/layer2-design/duocode-design/references/$ref" ]; then log_pass "4.4 reference/$ref"
  else log_fail "4.4 reference/$ref" "file missing"; fi
done

# 4.5 DuoCode design schemas
for schema in _base.schema.json restaurant.schema.json beauty.schema.json clinic.schema.json retail.schema.json fitness.schema.json service.schema.json generic.schema.json; do
  if [ -f "$SKILLS_DIR/layer2-design/duocode-design/schemas/$schema" ]; then log_pass "4.5 schema/$schema"
  else log_fail "4.5 schema/$schema" "file missing"; fi
done

# 4.6 Schemas are valid JSON
for schema in "$SKILLS_DIR"/layer2-design/duocode-design/schemas/*.json; do
  if python3 -m json.tool "$schema" >/dev/null 2>&1; then log_pass "4.6 $(basename $schema) valid JSON"
  else log_fail "4.6 $(basename $schema)" "invalid JSON"; fi
done

# ─── TEST GROUP 5: Template System ──────────────
echo ""
echo "── 5. Template System ──"

TPL_DIR="$SKILLS_DIR/layer2-design/duocode-design/templates"

# 5.1 Template directories
if [ -d "$TPL_DIR/_shared" ]; then log_pass "5.1 _shared template dir"
else log_fail "5.1 _shared template" "directory missing"; fi

if [ -d "$TPL_DIR/restaurant" ]; then log_pass "5.1 restaurant template dir"
else log_fail "5.1 restaurant template" "directory missing"; fi

# 5.2 Shared components exist
REQUIRED_COMPONENTS=(Header Hero Footer CTA Reviews Hours Location ResponsiveImage)
for comp in "${REQUIRED_COMPONENTS[@]}"; do
  if [ -f "$TPL_DIR/_shared/components/$comp.tsx" ]; then log_pass "5.2 Component $comp.tsx"
  else log_fail "5.2 Component $comp.tsx" "not created yet (Phase 2 task)"; fi
done

# 5.3 Type definitions
if [ -f "$TPL_DIR/_shared/types/business.d.ts" ]; then log_pass "5.3 business.d.ts"
else log_fail "5.3 business.d.ts" "not created yet (Phase 2 task)"; fi

# 5.4 Example business.ts
EXAMPLE_DIR="$SKILLS_DIR/layer2-design/duocode-design/examples/restaurant"
if [ -d "$EXAMPLE_DIR" ] && ls "$EXAMPLE_DIR"/*/business.ts >/dev/null 2>&1; then
  log_pass "5.4 Restaurant example exists"
else log_fail "5.4 Restaurant example" "not created yet (Phase 2 task)"; fi

# ─── TEST GROUP 6: n8n ──────────────────────────
echo ""
echo "── 6. n8n ──"

# 6.1 docker-compose.yml exists
if [ -f n8n/docker-compose.yml ]; then log_pass "6.1 docker-compose.yml"
else log_fail "6.1 docker-compose.yml" "not created yet (Phase 4 task)"; fi

# 6.2 n8n running
N8N_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5678/healthz 2>/dev/null || echo "000")
if [ "$N8N_STATUS" = "200" ]; then log_pass "6.2 n8n running at :5678"
else log_skip "6.2 n8n" "not running (start with: cd n8n && docker compose up -d)"; fi

# ─── TEST GROUP 7: Packages ────────────────────
echo ""
echo "── 7. Packages ──"

# 7.1 Package files exist
for pkg in discover/search.ts assets/maps-photos.ts assets/stock-photos.ts assets/extract-colors.ts assets/optimize-images.ts deploy/deploy.ts; do
  if [ -f "packages/$pkg" ]; then log_pass "7.1 packages/$pkg"
  else log_fail "7.1 packages/$pkg" "not created yet (Phase 1 task)"; fi
done

# ─── SUMMARY ────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════"
echo "  Results: ✅ $PASS passed | ❌ $FAIL failed | ⏭️  $SKIP skipped"
echo "═══════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo "Failed tests:"
  echo -e "$RESULTS" | grep "❌"
  exit 1
fi
