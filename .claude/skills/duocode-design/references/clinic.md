# Clinic Industry Reference

Design guidelines for medical clinics, dental practices, specialist centers, and healthcare facilities.

---

## Color Strategy

- **Palette mood:** Clean, trustworthy, professional. Cool tones that communicate competence and calm.
- **Primary colors:** Cool blues (`#2B6CB0` range), teal greens (`#2C7A7B` range), medical whites.
- **Backgrounds:** Clean white (`#FFFFFF`) or very light blue-grey (`#F7FAFC`). Clinical cleanliness through whitespace.
- **Accent:** Soft green for wellness, warm teal for approachability. Avoid red as primary — associated with emergency/danger.
- **Avoid:** Overly warm palettes, playful colors (unless pediatric clinic), dark/moody themes.
- **Trust section:** Use a subtle light blue or green background section for credentials/certifications to draw attention.

## Typography

- **Display font:** Montserrat, Raleway, or Source Sans Pro — clean, modern sans-serifs that convey professionalism.
- **Body font:** Open Sans, Nunito Sans, or Inter — highly legible at all sizes, neutral and trustworthy.
- **Doctor names:** H3 size, semibold. Credentials on same line or directly below in caption size.
- **Medical terms:** Body size, with layperson explanation in parentheses where appropriate.

## SVG Element Vocabulary

| SVG Element          | Usage Context                    | Style Notes                          |
|----------------------|----------------------------------|--------------------------------------|
| Geometric cross      | Header icon, section markers     | Plus sign, rounded corners, not Red Cross |
| Shield outline       | Trust/certification badges       | Simple shield, checkmark inside      |
| Stethoscope          | Doctor profiles, about section   | Simplified line drawing              |
| Heart pulse line     | Health/cardiology context        | Single ECG wave segment              |
| Tooth outline        | Dental clinic variant            | Simple molar profile                 |
| Clipboard            | Services/specialties icon        | Rectangle with top clip, minimal     |
| Clock                | Operating hours section icon     | Circle with two hands                |
| Location pin         | Address/map section icon         | Teardrop with cross or plus inside   |

## Component Emphasis (Ranked)

1. **Doctor/Staff List** — Most critical. Photo, full name with title (Dr./Prof.), qualifications, specialization, languages spoken. Builds trust immediately.
2. **Specialties/Services** — Clear list of what conditions/services are treated. Group by category if broad practice.
3. **Operating Hours** — Critical for walk-in clinics. Show today's hours prominently. Indicate if appointment required.
4. **Reviews** — 3–5 testimonials emphasizing professionalism and outcomes. Google Reviews link for social proof.
5. **Certifications** — Display MOH registration, specialist certifications, hospital affiliations.
6. **Location + Emergency Info** — Map, address, and emergency contact number clearly visible.

## Section Order Override

```
Hero (clinic exterior/interior + tagline + Book Appointment CTA)
  → Doctor/Staff List (profiles with credentials)
  → Specialties/Services (categorized list)
  → Certifications + Trust Badges (MOH, affiliations)
  → Operating Hours (table format, highlight today)
  → Reviews (patient testimonials)
  → Location + Map (address, parking, landmarks)
  → Contact (phone primary, WhatsApp secondary)
  → Footer
```

## Copy Tone

- **Hero headline examples:**
  - EN: "Trusted Family Healthcare in Subang Jaya"
  - MS: "Penjagaan Kesihatan Keluarga Dipercayai di Subang Jaya"
  - zh-CN: "梳邦再也值得信赖的家庭医疗服务"
  - zh-TW: "梳邦再也值得信賴的家庭醫療服務"
- **Professional but warm:** "Our team of experienced doctors is here to care for you and your family" — not cold, not overly casual.
- **Qualifications in copy:** Mention specific credentials naturally. "Dr. Tan, a KPJ-certified orthopedic specialist with 15 years of experience" builds trust through specificity.
- **Avoid:** Medical jargon without explanation, fear-based messaging, unverified health claims, diagnosis/treatment promises.

## Malaysia-Specific Notes

- **MOH Registration:** All clinics must display Ministry of Health (KKM) registration. Include registration number in footer.
- **Doctor credentials format:** "Dr. [Name], [Degree] ([University]), [Specialist Cert]" — e.g., "Dr. Ahmad bin Ismail, MBBS (UM), MRCP (UK)". Malaysians value credential display.
- **Panel clinic status:** If the clinic is a panel clinic for insurance companies or government (e.g., SOCSO, MySejahtera partner), list panel affiliations prominently.
- **Languages spoken:** Critical in multilingual Malaysia. List each doctor's languages — BM, English, Mandarin, Cantonese, Tamil, etc.
- **Consultation fees:** Display "Consultation from RM35" or similar. Malaysians expect price indication. GP consultation is typically RM30–RM60.
- **Pharmacy:** If the clinic has an in-house pharmacy, mention it — this is a convenience factor.
- **Walk-in vs. appointment:** State clearly. Many Malaysian clinics are walk-in with optional appointments.
- **Emergency note:** If not a 24-hour clinic, clearly state "For emergencies, call 999 or visit the nearest hospital" in the footer.
