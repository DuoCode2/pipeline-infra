#!/bin/bash
set -euo pipefail

# Browser-Use Viewport Eval
# Tests different viewport change approaches to find the most reliable one
# Run: bash tests/browser-use-viewport.sh [url]

URL="${1:-http://localhost:3456/en/}"
SCREENSHOT_DIR="$(mktemp -d)/viewport-eval"
mkdir -p "$SCREENSHOT_DIR"
PASSED=0; FAILED=0

pass() { echo "  ✅ $1"; PASSED=$((PASSED + 1)); }
fail() { echo "  ❌ $1: $2"; FAILED=$((FAILED + 1)); }
info() { echo "  ℹ️  $1"; }

echo "═══════════════════════════════════════"
echo "  Browser-Use Viewport Eval"
echo "  URL: $URL"
echo "  Output: $SCREENSHOT_DIR"
echo "═══════════════════════════════════════"
echo ""

# ── 0. Preflight ──
echo "── 0. Preflight ──"

if ! command -v browser-use &>/dev/null; then
  fail "browser-use CLI" "not installed (pip install browser-use)"
  echo ""
  echo "Install: pip install browser-use"
  echo "Verify:  browser-use doctor"
  exit 1
fi
pass "browser-use CLI installed"

# Check if URL is reachable
if curl -s --max-time 3 "$URL" > /dev/null 2>&1; then
  pass "URL reachable: $URL"
else
  fail "URL unreachable" "$URL — start server first (npx serve out -l 3456)"
  exit 1
fi
echo ""

# ── 1. Open page + desktop screenshot (baseline) ──
echo "── 1. Desktop Screenshot (baseline) ──"

browser-use open "$URL" 2>/dev/null && pass "open URL" || fail "open URL" "browser-use open failed"

DESKTOP_WIDTH=$(browser-use eval "window.innerWidth" 2>/dev/null || echo "FAILED")
info "Desktop viewport width: $DESKTOP_WIDTH"

browser-use screenshot "$SCREENSHOT_DIR/desktop.png" 2>/dev/null \
  && pass "desktop screenshot saved" \
  || fail "desktop screenshot" "browser-use screenshot failed"
echo ""

# ── 2. Test Approach A: eval + page.setViewportSize (Playwright API) ──
echo "── 2. Approach A: eval page.setViewportSize ──"

RESULT_A=$(browser-use eval "
  try {
    await page.setViewportSize({width: 375, height: 812});
    'OK:' + window.innerWidth;
  } catch(e) {
    'ERROR:' + e.message;
  }
" 2>/dev/null || echo "EVAL_FAILED")

if [[ "$RESULT_A" == *"OK:375"* ]]; then
  pass "Approach A works — viewport changed to 375px"
  browser-use screenshot "$SCREENSHOT_DIR/mobile-A.png" 2>/dev/null
  pass "Mobile screenshot (A) saved"
  BEST="A"
elif [[ "$RESULT_A" == *"OK:"* ]]; then
  WIDTH_A=$(echo "$RESULT_A" | grep -oP 'OK:\K\d+')
  fail "Approach A partial" "viewport is ${WIDTH_A}px, expected 375px"
  BEST=""
else
  fail "Approach A" "$RESULT_A"
  BEST=""
fi

# Reset viewport for next test
browser-use eval "await page.setViewportSize({width: 1280, height: 720})" 2>/dev/null || true
echo ""

# ── 3. Test Approach B: eval + window.resizeTo (DOM API) ──
echo "── 3. Approach B: eval window.resizeTo ──"

RESULT_B=$(browser-use eval "
  try {
    window.resizeTo(375, 812);
    'OK:' + window.innerWidth;
  } catch(e) {
    'ERROR:' + e.message;
  }
" 2>/dev/null || echo "EVAL_FAILED")

if [[ "$RESULT_B" == *"OK:375"* ]]; then
  pass "Approach B works — viewport changed to 375px"
  browser-use screenshot "$SCREENSHOT_DIR/mobile-B.png" 2>/dev/null
  pass "Mobile screenshot (B) saved"
  [ -z "${BEST:-}" ] && BEST="B"
else
  WIDTH_B=$(echo "$RESULT_B" | grep -oP 'OK:\K\d+' || echo "unknown")
  fail "Approach B" "viewport is ${WIDTH_B}px (window.resizeTo unreliable in headless)"
fi

# Reset
browser-use eval "window.resizeTo(1280, 720)" 2>/dev/null || true
echo ""

# ── 4. Test Approach C: python + Playwright API ──
echo "── 4. Approach C: python Playwright API ──"

browser-use python --reset 2>/dev/null || true
RESULT_C=$(browser-use python "
try:
    page = browser._page
    await page.set_viewport_size({'width': 375, 'height': 812})
    width = await page.evaluate('window.innerWidth')
    print(f'OK:{width}')
except Exception as e:
    print(f'ERROR:{e}')
" 2>/dev/null || echo "PYTHON_FAILED")

if [[ "$RESULT_C" == *"OK:375"* ]]; then
  pass "Approach C works — viewport changed to 375px via Python"
  browser-use screenshot "$SCREENSHOT_DIR/mobile-C.png" 2>/dev/null
  pass "Mobile screenshot (C) saved"
  [ -z "${BEST:-}" ] && BEST="C"
else
  fail "Approach C" "$RESULT_C"
fi

# Reset
browser-use python "await browser._page.set_viewport_size({'width': 1280, 'height': 720})" 2>/dev/null || true
echo ""

# ── 5. Test Approach D: CDP emulation via eval ──
echo "── 5. Approach D: CDP Device Emulation via eval ──"

RESULT_D=$(browser-use eval "
  try {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 812,
      deviceScaleFactor: 3,
      mobile: true
    });
    'OK:' + window.innerWidth;
  } catch(e) {
    'ERROR:' + e.message;
  }
" 2>/dev/null || echo "EVAL_FAILED")

if [[ "$RESULT_D" == *"OK:375"* ]]; then
  pass "Approach D works — CDP emulation to 375px"
  browser-use screenshot "$SCREENSHOT_DIR/mobile-D.png" 2>/dev/null
  pass "Mobile screenshot (D) saved"
  [ -z "${BEST:-}" ] && BEST="D"
else
  fail "Approach D" "$RESULT_D"
fi
echo ""

# ── 6. Verify screenshot quality ──
echo "── 6. Screenshot Verification ──"

for f in "$SCREENSHOT_DIR"/*.png; do
  if [ -f "$f" ]; then
    SIZE=$(wc -c < "$f" | tr -d ' ')
    NAME=$(basename "$f")
    if [ "$SIZE" -gt 1000 ]; then
      pass "$NAME — ${SIZE} bytes"
    else
      fail "$NAME" "too small (${SIZE} bytes), likely blank"
    fi
  fi
done
echo ""

# ── Cleanup ──
browser-use close 2>/dev/null || true

# ── Summary ──
echo "═══════════════════════════════════════"
TOTAL=$((PASSED + FAILED))
echo "  Results: $TOTAL checks | ✅ $PASSED passed | ❌ $FAILED failed"
echo ""
echo "  Screenshots: $SCREENSHOT_DIR"
echo ""

if [ -n "${BEST:-}" ]; then
  echo "  🏆 Best approach: $BEST"
  case "$BEST" in
    A) echo '  Command: browser-use eval "await page.setViewportSize({width: 375, height: 812})"' ;;
    B) echo '  Command: browser-use eval "window.resizeTo(375, 812)"' ;;
    C) echo '  Command: browser-use python "await browser._page.set_viewport_size({\"width\": 375, \"height\": 812})"' ;;
    D) echo '  Command: browser-use eval "...CDP Emulation..."' ;;
  esac
else
  echo "  ⚠️  No approach worked reliably. Manual testing needed."
  echo "  Try: browser-use --headed open $URL"
  echo "  Then manually resize and screenshot."
fi

echo "═══════════════════════════════════════"
[ "$FAILED" -gt 0 ] && exit 1
exit 0
