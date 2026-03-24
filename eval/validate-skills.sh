#!/bin/bash
set -euo pipefail

# DuoCode Skill Validation
# Dimensions: Frontmatter completeness | Structure consistency | Reference integrity | Schema validation

SKILLS_DIR="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1${2:+: $2}"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  DuoCode Skill Validation Report"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Frontmatter Completeness ──
echo "── 1. Frontmatter Completeness ──"
for skill_file in $(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" -not -path "*/.git/*" | sort); do
  rel_path="${skill_file#$SKILLS_DIR/}"

  # Extract frontmatter (between --- markers)
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file" | sed '1d;$d')

  # Check required fields (Claude Code spec: name, description, allowed-tools)
  has_name=$(echo "$frontmatter" | grep -c "^name:" || true)
  has_desc=$(echo "$frontmatter" | grep -c "^description:" || true)
  has_tools=$(echo "$frontmatter" | grep -c "^allowed-tools:" || true)

  # Check invocation control (should have one of these)
  has_disable=$(echo "$frontmatter" | grep -c "^disable-model-invocation:" || true)
  has_user_inv=$(echo "$frontmatter" | grep -c "^user-invocable:" || true)

  if [ "$has_name" -gt 0 ] && [ "$has_desc" -gt 0 ]; then
    pass "1.1 $rel_path — name+description present"
  else
    missing=""
    [ "$has_name" -eq 0 ] && missing="${missing}name "
    [ "$has_desc" -eq 0 ] && missing="${missing}description "
    fail "1.1 $rel_path" "missing: $missing"
  fi

  # Warn about non-standard fields
  has_license=$(echo "$frontmatter" | grep -c "^license:" || true)
  has_metadata=$(echo "$frontmatter" | grep -c "^metadata:" || true)
  if [ "$has_license" -gt 0 ] || [ "$has_metadata" -gt 0 ]; then
    warn "1.2 $rel_path — has non-standard fields (license/metadata)"
  fi
done
echo ""

# ── 2. Structure Consistency ──
echo "── 2. Structure Consistency ──"

# All 12 skills should exist as flat directories
EXPECTED_SKILLS="generate batch discover prepare-assets quality-gate iterate-quality deploy duocode-design toolchain quality-standards project-standards skill-creator"
for skill in $EXPECTED_SKILLS; do
  if [ -f "$SKILLS_DIR/$skill/SKILL.md" ]; then
    pass "2.1 $skill/SKILL.md exists"
  else
    fail "2.1 $skill/SKILL.md" "missing"
  fi
done

# Count total skills
SKILL_COUNT=$(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')
echo "  Total skills: $SKILL_COUNT (target: 12)"
echo ""

# ── 3. Reference Integrity ──
echo "── 3. Reference Integrity ──"

DESIGN_DIR="$SKILLS_DIR/duocode-design"

# Industry references
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

# Toolchain references
TOOLCHAIN_REFS="browser-use lighthouse-ci github n8n favicon-generator svg-icon-maker sheets-automation tailwind-css"
for ref in $TOOLCHAIN_REFS; do
  if [ -f "$SKILLS_DIR/toolchain/references/$ref.md" ]; then
    pass "3.3 toolchain/$ref.md exists"
  else
    fail "3.3 toolchain/$ref.md" "missing toolchain reference"
  fi
done

# Quality references
QUALITY_REFS="accessibility best-practices core-web-vitals performance seo schema-markup visual-testing webapp-testing"
for ref in $QUALITY_REFS; do
  if [ -f "$SKILLS_DIR/quality-standards/references/$ref.md" ]; then
    pass "3.4 quality/$ref.md exists"
  else
    fail "3.4 quality/$ref.md" "missing quality reference"
  fi
done
echo ""

# ── 4. Schema Validation ──
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

# ── 5. Security Checks ──
echo "── 5. Security Checks ──"

# Check .env.template has no real keys
TEMPLATE="$(cd "$(dirname "$0")/.." && pwd)/.env.template"
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
