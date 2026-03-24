---
name: toolchain
description: "Reference for browser-use CLI (screenshots, viewport, headless) and Lighthouse (audit thresholds). Auto-loaded during quality gates."
disable-model-invocation: true
---

# Pipeline Tool Reference

## browser-use CLI (Gate 3 Visual QA)

Docs: https://docs.browser-use.com/open-source/browser-use-cli

```bash
# Core commands
browser-use open <url>                     # Open page (headless daemon)
browser-use screenshot <path>              # Capture screenshot
browser-use screenshot <path> --full       # Full page screenshot
browser-use eval "js code"                 # Run JavaScript in page context
browser-use state                          # Get clickable elements with indices
browser-use close                          # Close browser session

# Browser modes
browser-use --headed open <url>            # Visible browser window
browser-use --profile "Default" open <url> # Real Chrome with logins

# Viewport change for mobile screenshots (TESTED & VERIFIED)
# No native viewport command exists — use CDP via Python API:
browser-use python "browser._run(browser._session._cdp_set_viewport(375, 812))"
```

## Lighthouse (Gate 2)
```bash
npx lighthouse <url> --output json --output-path file.json --chrome-flags="--headless"
```

Thresholds: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90, SEO ≥ 95
