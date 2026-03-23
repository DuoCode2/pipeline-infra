#!/bin/bash
set -euo pipefail

# DuoCode Template Completeness Evaluation

DESIGN_DIR="$(cd "$(dirname "$0")/.." && pwd)/.claude/skills/layer2-design/duocode-design"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1: $2"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  DuoCode Template Completeness Report"
echo "═══════════════════════════════════════"
echo ""

# ── 1. 共享组件完整性 ──
echo "── 1. Shared Components ──"

SHARED="$DESIGN_DIR/templates/_shared"
if [ -d "$SHARED" ]; then
  pass "1.1 _shared template directory exists"

  # Required files
  for f in package.json next.config.js tailwind.config.ts tsconfig.json; do
    # Also check alternative extensions
    found=0
    for ext in "$f" "${f%.js}.mjs" "${f%.js}.ts"; do
      [ -f "$SHARED/$ext" ] && found=1 && break
    done
    if [ "$found" -eq 1 ]; then
      pass "1.2 _shared/$f"
    else
      fail "1.2 _shared/$f" "missing"
    fi
  done

  # Required components
  COMP_DIR="$SHARED/src/components"
  REQUIRED="Header Footer Hero CTA ContactForm Hours Location ResponsiveImage Reviews TrustBar LanguageSwitcher SvgDecoration"
  for comp in $REQUIRED; do
    if [ -f "$COMP_DIR/$comp.tsx" ]; then
      pass "1.3 Component: $comp.tsx"
    else
      fail "1.3 Component: $comp.tsx" "missing"
    fi
  done

  # Type definition
  if find "$SHARED/src" -name "business.d.ts" 2>/dev/null | grep -q .; then
    pass "1.4 business.d.ts type definition"
  else
    fail "1.4 business.d.ts" "missing"
  fi
else
  fail "1.1 _shared template" "directory missing"
fi
echo ""

# ── 2. 行业模板覆盖度 ──
echo "── 2. Industry Coverage ──"

INDUSTRIES="restaurant beauty clinic retail fitness service generic"
COMPLETE=0
PARTIAL=0
MISSING=0

for ind in $INDUSTRIES; do
  has_ref=0; has_schema=0; has_template=0; has_example=0

  [ -f "$DESIGN_DIR/references/$ind.md" ] && has_ref=1
  [ -f "$DESIGN_DIR/schemas/$ind.schema.json" ] && has_schema=1
  [ -d "$DESIGN_DIR/templates/$ind" ] && has_template=1
  [ -d "$DESIGN_DIR/examples/$ind" ] && has_example=1

  score=$((has_ref + has_schema + has_template + has_example))

  if [ "$score" -eq 4 ]; then
    pass "2.1 $ind — complete (ref+schema+template+example)"
    ((COMPLETE++))
  elif [ "$score" -gt 0 ]; then
    detail="ref=$has_ref schema=$has_schema template=$has_template example=$has_example"
    warn "2.1 $ind — partial ($score/4)" "$detail"
    ((PARTIAL++))
  else
    fail "2.1 $ind" "completely missing"
    ((MISSING++))
  fi
done

echo ""
echo "  Industry coverage: $COMPLETE complete, $PARTIAL partial, $MISSING missing out of 7"
echo ""

# ── 3. 示例质量 ──
echo "── 3. Example Quality ──"

for ind in $INDUSTRIES; do
  EXAMPLE_DIR="$DESIGN_DIR/examples/$ind"
  if [ -d "$EXAMPLE_DIR" ]; then
    # Check for business.ts files
    BIZ_COUNT=$(find "$EXAMPLE_DIR" -name "business.ts" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$BIZ_COUNT" -gt 0 ]; then
      pass "3.1 $ind — $BIZ_COUNT business.ts file(s)"
    else
      warn "3.1 $ind" "example dir exists but no business.ts"
    fi

    # Check for SVG files
    SVG_COUNT=$(find "$EXAMPLE_DIR" -name "*.svg" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$SVG_COUNT" -gt 0 ]; then
      pass "3.2 $ind — $SVG_COUNT SVG file(s)"
    else
      warn "3.2 $ind" "no SVG files in examples"
    fi
  fi
done
echo ""

# ── 4. Design Foundations 对齐 ──
echo "── 4. Design Foundations Alignment ──"

FOUND="$DESIGN_DIR/references/_foundations.md"
if [ -f "$FOUND" ]; then
  LINES=$(wc -l < "$FOUND" | tr -d ' ')
  pass "4.1 _foundations.md exists ($LINES lines)"

  # Check required sections
  SECTIONS="Anti-AI Typography Spacing Color SVG Responsive Fluid"
  for sec in $SECTIONS; do
    if grep -qi "$sec" "$FOUND"; then
      pass "4.2 Section: $sec"
    else
      fail "4.2 Section: $sec" "not found in _foundations.md"
    fi
  done
else
  fail "4.1 _foundations.md" "missing"
fi

echo ""

# ── 5. 行业 Reference 深度 ──
echo "── 5. Industry Reference Depth ──"

for ind in $INDUSTRIES; do
  REF="$DESIGN_DIR/references/$ind.md"
  if [ -f "$REF" ]; then
    LINES=$(wc -l < "$REF" | tr -d ' ')
    if [ "$LINES" -ge 100 ]; then
      pass "5.1 $ind.md — $LINES lines (target: ≥100)"
    elif [ "$LINES" -ge 60 ]; then
      warn "5.1 $ind.md — $LINES lines" "below target of 100"
    else
      fail "5.1 $ind.md — $LINES lines" "significantly below target of 100"
    fi
  fi
done
echo ""

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
