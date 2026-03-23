#!/bin/bash
set -uo pipefail

# DuoCode — Full Evaluation Suite
# Runs all eval scripts and generates summary report

EVAL_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="$EVAL_DIR/results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT="$RESULTS_DIR/report-$TIMESTAMP.json"

mkdir -p "$RESULTS_DIR"

echo "╔═══════════════════════════════════════╗"
echo "║  DuoCode Full Evaluation Suite        ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')                   ║"
echo "╚═══════════════════════════════════════╝"
echo ""

TOTAL_PASS=0; TOTAL_FAIL=0; TOTAL_WARN=0

run_eval() {
  local name="$1"
  local script="$2"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Running: $name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  local output
  local exit_code
  output=$(bash "$script" 2>&1) || exit_code=$?
  exit_code=${exit_code:-0}

  echo "$output"
  echo ""

  # Count results from output
  local p=$(echo "$output" | grep -c "✅" || true)
  local f=$(echo "$output" | grep -c "❌" || true)
  local w=$(echo "$output" | grep -c "⚠️" || true)

  TOTAL_PASS=$((TOTAL_PASS + p))
  TOTAL_FAIL=$((TOTAL_FAIL + f))
  TOTAL_WARN=$((TOTAL_WARN + w))

  echo "{\"name\":\"$name\",\"passed\":$p,\"failed\":$f,\"warned\":$w,\"exit_code\":$exit_code}"
}

# Run evaluations
RESULTS=()
RESULTS+=("$(run_eval "Skill Validation" "$EVAL_DIR/validate-skills.sh")")
RESULTS+=("$(run_eval "Quality Metrics" "$EVAL_DIR/quality-metrics.sh")")
RESULTS+=("$(run_eval "Template Completeness" "$EVAL_DIR/validate-templates.sh")")

# TypeScript compile check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Running: TypeScript Compile Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SRC_DIR="$(cd "$EVAL_DIR/.." && pwd)"
if cd "$SRC_DIR" && npx tsc --noEmit 2>&1; then
  echo "  ✅ TypeScript compilation: zero errors"
  ((TOTAL_PASS++))
  TS_STATUS="PASS"
else
  echo "  ❌ TypeScript compilation: errors found"
  ((TOTAL_FAIL++))
  TS_STATUS="FAIL"
fi
echo ""

# Generate JSON report
TOTAL=$((TOTAL_PASS + TOTAL_FAIL + TOTAL_WARN))
cat > "$REPORT" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total_checks": $TOTAL,
    "passed": $TOTAL_PASS,
    "failed": $TOTAL_FAIL,
    "warnings": $TOTAL_WARN,
    "typescript": "$TS_STATUS",
    "health_score": $(python3 -c "print(round($TOTAL_PASS / max($TOTAL, 1) * 100, 1))" 2>/dev/null || echo "0")
  }
}
EOF

# Final summary
echo "╔═══════════════════════════════════════╗"
echo "║        EVALUATION SUMMARY             ║"
echo "╠═══════════════════════════════════════╣"
printf "║  ✅ Passed:   %-23s ║\n" "$TOTAL_PASS"
printf "║  ❌ Failed:   %-23s ║\n" "$TOTAL_FAIL"
printf "║  ⚠️  Warnings: %-23s ║\n" "$TOTAL_WARN"
HEALTH=$(python3 -c "print(round($TOTAL_PASS / max($TOTAL, 1) * 100, 1))" 2>/dev/null || echo "0")
printf "║  📊 Health:   %-22s ║\n" "${HEALTH}%"
echo "╠═══════════════════════════════════════╣"
echo "║  Report: eval/results/report-$TIMESTAMP.json"
echo "╚═══════════════════════════════════════╝"

[ "$TOTAL_FAIL" -gt 0 ] && exit 1
exit 0
