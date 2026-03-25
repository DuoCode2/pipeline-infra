# A11y Writing Checklist (WCAG 2.1 AA)

Rules for all generated DuoCode sites. Lighthouse A11y must score 100.

## Color Contrast
- NEVER use `opacity < 1` on text — use solid colors with lower lightness instead
- **BANNED Tailwind classes on text**: `text-white/60`, `text-white/50`, `text-white/40`, any `/` opacity below `/80`
- Use theme tokens: `theme.onPrimary` for text on primary bg, `theme.onPrimaryDark` for text on dark bg
- **`theme.primary` is for backgrounds and decoration ONLY** — never use as text color (many primaries like olive green #696c00, amber #995b00 fail 4.5:1 on white). Use `theme.textTitle` or `theme.accentText` for colored text.
- Body/title text: 4.5:1 minimum (use `theme.textBody`, `theme.textTitle` on `theme.surface`)
- Large text (≥18pt or bold ≥14pt): 3:1 minimum
- Do not hardcode `color: white` or `text-white` — use `theme.onPrimaryDark` instead
- **`theme.onPrimaryDark` can be dark** (e.g. #070707 when primaryDark is a light color like olive green). Always use the token — never assume white.

## ARIA
- `aria-label` MUST contain the visible text (WCAG 2.5.3 Label in Name)
- Prefer visible text over aria-label when possible
- Language switcher: use visible text, don't override with aria-label
- **`aria-label` is PROHIBITED on `<div>` and `<span>`** without an explicit role. For star ratings / icons: use `<span role="img" aria-label="...">` not `<div aria-label="...">`
- `aria-hidden="true"` elements must not contain focusable children

## Headings
- Sequential order: h1 → h2 → h3 (never skip levels)
- One h1 per page only

## Interactive Elements
- Touch targets ≥ 44x44px
- All interactive elements keyboard-accessible
- Visible focus indicators (never `outline: none`)

## Images
- All `<img>` must have `alt`
- Decorative images: `alt=""` + `aria-hidden="true"`
