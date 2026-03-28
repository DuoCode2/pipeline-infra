# Generic Market Rules

> Universal defaults for any region that does not have a dedicated market rules file (e.g., `malaysia-market.md`). When a region-specific file exists, it takes precedence over these rules.

---

## Currency & Pricing

- Use the **local currency symbol**, positioned as locals expect (e.g., `$49.99` for USD, `49,99 EUR` for Europe, `¥5,000` for Japan)
- Format numbers with the local thousands/decimal separator (comma vs period varies by region)
- If the currency is unknown, fall back to the ISO code (e.g., `USD 49.99`)

## Phone Numbers

- Use international format: `+XX XXX XXXX XXXX`
- Include a click-to-call `tel:` link on all phone numbers
- If the business provides a local-format number, display it as-is alongside the international format

## Contact Methods

- Prefer the region's **dominant messaging platform** as the primary contact CTA:
  - WhatsApp for SE Asia, Middle East, Latin America, South Asia, Africa
  - LINE for Japan, Thailand, Taiwan
  - KakaoTalk for South Korea
  - WeChat for China
  - SMS/Phone for US, UK, Australia, Canada
- If the dominant platform is unknown, provide **phone + email** as defaults
- Always include at least two contact methods (messaging + phone, or phone + email)
- See `platforms-by-region.md` for the full reference

## Language

- Default to **English** unless the business name, address, or provided content suggests another language
- If the business operates in a non-English-speaking region, Claude may add the local language as a secondary locale
- Keep proper nouns, brand names, and dish/product names in their original language

## Cultural Sensitivity

- **Religious imagery**: Do not include religious symbols, icons, or imagery unless the business is explicitly religious (e.g., a mosque, temple, church)
- **Food imagery**: Avoid alcohol or pork imagery for businesses in predominantly Muslim regions (MY, ID, AE, SA, PK, BD, etc.) unless the business explicitly serves them
- **Color associations**: Be aware that color meanings vary by culture (e.g., white = mourning in some East Asian cultures, red = luck in Chinese culture, green = Islam in many Muslim-majority regions)
- **Gender norms**: Respect local customs around gender representation in imagery and copy
- When in doubt, keep imagery and language **neutral and inclusive**

## Business Hours

- Use **24-hour format** (e.g., `09:00 - 21:00`) for: most of Europe, Asia, Latin America, Middle East, Africa
- Use **12-hour format** (e.g., `9:00 AM - 9:00 PM`) for: US, UK, Canada, Australia, Philippines
- If unsure, use 24-hour format as the safer default
- Always show the day range (e.g., `Mon - Fri: 09:00 - 18:00`)
- Note holidays or seasonal hours where applicable

## Reviews & Social Proof

- **Always show Google rating** if available (star rating + review count)
- Supplement with regional review platforms where relevant (see `platforms-by-region.md`)
- Display testimonials with attribution (name, context) when provided
- Never fabricate reviews or ratings

## Maps & Location

- **Google Maps** is the universal default for embedded maps and direction links
- In South Korea, use Kakao Map or Naver Map (Google Maps has limited data there)
- In China, use Baidu Maps or Amap (Google Maps is blocked)
- Always include a "Get Directions" link alongside the embedded map
- Show parking information and public transport options when available

## Legal & Compliance

- Include a **privacy policy link placeholder** in the footer (e.g., "Privacy Policy" linking to `#privacy`)
- For **EU regions** (and UK): include a cookie consent notice placeholder
- For **US (California)**: note CCPA compliance placeholder
- Include business registration number display if provided in the data
- These are placeholders -- the business owner fills in the real policy content later

## Accessibility

- **WCAG 2.1 AA minimum** -- this is enforced by the Lighthouse quality gate
- Color contrast ratio: at least 4.5:1 for normal text, 3:1 for large text
- All images must have descriptive `alt` text
- Interactive elements: minimum touch target of 44x44px
- Keyboard navigation must work for all interactive features
- See `a11y-checklist.md` for the full checklist

## Design Defaults

- **Mobile-first**: design for mobile, then scale up to desktop
- **Font loading**: use `font-display: swap` to prevent invisible text during load
- **Image optimization**: use responsive `<picture>` elements with `srcset` for all images
- **Performance**: aim for < 100KB first load (HTML + critical CSS + JS), lazy-load below-the-fold images
