# Restaurant Industry Reference

Design guidelines specific to restaurant, cafe, kopitiam, and food establishment landing pages.

---

## Color Strategy

- **Palette mood:** Warm, appetizing, inviting. Think terracotta, warm whites, deep reds, olive greens.
- **Backgrounds:** Cream, beige, warm off-white (`#FAF7F2` range). Never stark white — food looks better on warm backgrounds.
- **Avoid:** Cool blues and purples as primary — they suppress appetite. Exception: seafood restaurants may use muted ocean tones.
- **Dark mode sections:** Use `primaryDark` for a single contrast section (e.g., testimonials or hours block) to break visual monotony.

## Typography

- **Display font:** Playfair Display, DM Serif Display, or Cormorant — elegant serifs that evoke menu boards.
- **Body font:** Merriweather, Source Serif Pro, or Lora for readability with warmth.
- **Menu item names:** H3 size (24–28px), bold. Descriptions in Body size, regular weight.
- **Price in menus:** Right-aligned, same size as item name, tabular numerals for alignment.

## SVG Element Vocabulary

| SVG Element          | Usage Context                    | Style Notes                          |
|----------------------|----------------------------------|--------------------------------------|
| Steam curves         | Above hero food image, dividers  | 2–3 wavy paths, animated optional    |
| Fork-spoon cross     | Section icons, favicon           | Simplified silhouette, not realistic |
| Leaf sprigs          | Menu category dividers, accents  | Single branch, 3–5 leaves            |
| Bowl outline         | Menu section header icon         | Side profile, minimal detail         |
| Wave divider         | Section separators               | Gentle sine wave, 1–2 paths          |
| Plate circle         | Background decorative element    | Thin stroke, partial circle          |
| Chili pepper         | Spice level indicator            | Simple silhouette                    |
| Coffee cup           | For cafe/kopitiam variant        | Side profile with steam              |

## Component Emphasis (Ranked)

1. **Menu** — Most critical. Minimum 6 items with prices in RM format. Group by category (Mains, Sides, Drinks). Each item: name, brief description (1 line), price.
2. **Gallery** — 4–8 photos. Food first, then interior, then exterior. Lazy-loaded, grid layout with one featured large image.
3. **Operating Hours** — Clear table format. Highlight if open now. Include Ramadan/holiday notes if relevant.
4. **Reviews** — 3–5 customer quotes. Star ratings if available. Google Reviews link.
5. **Location** — Google Maps embed. Written address. Parking notes if applicable.
6. **Contact** — WhatsApp primary, phone secondary. No contact form — direct communication for food businesses.

## Section Order Override

```
Hero (food image + tagline + CTA)
  → Menu (categorized, priced)
  → Gallery (food photos grid)
  → Reviews (customer testimonials)
  → Hours + Location (side by side on desktop)
  → Contact (WhatsApp + phone)
  → Footer
```

## Copy Tone

- **Hero headline examples:**
  - EN: "Authentic Penang Laksa, Right Here in KL"
  - MS: "Rasa Kampung, Hati Kota"
  - zh-CN: "正宗槟城叻沙，就在吉隆坡"
  - zh-TW: "正宗檳城叻沙，就在吉隆坡"
- **Menu descriptions:** Short, sensory. "Slow-braised beef rendang with fragrant coconut gravy" not "Beef cooked in spices".
- **Avoid:** "Delicious", "yummy", "mouth-watering" — show don't tell through specific descriptions.

## Malaysia-Specific Notes

- **Halal badge:** If business data indicates halal certification, display JAKIM halal logo prominently in hero or header. Use official JAKIM badge SVG, not a generic halal icon.
- **Pork-free vs. Halal:** These are different. Only show halal badge if certified. "Pork-free" can be stated as text separately.
- **Food naming:** Keep original names — "Char Kuey Teow", "Nasi Lemak", "Roti Canai". Add Chinese translations in zh-CN/zh-TW pages only.
- **Pricing:** All menu prices in RM. No "from" pricing on individual menu items — show actual price. "Market price" acceptable for seafood.
- **Delivery/takeaway:** If available, add a secondary CTA "Order via WhatsApp" or link to GrabFood/foodpanda.
- **Kopitiam variant:** For traditional kopitiams, use more rustic typography and warmer, darker palette. Emphasize heritage and tradition in copy.
