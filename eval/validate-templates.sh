#!/bin/bash
set -euo pipefail

# DuoCode Template Validation (post-refactor)
# Validates scaffolding integrity — components are generated fresh, not pre-built

DESIGN_DIR="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/duocode-design"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1: $2"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  DuoCode Template Validation Report"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Scaffolding Files ──
echo "── 1. Scaffolding Files ──"

SHARED="$DESIGN_DIR/templates/_shared"
if [ -d "$SHARED" ]; then
  pass "1.1 _shared template directory exists"

  for f in package.json next.config.js tailwind.config.ts tsconfig.json postcss.config.js vercel.json .gitignore; do
    found=0
    for ext in "$f" "${f%.js}.mjs" "${f%.js}.ts"; do
      [ -f "$SHARED/$ext" ] && found=1 && break
    done
    if [ "$found" -eq 1 ]; then
      pass "1.2 $f"
    else
      fail "1.2 $f" "missing"
    fi
  done

  # Type definition
  if [ -f "$SHARED/src/types/business.d.ts" ]; then
    pass "1.3 business.d.ts type definition"
  else
    fail "1.3 business.d.ts" "missing"
  fi

  # Layout
  if [ -f "$SHARED/src/app/[locale]/layout.tsx" ]; then
    pass "1.4 [locale]/layout.tsx"
  else
    fail "1.4 [locale]/layout.tsx" "missing"
  fi

  # i18n
  if [ -f "$SHARED/src/lib/i18n.ts" ]; then
    pass "1.5 i18n.ts"
  else
    fail "1.5 i18n.ts" "missing"
  fi

  # globals.css
  if [ -f "$SHARED/src/styles/globals.css" ]; then
    pass "1.6 globals.css"
  else
    fail "1.6 globals.css" "missing"
  fi
else
  fail "1.1 _shared template" "directory missing"
fi
echo ""

# ── 2. Components Directory (should be empty — Claude generates fresh) ──
echo "── 2. Components Directory ──"

COMP_DIR="$SHARED/src/components"
if [ -d "$COMP_DIR" ]; then
  COMP_COUNT=$(find "$COMP_DIR" -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COMP_COUNT" -eq 0 ]; then
    pass "2.1 components/ is empty (Claude generates fresh each time)"
  else
    warn "2.1 components/ has $COMP_COUNT pre-built components" "should be empty for free design"
  fi
else
  pass "2.1 components/ directory absent (OK — created during generation)"
fi
echo ""

# ── 3. Market Reference ──
echo "── 3. Market Reference ──"

if [ -f "$DESIGN_DIR/references/malaysia-market.md" ]; then
  LINES=$(wc -l < "$DESIGN_DIR/references/malaysia-market.md" | tr -d ' ')
  pass "3.1 malaysia-market.md exists ($LINES lines)"
else
  fail "3.1 malaysia-market.md" "missing"
fi
echo ""

# ── 4. No Stale Files ──
echo "── 4. No Stale Files ──"

# Industry template directories should not exist
INDUSTRIES="restaurant beauty clinic retail fitness service generic"
for ind in $INDUSTRIES; do
  if [ -d "$DESIGN_DIR/templates/$ind" ]; then
    warn "4.1 templates/$ind still exists" "should have been deleted in refactor"
  fi
done

# Industry references should not exist
for ind in $INDUSTRIES; do
  if [ -f "$DESIGN_DIR/references/$ind.md" ]; then
    warn "4.2 references/$ind.md still exists" "should have been deleted in refactor"
  fi
done

# Old foundation files should not exist
for f in _foundations.md _copy-foundations.md; do
  if [ -f "$DESIGN_DIR/references/$f" ]; then
    warn "4.3 references/$f still exists" "should have been deleted in refactor"
  fi
done

pass "4.4 Stale file check complete"
echo ""

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
