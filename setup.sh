#!/bin/bash
set -euo pipefail

# DuoCode Pipeline — Environment Setup
# Run once after cloning: bash setup.sh

echo "╔═══════════════════════════════════════╗"
echo "║  DuoCode Pipeline Setup               ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# ── 1. Node.js dependencies ──
echo "── 1. Installing Node.js dependencies..."
npm install
echo "  ✅ Node.js packages installed"

# ── 2. Python dependencies ──
echo "── 2. Installing Python dependencies..."
pip install browser-use 2>/dev/null || pip3 install browser-use
echo "  ✅ browser-use installed"

# ── 3. Playwright browsers ──
echo "── 3. Installing Playwright browsers..."
playwright install chromium 2>/dev/null || npx playwright install chromium
echo "  ✅ Chromium installed for Playwright"

# ── 4. Verify tools ──
echo "── 4. Verifying tools..."
TOOLS_OK=true

check_tool() {
  if command -v "$1" &>/dev/null; then
    echo "  ✅ $1"
  else
    echo "  ❌ $1 — not found"
    TOOLS_OK=false
  fi
}

check_tool node
check_tool npm
check_tool npx
check_tool gh
check_tool browser-use
check_tool docker

# ── 5. Environment file ──
echo "── 5. Checking .env..."
if [ -f .env ]; then
  echo "  ✅ .env exists"
else
  echo "  ⚠️  .env not found — copying from template"
  cp .env.template .env
  echo "  📝 Fill in your API keys in .env"
fi

# ── 6. Git config ──
echo "── 6. Setting git identity..."
git config user.name "LiuWei"
git config user.email "sunflowers0607@outlook.com"
echo "  ✅ Git identity configured"

# ── 7. Docker (optional) ──
echo "── 7. Docker..."
if command -v docker &>/dev/null; then
  echo "  ✅ Docker available"
  echo "  💡 Run: cd n8n && docker compose up -d"
else
  echo "  ⚠️  Docker not installed — n8n won't be available"
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  Setup complete!                      ║"
echo "║                                       ║"
echo "║  Next steps:                          ║"
echo "║  1. Fill API keys in .env             ║"
echo "║  2. npm test (verify keys)            ║"
echo "║  3. cd n8n && docker compose up -d    ║"
echo "║  4. npm run eval:all (health check)   ║"
echo "╚═══════════════════════════════════════╝"
