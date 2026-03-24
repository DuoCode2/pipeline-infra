# Retail Industry Reference

Design guidelines for retail shops, boutiques, convenience stores, specialty stores, and merchandise businesses.

---

## Color Strategy

- **Palette mood:** Bold, energetic, brand-forward. Retail pages should feel vibrant and shoppable.
- **Primary approach:** Use the brand's actual colors from `brand-colors.json` aggressively — retail is where brand identity matters most.
- **Backgrounds:** Clean white or very light neutral for product visibility. Alternating sections with `surfaceAlt` for rhythm.
- **Accent usage:** Bold contrast for sale/promo badges, price callouts, and "New" labels.
- **Avoid:** Muted, washed-out palettes — retail needs energy. Exception: luxury/boutique retail may use restrained palettes.
- **Sale/promo sections:** Red or brand-accent background with white text for urgency. Use sparingly — one section max.

## Typography

- **Display font:** Poppins, Space Grotesk, or Plus Jakarta Sans — modern geometric sans-serifs with personality.
- **Body font:** Inter, DM Sans, or Nunito Sans — clean and legible for product descriptions.
- **Product names:** H3 (24–28px), semibold. Prices at same level, bold, brand primary color.
- **Category labels:** Caption size (12–14px), uppercase, letter-spaced. Acts as wayfinding.

## SVG Element Vocabulary

| SVG Element          | Usage Context                    | Style Notes                          |
|----------------------|----------------------------------|--------------------------------------|
| Shopping bag         | Hero icon, CTA accent            | Outline style, handle detail         |
| Price tag            | Sale/promo badges, labels        | Rectangle with notch, string detail  |
| Arrow accents        | "Shop now" CTAs, navigation cues | Diagonal or right-pointing, bold     |
| Grid pattern         | Background decoration            | Subtle, dotted or thin-line grid     |
| Star / burst         | "New" or "Featured" badges       | 4–6 point star, filled accent color  |
| Box / package        | Delivery/shipping section icon   | Simple cube outline                  |
| Percentage sign      | Discount callouts                | Bold, inside circle or badge shape   |
| Map pin              | Store locator section icon       | Teardrop with dot                    |

## Component Emphasis (Ranked)

1. **Product Highlights** — Most critical. 4–8 featured products with photo, name, price, and brief description. Grid layout, 2 columns on mobile, 3–4 on desktop.
2. **Categories** — Visual navigation to product types. Icon or image + category name. Horizontal scroll on mobile, grid on desktop.
3. **Promotions / Current Offers** — Active sales, bundle deals, seasonal offers. Eye-catching section with countdown timer if applicable.
4. **Location + Store Info** — Physical store address, photos, parking info. Essential for brick-and-mortar retail.
5. **About / Brand Story** — Brief brand narrative. Why this store exists, what makes it different.
6. **Contact / WhatsApp** — Product inquiries via WhatsApp. "Ask about availability" CTA.

## Section Order Override

```
Hero (store photo or product hero + brand tagline + Shop Now CTA)
  → Product Highlights (featured items grid with prices)
  → Categories (visual category navigation)
  → Promotions (current offers, sales)
  → About / Brand Story (brief narrative)
  → Location + Store Photos (map, interior shots)
  → Contact (WhatsApp for inquiries)
  → Footer
```

## Copy Tone

- **Hero headline examples:**
  - EN: "Fresh Styles, Every Week" or "Your One-Stop Shop in Setia Alam"
  - MS: "Gaya Terkini, Setiap Minggu"
  - zh-CN: "每周新品，时尚不停"
  - zh-TW: "每週新品，時尚不停"
- **Product descriptions:** Brief, benefit-focused. "Lightweight cotton tee, perfect for KL heat" not "Cotton t-shirt available in multiple sizes".
- **Promo copy:** Urgency without desperation. "This weekend only: 20% off all accessories" not "HURRY!!! DON'T MISS OUT!!!".
- **Avoid:** ALL CAPS for entire sentences, excessive exclamation marks, "cheap" (use "affordable" or "value").

## Malaysia-Specific Notes

- **Shopee/Lazada links:** If the business also sells online via Malaysian marketplaces, include "Also available on Shopee" with a link. Many Malaysian retailers operate both physical and e-commerce.
- **WhatsApp catalogue:** Many small Malaysian retailers run via WhatsApp. If no e-commerce site, the CTA should be "Browse on WhatsApp" or "WhatsApp to Order".
- **Pricing display:** RM format, always visible. Malaysian consumers compare prices before visiting — transparency builds trust.
- **Operating hours:** Include public holiday schedule. Malaysian retail often has extended hours during Hari Raya, CNY, and Deepavali seasons.
- **Payment methods:** Mention accepted payments if notable — "DuitNow QR accepted", "Cash & card welcome". E-wallet adoption is high in Malaysia.
- **Parking info:** Critical for Malaysian retail. Mention if free parking is available, or note nearby parking options.
- **SST note:** Prices should be inclusive of SST (Sales and Services Tax). Note "All prices inclusive of SST" in footer if applicable.
