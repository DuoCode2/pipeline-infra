# Beauty Industry Reference

Design guidelines for hair salons, beauty parlors, spas, nail studios, and aesthetic centers.

---

## Color Strategy

- **Palette mood:** Soft, luxurious, calming. Muted pastels with metallic accents.
- **Backgrounds:** Soft blush (`#FFF5F5`), warm ivory (`#FFFEF7`), pale lavender (`#F8F5FF`). Light and airy.
- **Accent approach:** Rose gold (`#B76E79`), champagne gold (`#C9A96E`), or soft copper as accent color — maps well to beauty brand expectations.
- **Avoid:** Neon colors, stark black backgrounds (unless explicitly upscale/edgy salon), heavy saturated tones.
- **Dark accent section:** One section with `primaryDark` background for contrast — ideal for the booking CTA section.

## Typography

- **Display font:** Cormorant Garamond, Playfair Display, or Bodoni Moda — elegant, high-contrast serifs.
- **Body font:** Nunito, Quicksand, or DM Sans — soft, rounded sans-serifs that complement elegant headings.
- **Service names:** H3 (24–28px), medium weight. Descriptions in Body, light-to-regular weight.
- **Price display:** Inline after service name or right-aligned in service list. Regular weight, slightly muted color.

## SVG Element Vocabulary

| SVG Element          | Usage Context                    | Style Notes                          |
|----------------------|----------------------------------|--------------------------------------|
| Flower petals        | Section dividers, hero accents   | Abstract, 4–6 petals, single stroke  |
| Mirror frame         | About/story section icon         | Oval outline, ornamental top detail  |
| Sparkle dots         | Background decoration, badges    | 3–4 point star, scattered pattern    |
| Curved lines         | Section separators, flow accents | Gentle S-curves, thin stroke         |
| Scissors             | Hair salon variant icon          | Simple crossed silhouette            |
| Leaf branch          | Spa/wellness variant accent      | Minimal botanical, single sprig      |
| Droplet              | Skincare/facial section icon     | Teardrop shape, filled or outlined   |
| Comb silhouette      | Hair service category icon       | Wide-tooth, simplified profile       |

## Component Emphasis (Ranked)

1. **Services + Pricing** — Most critical. Full service menu with categories (Hair, Nails, Facial, etc.), each with name, brief description, duration, and RM price.
2. **Booking CTA** — Prominent, repeated. Primary action is booking — via WhatsApp, phone, or booking link. Sticky/floating CTA on mobile.
3. **Gallery** — Before/after shots if available. Otherwise, interior ambiance photos, stylist at work. 6–8 images.
4. **Reviews** — 3–5 testimonials, preferably with service mentioned. "My balayage turned out amazing" > "Great service".
5. **Team/Stylists** — Optional but high-value. Photo + name + specialty for each stylist.
6. **Hours + Location** — Standard display. Mention walk-in vs. appointment-only clearly.

## Section Order Override

```
Hero (salon interior/result photo + tagline + Book Now CTA)
  → Services + Pricing (categorized list with prices)
  → Booking CTA (standalone section, contrasting background)
  → Gallery (work showcase grid)
  → Reviews (client testimonials)
  → Team (optional — stylist profiles)
  → Hours + Location (side by side on desktop)
  → Footer
```

## Copy Tone

- **Hero headline examples:**
  - EN: "Your Best Look Starts Here"
  - MS: "Tampil Lebih Yakin, Bermula Di Sini"
  - zh-CN: "焕然一新，从这里开始"
  - zh-TW: "煥然一新，從這裡開始"
- **Service descriptions:** Focus on outcome and experience, not just procedure. "Relax with a 90-minute deep tissue massage that melts tension away" not "90-minute massage service".
- **Avoid:** Over-promising ("Transform your life"), clinical language unless it's an aesthetic clinic, gendered assumptions.

## Malaysia-Specific Notes

- **Muslim-friendly services:** If the salon offers services for hijabi clients (private rooms, female-only staff), highlight this prominently. Use "Muslim-friendly" or "Muslimah-friendly" label.
- **Unisex vs. ladies-only:** State clearly in hero or header. Many Malaysian salons are gender-specific.
- **Service names:** Keep widely-understood English terms — "balayage", "gel manicure", "facial" are universal in Malaysian beauty context. Add BM descriptions where helpful but don't force-translate technical terms.
- **Pricing transparency:** Malaysian consumers expect to see prices before visiting. List all services with prices — no "Price upon consultation" unless genuinely variable (e.g., bridal packages).
- **WhatsApp booking:** This is the dominant booking method for Malaysian beauty businesses. WhatsApp CTA should be the primary booking action, not a web form.
- **Operating hours:** Many Malaysian salons close on Mondays. Highlight the off-day clearly. Include public holiday notes.
