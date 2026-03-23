#!/bin/bash
set -euo pipefail

# DuoCode Quality Metrics Evaluation
# 检查: 性能预算 | Lighthouse 配置 | 可访问性 | SEO

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TPL_DIR="$SRC_DIR/.claude/skills/layer2-design/duocode-design/templates"
PASSED=0; FAILED=0; WARNED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
warn() { echo "  ⚠️  $1: $2"; WARNED=$((WARNED + 1)); }

echo "═══════════════════════════════════════"
echo "  DuoCode Quality Metrics Report"
echo "═══════════════════════════════════════"
echo ""

# ── 1. Lighthouse CI 配置 ──
echo "── 1. Lighthouse CI Configuration ──"

if [ -f "$SRC_DIR/.lighthouserc.json" ]; then
  pass "1.1 .lighthouserc.json exists"

  # Check thresholds
  if python3 -c "
import json, sys
cfg = json.load(open('$SRC_DIR/.lighthouserc.json'))
assertions = cfg.get('ci',{}).get('assert',{}).get('assertions',{})
perf = assertions.get('categories:performance', [])
a11y = assertions.get('categories:accessibility', [])
seo = assertions.get('categories:seo', [])
print('perf:', perf)
print('a11y:', a11y)
print('seo:', seo)
# Verify thresholds
if perf and perf[1].get('minScore', 0) >= 0.9: print('PERF_OK')
if a11y and a11y[1].get('minScore', 0) >= 1.0: print('A11Y_OK')
if seo and seo[1].get('minScore', 0) >= 0.95: print('SEO_OK')
" 2>/dev/null | grep -q "PERF_OK"; then
    pass "1.2 Performance threshold >= 0.9"
  else
    fail "1.2 Performance threshold" "< 0.9 or not set"
  fi

  if python3 -c "
import json
cfg = json.load(open('$SRC_DIR/.lighthouserc.json'))
a = cfg.get('ci',{}).get('assert',{}).get('assertions',{})
a11y = a.get('categories:accessibility', [])
if a11y and a11y[1].get('minScore', 0) >= 1.0: print('OK')
" 2>/dev/null | grep -q "OK"; then
    pass "1.3 Accessibility threshold = 1.0"
  else
    fail "1.3 Accessibility threshold" "< 1.0 or not set"
  fi
else
  fail "1.1 .lighthouserc.json" "file missing"
fi
echo ""

# ── 2. 性能预算检查 ──
echo "── 2. Performance Budget (Static Analysis) ──"

SHARED_TPL="$TPL_DIR/_shared"
if [ -d "$SHARED_TPL" ]; then
  # Check next.config exists
  if [ -f "$SHARED_TPL/next.config.js" ] || [ -f "$SHARED_TPL/next.config.mjs" ] || [ -f "$SHARED_TPL/next.config.ts" ]; then
    pass "2.1 next.config exists in _shared template"
  else
    fail "2.1 next.config" "missing in _shared template"
  fi

  # Check tailwind config
  if [ -f "$SHARED_TPL/tailwind.config.ts" ] || [ -f "$SHARED_TPL/tailwind.config.js" ]; then
    pass "2.2 tailwind.config exists"
  else
    fail "2.2 tailwind.config" "missing"
  fi

  # Check package.json has build script
  if [ -f "$SHARED_TPL/package.json" ]; then
    if grep -q '"build"' "$SHARED_TPL/package.json"; then
      pass "2.3 _shared/package.json has build script"
    else
      fail "2.3 _shared/package.json" "no build script"
    fi
  else
    fail "2.3 _shared/package.json" "missing"
  fi
else
  warn "2.0 _shared template" "directory not found"
fi
echo ""

# ── 3. 可访问性基线 ──
echo "── 3. Accessibility Baseline ──"

if [ -d "$SHARED_TPL/src/components" ]; then
  COMP_DIR="$SHARED_TPL/src/components"

  # Check components exist
  REQUIRED_COMPS="Header Footer Hero CTA ContactForm Hours Location Reviews"
  for comp in $REQUIRED_COMPS; do
    if [ -f "$COMP_DIR/$comp.tsx" ]; then
      pass "3.1 Component $comp.tsx exists"
    else
      fail "3.1 Component $comp.tsx" "missing"
    fi
  done

  # Check for alt text patterns in image components
  if grep -rq "alt=" "$COMP_DIR" 2>/dev/null; then
    pass "3.2 alt attributes found in components"
  else
    warn "3.2 alt attributes" "not found in components"
  fi

  # Check for lang attribute in layout
  if find "$SHARED_TPL/src" -name "layout.tsx" -exec grep -l "lang=" {} \; 2>/dev/null | grep -q .; then
    pass "3.3 lang attribute in layout"
  else
    warn "3.3 lang attribute" "not found in layout files"
  fi
else
  warn "3.0 components directory" "not found at $COMP_DIR"
fi
echo ""

# ── 4. SEO 基线 ──
echo "── 4. SEO Baseline ──"

# Check for metadata/head configuration
if find "$SHARED_TPL/src" -name "*.tsx" -exec grep -l "metadata\|<title\|<meta" {} \; 2>/dev/null | grep -q .; then
  pass "4.1 SEO metadata found in templates"
else
  warn "4.1 SEO metadata" "no title/meta tags found"
fi

# Check schema-markup skill available
if [ -f "$SRC_DIR/.claude/skills/layer1-pipeline/quality/schema-markup/SKILL.md" ]; then
  pass "4.2 schema-markup skill available for structured data"
else
  warn "4.2 schema-markup skill" "not found"
fi

# Check SEO skill available
if [ -f "$SRC_DIR/.claude/skills/layer1-pipeline/quality/seo/SKILL.md" ]; then
  pass "4.3 SEO skill available"
else
  fail "4.3 SEO skill" "missing"
fi
echo ""

# ── 5. 性能标准参考 ──
echo "── 5. Performance Standards Reference ──"
echo "  Target thresholds (from web-quality-skills + lighthouse-ci):"
echo "  ┌─────────────────────┬──────────┐"
echo "  │ Core Web Vitals     │ Target   │"
echo "  ├─────────────────────┼──────────┤"
echo "  │ LCP                 │ ≤ 2.5s   │"
echo "  │ INP                 │ ≤ 200ms  │"
echo "  │ CLS                 │ ≤ 0.1    │"
echo "  ├─────────────────────┼──────────┤"
echo "  │ Performance Budget  │          │"
echo "  ├─────────────────────┼──────────┤"
echo "  │ Total page          │ < 1.5 MB │"
echo "  │ JavaScript          │ < 300 KB │"
echo "  │ CSS                 │ < 100 KB │"
echo "  │ Images (above-fold) │ < 500 KB │"
echo "  └─────────────────────┴──────────┘"
echo ""

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED + WARNED))
echo "  Total: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed | ⚠️  $WARNED warnings"
echo "═══════════════════════════════════════"

[ "$FAILED" -gt 0 ] && exit 1
exit 0
