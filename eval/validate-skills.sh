#!/bin/bash
set -euo pipefail

# DuoCode Skill Validation (post-refactor)
# Validates: Frontmatter | Structure | Reference integrity | Schema | Security

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
  frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file" | sed '1d;$d')
  has_name=$(echo "$frontmatter" | grep -c "^name:" || true)
  has_desc=$(echo "$frontmatter" | grep -c "^description:" || true)

  if [ "$has_name" -gt 0 ] && [ "$has_desc" -gt 0 ]; then
    pass "1.1 $rel_path — name+description present"
  else
    missing=""
    [ "$has_name" -eq 0 ] && missing="${missing}name "
    [ "$has_desc" -eq 0 ] && missing="${missing}description "
    fail "1.1 $rel_path" "missing: $missing"
  fi
done
echo ""

# ── 2. Structure Consistency ──
echo "── 2. Structure Consistency ──"

# 9 skills after refactor (removed iterate-quality, quality-standards, project-standards)
EXPECTED_SKILLS="generate batch discover prepare-assets quality-gate deploy duocode-design toolchain skill-creator"
for skill in $EXPECTED_SKILLS; do
  if [ -f "$SKILLS_DIR/$skill/SKILL.md" ]; then
    pass "2.1 $skill/SKILL.md exists"
  else
    fail "2.1 $skill/SKILL.md" "missing"
  fi
done

SKILL_COUNT=$(find "$SKILLS_DIR" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')
echo "  Total skills: $SKILL_COUNT (target: 9)"
echo ""

# ── 3. Reference Integrity ──
echo "── 3. Reference Integrity ──"

DESIGN_DIR="$SKILLS_DIR/duocode-design"

# Malaysia market reference (single file replaces old industry references)
if [ -f "$DESIGN_DIR/references/malaysia-market.md" ]; then
  pass "3.1 malaysia-market.md exists"
else
  fail "3.1 malaysia-market.md" "missing market reference"
fi

# Base schema
if [ -f "$DESIGN_DIR/schemas/_base.schema.json" ]; then
  if python3 -c "import json; json.load(open('$DESIGN_DIR/schemas/_base.schema.json'))" 2>/dev/null; then
    pass "3.2 _base.schema.json — valid JSON"
  else
    fail "3.2 _base.schema.json" "invalid JSON"
  fi
else
  fail "3.2 _base.schema.json" "missing"
fi
echo ""

# ── 4. Scaffolding Integrity ──
echo "── 4. Scaffolding Integrity ──"

SHARED="$DESIGN_DIR/templates/_shared"
for f in package.json next.config.js tailwind.config.ts tsconfig.json vercel.json .gitignore; do
  if [ -f "$SHARED/$f" ]; then
    pass "4.1 _shared/$f"
  else
    fail "4.1 _shared/$f" "missing"
  fi
done

# Layout and types
if [ -f "$SHARED/src/app/[locale]/layout.tsx" ]; then
  pass "4.2 layout.tsx exists"
else
  fail "4.2 layout.tsx" "missing"
fi

if [ -f "$SHARED/src/types/business.d.ts" ]; then
  pass "4.3 business.d.ts exists"
else
  fail "4.3 business.d.ts" "missing"
fi

if [ -f "$SHARED/src/lib/i18n.ts" ]; then
  pass "4.4 i18n.ts exists"
else
  fail "4.4 i18n.ts" "missing"
fi
echo ""

# ── 5. Security Checks ──
echo "── 5. Security Checks ──"

TEMPLATE="$(cd "$(dirname "$0")/.." && pwd)/.env.template"
if [ -f "$TEMPLATE" ]; then
  if grep -qE "AIzaSy|g5r7w|mIN2V|vcp_6aj|duocode2026" "$TEMPLATE"; then
    fail "5.1 .env.template" "contains real API keys"
  else
    pass "5.1 .env.template — no leaked keys"
  fi
fi

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)/packages"
if grep -rq "process\.env\.\w\+!" "$SRC_DIR" 2>/dev/null; then
  fail "5.2 source files" "non-null assertions on process.env found"
else
  pass "5.2 source files — all use requireEnv()"
fi
echo ""

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
