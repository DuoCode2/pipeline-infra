#!/bin/bash
set -euo pipefail

# DuoCode Skill 验证评测
# 评测维度: Frontmatter 完整性 | 结构一致性 | 引用完整性 | Schema 验证

SKILLS_DIR="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1: $2"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  DuoCode Skill Validation Report"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Frontmatter 完整性 ──
echo "── 1. Frontmatter Completeness ──"
for skill_file in $(find "$SKILLS_DIR" -name "SKILL.md" -not -path "*/.git/*"); do
  rel_path="${skill_file#$SKILLS_DIR/}"

  # Extract frontmatter (between --- markers)
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file" | sed '1d;$d')

  # Check required fields
  has_name=$(echo "$frontmatter" | grep -c "^name:" || true)
  has_desc=$(echo "$frontmatter" | grep -c "^description:" || true)
  has_license=$(echo "$frontmatter" | grep -c "^license:" || true)
  has_author=$(echo "$frontmatter" | grep -c "author:" || true)
  has_version=$(echo "$frontmatter" | grep -c "version:" || true)

  if [ "$has_name" -gt 0 ] && [ "$has_desc" -gt 0 ] && [ "$has_license" -gt 0 ] && [ "$has_author" -gt 0 ] && [ "$has_version" -gt 0 ]; then
    pass "1.1 $rel_path — all fields present"
  else
    missing=""
    [ "$has_name" -eq 0 ] && missing="${missing}name "
    [ "$has_desc" -eq 0 ] && missing="${missing}description "
    [ "$has_license" -eq 0 ] && missing="${missing}license "
    [ "$has_author" -eq 0 ] && missing="${missing}author "
    [ "$has_version" -eq 0 ] && missing="${missing}version "
    fail "1.1 $rel_path" "missing: $missing"
  fi
done
echo ""

# ── 2. 结构一致性 ──
echo "── 2. Structure Consistency ──"

# Layer 1 required directories
L1_REQUIRED="quality deploy toolchain outreach discovery generate iterate-quality prepare-assets quality-gate batch-orchestrator standards"
for dir in $L1_REQUIRED; do
  if [ -d "$SKILLS_DIR/layer1-pipeline/$dir" ]; then
    pass "2.1 layer1-pipeline/$dir exists"
  else
    fail "2.1 layer1-pipeline/$dir" "directory missing"
  fi
done

# Layer 2 required directories
L2_REQUIRED="duocode-design brand-designer landing-page-generator"
for dir in $L2_REQUIRED; do
  if [ -d "$SKILLS_DIR/layer2-design/$dir" ]; then
    pass "2.2 layer2-design/$dir exists"
  else
    fail "2.2 layer2-design/$dir" "directory missing"
  fi
done

# Verify no unexpected Layer 2 skills (should only be 3)
L2_COUNT=$(ls -d "$SKILLS_DIR/layer2-design/"*/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$L2_COUNT" -eq 3 ]; then
  pass "2.3 Layer 2 has exactly 3 skills (consolidated)"
else
  warn "2.3 Layer 2 skill count" "expected 3, got $L2_COUNT"
fi
echo ""

# ── 3. 引用完整性 ──
echo "── 3. Reference Integrity ──"

DESIGN_DIR="$SKILLS_DIR/layer2-design/duocode-design"

# References
INDUSTRIES="restaurant beauty clinic retail fitness service generic"
for ind in $INDUSTRIES; do
  if [ -f "$DESIGN_DIR/references/$ind.md" ]; then
    pass "3.1 reference/$ind.md exists"
  else
    fail "3.1 reference/$ind.md" "missing industry reference"
  fi
done

# Foundation files
for f in _foundations.md _copy-foundations.md; do
  if [ -f "$DESIGN_DIR/references/$f" ]; then
    pass "3.2 reference/$f exists"
  else
    fail "3.2 reference/$f" "missing foundation file"
  fi
done
echo ""

# ── 4. Schema 验证 ──
echo "── 4. Schema Validation ──"

# Base schema
if [ -f "$DESIGN_DIR/schemas/_base.schema.json" ]; then
  pass "4.1 _base.schema.json exists"
else
  fail "4.1 _base.schema.json" "missing base schema"
fi

# Industry schemas + JSON validity
for ind in $INDUSTRIES; do
  schema="$DESIGN_DIR/schemas/$ind.schema.json"
  if [ -f "$schema" ]; then
    if python3 -c "import json; json.load(open('$schema'))" 2>/dev/null; then
      pass "4.2 $ind.schema.json — valid JSON"
    else
      fail "4.2 $ind.schema.json" "invalid JSON"
    fi
  else
    fail "4.2 $ind.schema.json" "missing"
  fi
done

# Schema-reference pairing
for ind in $INDUSTRIES; do
  has_schema=0; has_ref=0
  [ -f "$DESIGN_DIR/schemas/$ind.schema.json" ] && has_schema=1
  [ -f "$DESIGN_DIR/references/$ind.md" ] && has_ref=1
  if [ "$has_schema" -eq 1 ] && [ "$has_ref" -eq 1 ]; then
    pass "4.3 $ind — schema+reference paired"
  else
    fail "4.3 $ind" "schema=$has_schema reference=$has_ref"
  fi
done
echo ""

# ── 5. 安全检查 ──
echo "── 5. Security Checks ──"

# Check .env.template has no real keys
TEMPLATE="$(cd "$(dirname "$0")/../.." && pwd)/.env.template"
if [ -f "$TEMPLATE" ]; then
  if grep -qE "AIzaSy|g5r7w|mIN2V|vcp_6aj|duocode2026" "$TEMPLATE"; then
    fail "5.1 .env.template" "contains real API keys"
  else
    pass "5.1 .env.template — no leaked keys"
  fi
fi

# Check docker-compose has no hardcoded password
COMPOSE="$(cd "$(dirname "$0")/.." && pwd)/n8n/docker-compose.yml"
if [ -f "$COMPOSE" ]; then
  if grep -q "N8N_BASIC_AUTH_PASSWORD=duocode" "$COMPOSE"; then
    fail "5.2 docker-compose.yml" "hardcoded password"
  else
    pass "5.2 docker-compose.yml — no hardcoded password"
  fi
fi

# Check source files use requireEnv
SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/packages"
if grep -rq "process\.env\.\w\+!" "$SRC_DIR" 2>/dev/null; then
  fail "5.3 source files" "non-null assertions on process.env found"
else
  pass "5.3 source files — all use requireEnv()"
fi
echo ""

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
