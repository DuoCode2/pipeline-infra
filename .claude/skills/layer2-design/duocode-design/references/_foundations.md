# Design Foundations

Shared design rules for ALL DuoCode-generated landing pages, regardless of industry.

---

## Anti-AI Aesthetics Rules

Generated pages must not look AI-generated. Follow these rules strictly:

1. **Never use Inter or Roboto as display/heading fonts.** They are acceptable only as body text. Every heading must use a distinctive serif or display typeface.
2. **No purple-to-blue gradient on white backgrounds.** This is the single most recognizable AI-design pattern. Avoid entirely.
3. **No perfectly symmetric grid layouts.** Every page must contain at least one asymmetric element — an off-center heading, a shifted image, an uneven column split (e.g., 5/7 instead of 6/6).
4. **Always source colors from `brand-colors.json`.** Never fall back to generic blue (#007bff) or default Bootstrap palettes. If brand-colors.json is missing, halt and report.
5. **Avoid stock-illustration aesthetic.** SVGs should feel hand-crafted and specific to the business, not like generic SaaS icons.
6. **No centered-everything layouts.** Mix left-aligned, right-aligned, and centered blocks within a single page.
7. **Texture and imperfection.** Introduce subtle background textures, slight border-radius variations, or organic SVG shapes to break machine-perfect uniformity.

---

## Typography Hierarchy

Maximum **2 font families** per page — one display/heading, one body.

| Level   | Size Range  | Weight    | Usage                        |
|---------|-------------|-----------|------------------------------|
| Display | 48–72px     | Bold/800  | Hero headline only           |
| H2      | 32–40px     | SemiBold  | Section headings             |
| H3      | 24–28px     | SemiBold  | Subsection / card titles     |
| Body    | 16–18px     | Regular   | Paragraphs, descriptions     |
| Caption | 12–14px     | Regular   | Labels, metadata, footnotes  |

- Line height: Display 1.1–1.2, Body 1.5–1.6, Caption 1.4.
- Letter spacing: Display -0.02em, Body 0, Caption 0.02em.
- Heading font must differ visually from body font — contrast in serif vs. sans, weight, or style.

---

## Spacing Rhythm

All spacing derives from an **8px base grid**.

| Token            | Value     | Usage                              |
|------------------|-----------|------------------------------------|
| `space-xs`       | 4px       | Icon-to-label gap                  |
| `space-sm`       | 8px       | Tight component internal padding   |
| `space-md`       | 16px      | Default component gap              |
| `space-lg`       | 24px      | Card padding, between components   |
| `space-xl`       | 32px      | Between component groups           |
| `space-2xl`      | 48px      | Minor section padding              |
| `space-section`  | 64–80px   | Between major page sections        |

- Component internal gap: 16–24px.
- Never use arbitrary values outside the 8px grid.
- Vertical rhythm matters more than horizontal — generous section spacing prevents visual fatigue on mobile.

---

## Color Application from brand-colors.json

Map `brand-colors.json` keys to page elements consistently:

| brand-colors.json Key | Application                                      |
|-----------------------|--------------------------------------------------|
| `primary`             | CTA buttons, headings, links, active states      |
| `primaryDark`         | Header background, footer background, overlays   |
| `accent`              | Badges, highlights, secondary buttons, dividers   |
| `surface`             | Page background, card backgrounds                 |
| `surfaceAlt`          | Alternating section backgrounds                   |
| `text`                | Body copy, paragraph text                         |
| `textLight`           | Captions, placeholder text, muted labels          |

**Contrast requirements:**
- Text on surface: minimum WCAG AA 4.5:1 contrast ratio.
- Large text (24px+ or 18px+ bold) on surface: minimum 3:1.
- CTA button text on primary: minimum 4.5:1 — use white or primaryDark.
- Never place accent text on surface without checking contrast first.

---

## SVG Quality Standards

Every SVG element on the page must meet these criteria:

1. **`viewBox` attribute defined** — never use fixed width/height without viewBox.
2. **Maximum 20 `<path>` elements** per SVG. Simpler is better. Complex illustrations degrade performance and look cluttered on mobile.
3. **Mono-tone SVGs use `currentColor`** — inherits from parent CSS color, enabling theme flexibility.
4. **Multi-tone SVGs use brand colors only** — reference primary, accent, or primaryDark. Never hardcode hex values outside brand-colors.json.
5. **Accessibility: include `<title>` element** inside every `<svg>` for screen readers.
6. **No embedded raster images** inside SVGs (`<image>` tag is forbidden).
7. **Optimize before embedding** — remove editor metadata, unnecessary groups, default attributes.

---

## Fluid Typography

Pre-calculated `clamp()` scales for smooth scaling between 320px and 1200px viewports:

```css
--fluid-h1: clamp(2rem, 1rem + 3.6vw, 4rem);
--fluid-h2: clamp(1.75rem, 1rem + 2.3vw, 3rem);
--fluid-h3: clamp(1.5rem, 1rem + 1.4vw, 2.25rem);
--fluid-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
```

Formula: `clamp(min, preferred, max)` where preferred uses `vw` units for viewport-relative scaling.

### WCAG Contrast Quick Reference

| Level | Normal Text (< 18pt) | Large Text (≥ 18pt / ≥ 14pt bold) |
|-------|---------------------|-----------------------------------|
| AA    | 4.5:1               | 3:1                               |
| AAA   | 7:1                 | 4.5:1                             |

---

## Responsive Breakpoints

Mobile-first approach. All styles start at smallest viewport and scale up.

| Breakpoint | Width   | Target Device         | Layout Notes                     |
|------------|---------|-----------------------|----------------------------------|
| Base       | 0px     | Small phones          | Single column, stacked layout    |
| Mobile     | 375px   | Standard phones       | Single column, full-width CTAs   |
| Tablet     | 768px   | iPad / tablets        | 2-column grids, side-by-side     |
| Desktop    | 1024px  | Laptops               | Multi-column, expanded nav       |
| Wide       | 1440px  | Large monitors        | Max content width, centered      |

- Max content width: 1200px, centered with auto margins.
- Images: lazy-loaded, responsive `srcset` if available.
- Touch targets: minimum 44x44px on mobile.
- Navigation: hamburger menu below 768px, horizontal nav at 768px+.

---

## Malaysia Localization

### Language & Direction
- **RTL is not needed.** All 4 supported languages (EN, MS, zh-CN, zh-TW) are LTR.
- Page `lang` attribute must match content language.

### Typography for Malay (MS)
- Malay uses Latin script — standard web fonts work well.
- Malay words tend to be longer than English. Allow text containers to accommodate ~20% more characters.
- Avoid hyphenation — Malay compound words should not break mid-word.

### Typography for Chinese (zh-CN, zh-TW)
- Use Noto Sans SC (Simplified) or Noto Sans TC (Traditional) as CJK fallback.
- Chinese text does not use spaces between words — line breaks can occur between any two characters.
- Minimum body size for Chinese: 16px (14px is too small for complex characters on mobile).
- Punctuation: use fullwidth punctuation marks (，。！？) not halfwidth.

### Currency
- Always use **"RM"** prefix, never "MYR" or "Malaysian Ringgit" inline.
- Format: `RM12.90`, `RM150.00` — no space between RM and number.
- Thousands separator: comma. Example: `RM1,200.00`.

### Phone Numbers
- Format with country code for international: `+60 12-345 6789`.
- Local display: `012-345 6789`.

### Address Format
- Street, City, Postcode, State format.
- Include Google Maps embed or link when coordinates available.
