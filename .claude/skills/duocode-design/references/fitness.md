# Fitness Industry Reference

Design guidelines for gyms, fitness centers, martial arts studios, yoga studios, and sports facilities.

---

## Color Strategy

- **Palette mood:** Bold, energetic, powerful. High contrast that communicates strength and motivation.
- **Primary approach:** Dark backgrounds (`#1A1A2E`, `#0F0F0F`, deep navy) with vibrant accent pops. Fitness is one of the few industries where dark backgrounds work well.
- **Accent colors:** Electric orange, neon green, bright red, vivid yellow — energetic colors that pop against dark backgrounds.
- **Light variant:** For yoga/pilates studios, flip to light backgrounds with earthy, calming tones (sage green, warm clay, soft sand).
- **Avoid:** Pastels (unless yoga/wellness), muted palettes, corporate blues.
- **CTA color:** Accent color at maximum saturation — CTAs must be impossible to miss.

## Typography

- **Display font:** Oswald, Bebas Neue, or Anton — condensed, bold, impactful. Uppercase for hero headlines.
- **Body font:** Roboto, Inter, or Barlow — clean and functional. Good readability on dark backgrounds.
- **Class names:** H3 (24–28px), bold, uppercase. Time/duration in caption size alongside.
- **Membership prices:** Large display size (40–48px) for the number, with period/frequency in body size.
- **Yoga/pilates variant:** Use softer display fonts — Cormorant, Libre Baskerville. Sentence case, not uppercase.

## SVG Element Vocabulary

| SVG Element          | Usage Context                    | Style Notes                           |
|----------------------|----------------------------------|---------------------------------------|
| Dumbbell             | Section icons, membership badges | Simplified side profile, bold stroke  |
| Running figure       | Cardio/classes section icon      | Dynamic pose, minimal detail          |
| Lightning bolt       | Energy/intensity indicators      | Angular, not rounded                  |
| Geometric shapes     | Background patterns, dividers    | Triangles, hexagons, angular motifs   |
| Heartbeat line       | Fitness tracking, health section | Stylized ECG with sharp peaks         |
| Timer/stopwatch      | Class schedule icon, HIIT badge  | Circle with single hand               |
| Flame                | Calorie/intensity indicator      | Simple 2-path silhouette              |
| Mountain peak        | Achievement/goal section icon    | Angular triangle with flag            |

## Component Emphasis (Ranked)

1. **Class Schedule** — Most critical. Full weekly timetable with class name, time, duration, trainer, and difficulty level. Filterable by day on mobile.
2. **Membership Plans** — Clear pricing cards. 2–3 tiers max. Monthly and annual options. Highlight best-value plan.
3. **Trainer Profiles** — Photo, name, certifications, specialties. Builds trust and personal connection.
4. **Reviews / Transformations** — Member testimonials, before/after if available (with consent). Progress stories.
5. **Facilities** — Photo gallery of equipment, studio spaces, amenities (showers, lockers, parking).
6. **Free Trial CTA** — If offered, this should be prominent — secondary CTA throughout the page.

## Section Order Override

```
Hero (action shot + motivational headline + Join Now CTA)
  → Class Schedule (weekly timetable)
  → Membership Plans (pricing cards)
  → Trainer Profiles (team grid)
  → Reviews / Transformations (member stories)
  → Facilities Gallery (equipment, spaces, amenities)
  → Free Trial / Contact CTA (standalone section)
  → Location + Hours (map, parking info)
  → Footer
```

## Copy Tone

- **Hero headline examples:**
  - EN: "Stronger Starts Here" or "Your Fitness Journey Begins in PJ"
  - MS: "Lebih Kuat Bermula Di Sini"
  - zh-CN: "更强大，从这里开始"
  - zh-TW: "更強大，從這裡開始"
- **Motivational but grounded:** "Build strength, build confidence" — not "BECOME A BEAST!! CRUSH YOUR GOALS!!!"
- **Class descriptions:** Focus on what the participant will experience and achieve. "A 45-minute high-energy session that burns 500+ calories" not "HIIT class available".
- **Avoid:** Toxic fitness culture language, body shaming, unrealistic promises ("Get a six-pack in 2 weeks"), excessive use of "HARDCORE" and "EXTREME".

## Malaysia-Specific Notes

- **Prayer time accommodation:** Many Malaysian gyms adjust schedules around prayer times, especially Friday prayers (solat Jumaat). If applicable, note "Adjusted schedule during Friday prayers" in the timetable.
- **Gender-segregated facilities:** If the gym offers ladies-only hours, sections, or is a women-only facility, state this prominently. "Muslimah-friendly gym" is a recognized term.
- **Mixed martial arts / Muay Thai:** Very popular in Malaysia. If offered, highlight as a distinct category with its own section.
- **Pricing format:** Monthly membership in RM. Show "RM149/month" format. If registration fee exists, state it clearly — Malaysian consumers dislike hidden fees.
- **Air conditioning:** Worth mentioning in tropical Malaysia. "Fully air-conditioned facility" is a selling point.
- **Parking:** Always mention. "Free parking for members" or "Located in [Mall Name] with ample parking".
- **Operating hours:** Early morning (6am) to late night (11pm) is common. Highlight extended hours as a feature.
- **Corporate packages:** Many Malaysian fitness centers offer corporate rates. Mention "Corporate packages available" if applicable.
