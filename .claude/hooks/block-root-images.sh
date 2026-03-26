#!/bin/bash
# PreToolUse hook: block writing images/screenshots to project root or wrong directories.
# Images must go to output/{slug}/screenshots/ or output/{slug}/public/images/
# Stdin receives JSON with tool_input containing file_path.

input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"/\1/')

# Only check image files
case "$file_path" in
  *.png|*.jpg|*.jpeg|*.webp|*.avif|*.gif|*.svg)
    # Allowed directories
    case "$file_path" in
      */output/*/screenshots/*) exit 0 ;;
      */output/*/public/images/*) exit 0 ;;
      */output/*/public/svgs/*) exit 0 ;;
      */output/*/public/*) exit 0 ;;
      */tests/screenshots/*) exit 0 ;;
      */docs/*) exit 0 ;;
      *)
        echo "BLOCKED: Image files must go to output/{slug}/screenshots/ or output/{slug}/public/images/, not: $file_path" >&2
        echo "Move it to the correct location." >&2
        exit 2
        ;;
    esac
    ;;
esac

exit 0
