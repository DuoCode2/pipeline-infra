export const locales = ['en', 'ms', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export interface BusinessContent {
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
