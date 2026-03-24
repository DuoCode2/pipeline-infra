# A11y Writing Checklist (WCAG 2.1 AA)

Rules for all generated DuoCode sites. Lighthouse A11y must score 100.

## Color Contrast
- NEVER use `opacity < 1` on text — use solid colors with lower lightness instead
- Use theme tokens: `theme.onPrimary` for text on primary bg, `theme.onPrimaryDark` for text on dark bg
- Body/title text: 4.5:1 minimum (use `theme.textBody`, `theme.textTitle` on `theme.surface`)
- Large text (≥18pt or bold ≥14pt): 3:1 minimum
- Do not hardcode `color: white` or `text-white` — use `theme.onPrimaryDark` instead

## ARIA
- `aria-label` MUST contain the visible text (WCAG 2.5.3 Label in Name)
- Prefer visible text over aria-label when possible
- Language switcher: use visible text, don't override with aria-label

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
