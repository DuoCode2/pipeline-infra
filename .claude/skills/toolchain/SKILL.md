---
name: toolchain
description: Quick reference for browser-use CLI and Lighthouse commands used in the pipeline.
disable-model-invocation: true
---

# Pipeline Tool Reference

## browser-use CLI (Gate 3 Visual QA)
```bash
browser-use open <url>                     # Open page (headless daemon)
browser-use screenshot <path>              # Capture screenshot
browser-use eval "js code"                 # Run JavaScript
browser-use --headed open <url>            # Visible browser window
browser-use --profile "Default" open <url> # Real Chrome with logins
```

## Lighthouse (Gate 2)
```bash
npx lighthouse <url> --output json --output-path file.json --chrome-flags="--headless"
```

Thresholds: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90, SEO ≥ 95
