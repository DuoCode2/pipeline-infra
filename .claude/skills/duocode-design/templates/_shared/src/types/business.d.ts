// Locales are rewritten by scaffold.ts during prepare.
// Default: EN only. translate.ts adds target locales after design.
// DO NOT manually add locales — they are managed by the pipeline.
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

// ── Shared sub-types ────────────────────────────────────────────

interface SectionGroup {
  category: string;
  items: Array<{
    name: string;
    description?: string;
    price?: string;
    image?: string;
    tags?: string[];
    popular?: boolean;
  }>;
}

interface StaffMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  specialties?: string[];
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
}

// ── BusinessContent ─────────────────────────────────────────────

export interface BusinessContent {
  // --- Core (all archetypes) ---
  meta: { title: string; description: string; ogImage?: string };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    image?: string;
    badge?: string;
  };
  hours: Record<string, string>;
  location: {
    address: string;
    mapsUrl: string;
    coordinates?: { lat: number; lng: number };
  };
  contact: { phone: string; email?: string; whatsapp?: string };
  reviews: {
    rating: number;
    count: number;
    featured: Array<{ author: string; text: string; rating: number }>;
  };
  trustBar?: {
    items: Array<{ icon: string; label: string; value: string }>;
  };

  // --- MENU + ORDER archetype ---
  menu?: { categories: SectionGroup[] };
  ordering?: {
    delivery?: string;
    pickup?: string;
    platforms?: Array<{ name: string; url: string }>;
  };
  reservations?: { url?: string; phone?: string; note?: string };

  // --- BOOKING + SERVICES archetype ---
  services?: SectionGroup[];
  staff?: StaffMember[];
  beforeAfter?: Array<{ before: string; after: string; caption?: string }>;

  // --- LEAD GENERATION + TRUST archetype ---
  credentials?: Array<{ label: string; value: string; icon?: string }>;
  serviceAreas?: { areas: string[]; mapNote?: string };
  caseStudies?: Array<{ title: string; summary: string; result?: string; image?: string }>;
  faq?: Array<{ question: string; answer: string }>;

  // --- E-COMMERCE + CATALOG archetype ---
  products?: { categories: SectionGroup[] };

  // --- PORTFOLIO + GALLERY archetype ---
  portfolio?: { categories: Array<{ name: string; images: Array<{ src: string; caption?: string }> }> };
  packages?: PricingTier[];

  // --- MEMBERSHIP + SCHEDULE archetype ---
  classes?: Array<{ name: string; day: string; time: string; instructor?: string; level?: string }>;
  memberships?: PricingTier[];
  trainers?: StaffMember[];

  // --- PROPERTY + LISTING archetype ---
  listings?: Array<{ title: string; price: string; image?: string; features?: string[]; url?: string }>;

  // --- COMMUNITY + INFORMATION archetype ---
  events?: Array<{ title: string; date: string; time?: string; description?: string; location?: string }>;
  programs?: Array<{ name: string; description: string; schedule?: string }>;
  donations?: { url?: string; note?: string; tiers?: Array<{ amount: string; label: string }> };
  announcements?: Array<{ title: string; date: string; content: string }>;

  // Generic section headings
  sectionHeadings?: Record<string, string>;

  // Escape hatch for custom sections
  [key: string]: any;
}

export interface BusinessData {
  schemaOrgType: string;
  siteUrl?: string;
  /**
   * Theme is FLAT — colors and fonts at the same level.
   * CORRECT: business.theme.primary
   * WRONG:   business.theme.colors.primary (DO NOT nest!)
   */
  theme: {
    primary: string;
    primaryDark: string;
    accent: string;
    surface: string;
    textTitle: string;
    textBody: string;
    // WCAG-safe text colors for colored backgrounds (auto-generated)
    onPrimary: string;      // text on primary background (≥4.5:1)
    onPrimaryDark: string;  // text on primaryDark background (≥4.5:1)
    accentText: string;     // accent for text on surface (≥4.5:1)
    fontDisplay: string;
    fontBody: string;
  };
  assets: {
    heroImage: string;
    galleryImages: string[];
    logo?: string;
  };
  content: Record<Locale, BusinessContent>;
}
