# Generic / Uncategorized Industry Reference

Fallback design guidelines for businesses that do not match any specific industry template (restaurant, beauty, clinic, retail, fitness, service).

---

## When to Use This Reference

Apply this reference when:
- Business category is unknown or ambiguous.
- Business spans multiple categories without a clear primary.
- The industry is niche and not covered by existing references (e.g., pet grooming, photography studio, event planning).

**Important:** If even a partial match exists to a specific industry reference, prefer that reference and supplement with generic rules here. Only use this as the sole reference when no industry match is possible.

---

## Color Strategy

- **Use `brand-colors.json` directly** without industry-specific modifications.
- Apply the standard color mapping from `_foundations.md` — primary to CTAs, primaryDark to header/footer, accent to highlights.
- **Backgrounds:** Default to `surface` from brand-colors.json. If too similar to white, add a subtle warm or cool tint based on brand primary hue.
- **Safe fallback palette:** If brand colors feel incomplete, supplement with neutral greys and the brand primary.

## Typography

- **Display font:** Source Sans Pro, DM Sans, or Libre Franklin — versatile, professional, industry-neutral.
- **Body font:** Inter, Nunito Sans, or Open Sans — universally legible and neutral.
- **No strong personality** in type choices — let the brand colors carry the identity instead.

## SVG Element Vocabulary

Use neutral, modern SVGs that work across any industry:

| SVG Element          | Usage Context                    | Style Notes                          |
|----------------------|----------------------------------|--------------------------------------|
| Geometric shapes     | Background decoration            | Circles, subtle dots, thin lines     |
| Checkmark            | Feature/benefit list icons       | Simple circle + check                |
| Arrow right          | CTA accents, "learn more" links  | Minimal, inline with text            |
| Map pin              | Location section                 | Standard teardrop + dot              |
| Phone                | Contact section                  | Outline, minimal                     |
| Clock                | Hours section                    | Simple circle + hands                |
| Star                 | Reviews section                  | 5-point, for ratings                 |
| Chat bubble          | WhatsApp / contact CTA           | Rounded rectangle, tail bottom-left  |

## Component Emphasis (Ranked)

1. **Feature Grid** — Showcase what makes the business notable. 3–6 features/benefits in a card grid. Icon + heading + 1-line description per card.
2. **Reviews** — 3–5 customer testimonials. If no reviews available, replace with an "About Us" narrative section.
3. **Operating Hours** — Standard table format with days and times.
4. **Location** — Google Maps embed + written address.
5. **CTA / Contact** — WhatsApp primary, phone secondary.
6. **Gallery** — If photos available, 4–6 image grid. Optional for generic.

## Section Order (Default)

```
Hero (business photo + name + tagline + primary CTA)
  → Feature Grid (key selling points)
  → About (brief business story, optional)
  → Reviews (customer testimonials)
  → Hours + Location (side by side on desktop)
  → Contact CTA (WhatsApp + phone)
  → Footer
```

This is the **default section order** that industry-specific references override. If an industry reference does not specify order, fall back to this.

## Copy Tone

- **Neutral professional.** Warm but not industry-specific.
- **Hero headline:** Use business name and location. "{Business Name} — Serving {City} Since {Year}" or "{Business Name} in {Area}".
- **Feature descriptions:** Focus on concrete benefits. "Open 7 days a week" not "Convenient operating hours".
- **CTA:** "Get in Touch" or "WhatsApp Us" — generic but clear.

## Malaysia-Specific Notes

- Apply all Malaysia localization rules from `_foundations.md` (RM formatting, phone format, address format).
- Default WhatsApp CTA with `+60` country code.
- Include Google Maps embed when coordinates are available.
- Footer: business registration number (SSM) if provided in business data.
