export type Archetype =
  | 'menu-order'
  | 'booking-services'
  | 'lead-trust'
  | 'ecommerce-catalog'
  | 'portfolio-gallery'
  | 'membership-schedule'
  | 'property-listing'
  | 'community-info';

export interface SiteRegion {
  country: string;
  locales: string[];
  defaultLocale: string;
  currency: { symbol: string; code: string };
  phone: { countryCode: string };
  cultural?: {
    halalBadge?: boolean;
    prayerRoom?: boolean;
    festiveNotes?: string[];
  };
}

export interface SiteTheme {
  primary: string;
  primaryDark: string;
  accent: string;
  surface: string;
  textTitle: string;
  textBody: string;
  onPrimary: string;
  onPrimaryDark: string;
  accentText: string;
  fontDisplay: string;
  fontBody: string;
}

export interface SiteAssets {
  heroImage: string;
  galleryImages: string[];
  logo?: string;
}

export interface SiteLead {
  placeId: string;
  primaryType?: string;
  googleMapsUri?: string;
  rating: number;
  reviewCount: number;
  discoveredAt: string;
}

// --- Content sections (per locale) ---

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

export interface BusinessContent {
  meta: { title: string; description: string; ogImage?: string };
  hero: { title: string; subtitle: string; cta: string; image?: string; badge?: string };
  hours: Record<string, string>;
  location: { address: string; mapsUrl: string; coordinates?: { lat: number; lng: number } };
  contact: { phone: string; email?: string; whatsapp?: string };
  reviews: { rating: number; count: number; featured: Array<{ author: string; text: string; rating: number }> };
  trustBar?: { items: Array<{ icon: string; label: string; value: string }> };
  // Archetype-specific
  menu?: { categories: SectionGroup[] };
  ordering?: { delivery?: string; pickup?: string; platforms?: Array<{ name: string; url: string }> };
  reservations?: { url?: string; phone?: string; note?: string };
  services?: SectionGroup[];
  staff?: StaffMember[];
  beforeAfter?: Array<{ before: string; after: string; caption?: string }>;
  credentials?: Array<{ label: string; value: string; icon?: string }>;
  serviceAreas?: { areas: string[]; mapNote?: string };
  caseStudies?: Array<{ title: string; summary: string; result?: string; image?: string }>;
  faq?: Array<{ question: string; answer: string }>;
  products?: { categories: SectionGroup[] };
  portfolio?: { categories: Array<{ name: string; images: Array<{ src: string; caption?: string }> }> };
  packages?: PricingTier[];
  classes?: Array<{ name: string; day: string; time: string; instructor?: string; level?: string }>;
  memberships?: PricingTier[];
  trainers?: StaffMember[];
  listings?: Array<{ title: string; price: string; image?: string; features?: string[]; url?: string }>;
  events?: Array<{ title: string; date: string; time?: string; description?: string; location?: string }>;
  programs?: Array<{ name: string; description: string; schedule?: string }>;
  donations?: { url?: string; note?: string; tiers?: Array<{ amount: string; label: string }> };
  announcements?: Array<{ title: string; date: string; content: string }>;
  sectionHeadings?: Record<string, string>;
  [key: string]: any;
}

export interface SiteData {
  slug: string;
  businessName: string;
  archetype: Archetype;
  industry: string;
  region: SiteRegion;
  theme: SiteTheme;
  assets: SiteAssets;
  content: Record<string, BusinessContent>;
  lead: SiteLead;
}
