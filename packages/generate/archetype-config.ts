export type Archetype =
  | 'menu-order'
  | 'booking-services'
  | 'lead-trust'
  | 'ecommerce-catalog'
  | 'portfolio-gallery'
  | 'membership-schedule'
  | 'property-listing'
  | 'community-info';

export interface ArchetypeConfig {
  archetype: Archetype;
  label: string;
  description: string;
  primaryCTA: {
    action: string;
    localized: Record<string, string>;  // locale -> CTA text
  };
  sections: {
    required: string[];
    recommended: string[];
    optional: string[];
  };
  conversionElements: string[];
  designGuidance: string;
  externalIntegrations: string[];
  demoFeatures: string[];  // Features to build as interactive frontend demos
}

export interface ArchetypeMapping {
  primary: Archetype;
  secondary?: Archetype;
}

export const INDUSTRY_TO_ARCHETYPE: Record<string, ArchetypeMapping> = {
  food:        { primary: 'menu-order' },
  beauty:      { primary: 'booking-services', secondary: 'portfolio-gallery' },
  clinic:      { primary: 'booking-services', secondary: 'lead-trust' },
  retail:      { primary: 'ecommerce-catalog', secondary: 'lead-trust' },
  fitness:     { primary: 'membership-schedule', secondary: 'booking-services' },
  service:     { primary: 'lead-trust' },
  automotive:  { primary: 'lead-trust', secondary: 'booking-services' },
  tech:        { primary: 'lead-trust', secondary: 'booking-services' },
  education:   { primary: 'booking-services', secondary: 'lead-trust' },
  pet:         { primary: 'booking-services', secondary: 'ecommerce-catalog' },
  events:      { primary: 'portfolio-gallery', secondary: 'booking-services' },
  hospitality: { primary: 'property-listing' },
  realestate:  { primary: 'property-listing' },
  community:   { primary: 'community-info' },
  generic:     { primary: 'lead-trust' },
};

export function resolveArchetype(industry: string): ArchetypeMapping {
  return INDUSTRY_TO_ARCHETYPE[industry] || INDUSTRY_TO_ARCHETYPE.generic;
}

export const ARCHETYPE_CONFIGS: Record<Archetype, ArchetypeConfig> = {
  'menu-order': {
    archetype: 'menu-order',
    label: 'Menu + Order',
    description: 'Optimized for food & beverage businesses that need to showcase their menu and drive orders or reservations.',
    primaryCTA: {
      action: 'View Menu',
      localized: {
        en: 'View Menu',
        ms: 'Lihat Menu',
        'zh-CN': '\u67e5\u770b\u83dc\u5355',
        'zh-TW': '\u67e5\u770b\u83dc\u55ae',
      },
    },
    sections: {
      required: ['hero', 'menu', 'hours', 'location', 'contact', 'reviews'],
      recommended: ['ordering', 'reservations', 'gallery', 'trustBar'],
      optional: ['promotions', 'about', 'faq'],
    },
    conversionElements: [
      'Menu with visible prices',
      'Order/Reserve CTA in sticky header',
      'WhatsApp ordering',
      'Operating hours',
      'Food photography',
    ],
    designGuidance:
      'Food photography is the star. Full-bleed hero with food imagery. Menu should be browsable with categories. Photos next to items. Ordering CTA links to WhatsApp or third-party delivery.',
    externalIntegrations: ['whatsapp-order', 'grabfood', 'foodpanda', 'google-maps'],
    demoFeatures: [
      'Interactive menu browser with categories and item details',
      'Add-to-cart prototype (shows confirmation)',
      'Table reservation date picker',
    ],
  },

  'booking-services': {
    archetype: 'booking-services',
    label: 'Booking + Services',
    description: 'Designed for service businesses that need appointment booking and service catalog display.',
    primaryCTA: {
      action: 'Book Now',
      localized: {
        en: 'Book Now',
        ms: 'Tempah Sekarang',
        'zh-CN': '\u7acb\u5373\u9884\u7ea6',
        'zh-TW': '\u7acb\u5373\u9810\u7d04',
      },
    },
    sections: {
      required: ['hero', 'services', 'hours', 'location', 'contact', 'reviews'],
      recommended: ['staff', 'gallery', 'beforeAfter', 'trustBar', 'faq'],
      optional: ['promotions', 'about', 'packages'],
    },
    conversionElements: [
      'Service catalog with prices/durations',
      'Booking CTA on every section',
      'Staff profiles',
      'Before/after gallery',
    ],
    designGuidance:
      'Clean and professional. Services are centerpiece with clear pricing. Staff profiles humanize. For beauty: elegant. For clinic: calming trust signals.',
    externalIntegrations: ['whatsapp-booking', 'google-calendar', 'google-maps'],
    demoFeatures: [
      'Service browser with duration/price',
      'Date/time picker for booking (shows confirmation)',
      'Staff profile cards',
    ],
  },

  'lead-trust': {
    archetype: 'lead-trust',
    label: 'Lead Generation + Trust',
    description: 'Built for businesses that rely on trust signals and lead capture to convert visitors into customers.',
    primaryCTA: {
      action: 'Get Quote',
      localized: {
        en: 'Get Quote',
        ms: 'Dapatkan Sebut Harga',
        'zh-CN': '\u83b7\u53d6\u62a5\u4ef7',
        'zh-TW': '\u53d6\u5f97\u5831\u50f9',
      },
    },
    sections: {
      required: ['hero', 'services', 'credentials', 'contact', 'reviews'],
      recommended: ['faq', 'serviceAreas', 'caseStudies', 'trustBar'],
      optional: ['about', 'gallery', 'blog'],
    },
    conversionElements: [
      'Credentials prominent',
      'Years in business',
      'Multiple contact methods',
      'Case studies',
    ],
    designGuidance:
      'Trust-heavy. Credentials above fold. Social proof unmissable. FAQ addresses objections. Contact form is simple.',
    externalIntegrations: ['whatsapp-inquiry', 'google-maps', 'email-form'],
    demoFeatures: [
      'Quick quote request form (shows confirmation)',
      'Service area interactive map',
      'FAQ accordion',
    ],
  },

  'ecommerce-catalog': {
    archetype: 'ecommerce-catalog',
    label: 'E-Commerce + Catalog',
    description: 'Optimized for retail businesses that want to showcase products with pricing and drive purchases.',
    primaryCTA: {
      action: 'Shop Now',
      localized: {
        en: 'Shop Now',
        ms: 'Beli Sekarang',
        'zh-CN': '\u7acb\u5373\u9009\u8d2d',
        'zh-TW': '\u7acb\u5373\u9078\u8cfc',
      },
    },
    sections: {
      required: ['hero', 'products', 'contact', 'reviews'],
      recommended: ['promotions', 'trustBar', 'faq'],
      optional: ['about', 'gallery', 'blog'],
    },
    conversionElements: [
      'Product photography',
      'Transparent pricing',
      'Add to cart',
      'Trust badges',
      'Multiple payment methods',
    ],
    designGuidance:
      'Products front and center. Grid layout with category filters. Each product card shows image, price, name. Shopping cart is interactive demo.',
    externalIntegrations: ['whatsapp-order', 'shopee', 'lazada', 'google-maps'],
    demoFeatures: [
      'Product catalog with category filter',
      'Add-to-cart with quantity selector (demo checkout)',
      'Search/filter products',
    ],
  },

  'portfolio-gallery': {
    archetype: 'portfolio-gallery',
    label: 'Portfolio + Gallery',
    description: 'Visual-first design for creative businesses that need to showcase their work and attract inquiries.',
    primaryCTA: {
      action: 'View Our Work',
      localized: {
        en: 'View Our Work',
        ms: 'Lihat Karya Kami',
        'zh-CN': '\u67e5\u770b\u4f5c\u54c1',
        'zh-TW': '\u67e5\u770b\u4f5c\u54c1',
      },
    },
    sections: {
      required: ['hero', 'portfolio', 'services', 'contact', 'reviews'],
      recommended: ['packages', 'trustBar', 'faq'],
      optional: ['about', 'blog', 'testimonials'],
    },
    conversionElements: [
      'High-quality portfolio gallery',
      'Package pricing',
      'Inquiry form',
    ],
    designGuidance:
      'Visual-first. Gallery is the hero. Let images speak. Packages table for pricing transparency.',
    externalIntegrations: ['whatsapp-inquiry', 'instagram', 'google-maps'],
    demoFeatures: [
      'Gallery with lightbox/modal viewer',
      'Package comparison selector',
      'Inquiry form with event details',
    ],
  },

  'membership-schedule': {
    archetype: 'membership-schedule',
    label: 'Membership + Schedule',
    description: 'Designed for fitness and activity-based businesses with class schedules and membership tiers.',
    primaryCTA: {
      action: 'Start Free Trial',
      localized: {
        en: 'Start Free Trial',
        ms: 'Cuba Percuma',
        'zh-CN': '\u514d\u8d39\u4f53\u9a8c',
        'zh-TW': '\u514d\u8cbb\u9ad4\u9a57',
      },
    },
    sections: {
      required: ['hero', 'classes', 'memberships', 'hours', 'location', 'contact', 'reviews'],
      recommended: ['trainers', 'gallery', 'trustBar'],
      optional: ['about', 'faq', 'blog'],
    },
    conversionElements: [
      'Free trial CTA',
      'Class schedule visible',
      'Membership pricing transparent',
      'Trainer credentials',
    ],
    designGuidance:
      'Energy and lifestyle imagery. Class timetable is key. Membership tiers side-by-side. Free trial is primary conversion.',
    externalIntegrations: ['whatsapp-signup', 'google-calendar', 'google-maps'],
    demoFeatures: [
      'Interactive weekly class timetable',
      'Membership tier comparison',
      'Free trial signup form (shows confirmation)',
    ],
  },

  'property-listing': {
    archetype: 'property-listing',
    label: 'Property + Listing',
    description: 'Search-forward design for property and accommodation businesses with listing browsing and inquiry.',
    primaryCTA: {
      action: 'View Listings',
      localized: {
        en: 'View Listings',
        ms: 'Lihat Senarai',
        'zh-CN': '\u67e5\u770b\u623f\u6e90',
        'zh-TW': '\u67e5\u770b\u623f\u6e90',
      },
    },
    sections: {
      required: ['hero', 'listings', 'contact', 'reviews'],
      recommended: ['gallery', 'trustBar', 'faq'],
      optional: ['about', 'blog', 'agents'],
    },
    conversionElements: [
      'Property search',
      'Listing photos',
      'Agent profiles',
      'Virtual tour embeds',
    ],
    designGuidance:
      'Search-forward. Featured listings grid. Each listing: gallery, specs, map, price. Agent profiles build trust.',
    externalIntegrations: ['whatsapp-inquiry', 'google-maps', 'propertyguru'],
    demoFeatures: [
      'Property/room browser with filters',
      'Listing detail modal with image gallery',
      'Inquiry form per listing',
    ],
  },

  'community-info': {
    archetype: 'community-info',
    label: 'Community + Information',
    description: 'Welcoming design for community organizations, religious institutions, and civic groups.',
    primaryCTA: {
      action: 'Join Us',
      localized: {
        en: 'Join Us',
        ms: 'Sertai Kami',
        'zh-CN': '\u52a0\u5165\u6211\u4eec',
        'zh-TW': '\u52a0\u5165\u6211\u5011',
      },
    },
    sections: {
      required: ['hero', 'events', 'programs', 'contact', 'hours', 'location'],
      recommended: ['announcements', 'donations', 'gallery', 'trustBar'],
      optional: ['about', 'faq', 'blog'],
    },
    conversionElements: [
      'Events calendar',
      'Programs/services list',
      'Donation options',
      'Contact info',
    ],
    designGuidance:
      'Welcoming and inclusive. Events calendar prominent. Programs clearly listed. Donation options available but not pushy.',
    externalIntegrations: ['whatsapp-contact', 'google-calendar', 'google-maps'],
    demoFeatures: [
      'Events calendar with upcoming events',
      'Program browser',
      'Donation tier selector (shows confirmation)',
    ],
  },
};
