export interface IndustryDesign {
  fontDisplay: string;
  fontBody: string;
  svgStyle: 'organic' | 'elegant' | 'geometric' | 'modern';
  colorWarmth: 'warm' | 'soft' | 'cool' | 'vibrant' | 'bold' | 'neutral' | 'from-photo';
  heroStyle: 'full-bleed' | 'split' | 'overlay';
  ctaStyle: 'rounded' | 'pill' | 'square';
}

export const INDUSTRY_CONFIG: Record<string, IndustryDesign> = {
  restaurant: {
    fontDisplay: 'Playfair Display',
    fontBody: 'Source Serif Pro',
    svgStyle: 'organic',
    colorWarmth: 'warm',
    heroStyle: 'full-bleed',
    ctaStyle: 'rounded',
  },
  beauty: {
    fontDisplay: 'Cormorant Garamond',
    fontBody: 'Quicksand',
    svgStyle: 'elegant',
    colorWarmth: 'soft',
    heroStyle: 'split',
    ctaStyle: 'pill',
  },
  clinic: {
    fontDisplay: 'Inter',
    fontBody: 'DM Sans',
    svgStyle: 'geometric',
    colorWarmth: 'cool',
    heroStyle: 'split',
    ctaStyle: 'square',
  },
  retail: {
    fontDisplay: 'Poppins',
    fontBody: 'Inter',
    svgStyle: 'modern',
    colorWarmth: 'vibrant',
    heroStyle: 'full-bleed',
    ctaStyle: 'rounded',
  },
  fitness: {
    fontDisplay: 'Oswald',
    fontBody: 'Barlow',
    svgStyle: 'geometric',
    colorWarmth: 'bold',
    heroStyle: 'full-bleed',
    ctaStyle: 'square',
  },
  service: {
    fontDisplay: 'Lato',
    fontBody: 'Open Sans',
    svgStyle: 'modern',
    colorWarmth: 'neutral',
    heroStyle: 'overlay',
    ctaStyle: 'rounded',
  },
  generic: {
    fontDisplay: 'Playfair Display',
    fontBody: 'Source Sans 3',
    svgStyle: 'modern',
    colorWarmth: 'from-photo',
    heroStyle: 'overlay',
    ctaStyle: 'rounded',
  },
};

export function classifyIndustry(mapsType: string | undefined): string {
  const typeMap: Record<string, string> = {
    restaurant: 'restaurant', cafe: 'restaurant', bakery: 'restaurant',
    bar: 'restaurant', meal_delivery: 'restaurant', meal_takeaway: 'restaurant',
    beauty_salon: 'beauty', hair_care: 'beauty', spa: 'beauty',
    dentist: 'clinic', doctor: 'clinic', hospital: 'clinic',
    pharmacy: 'clinic', physiotherapist: 'clinic', veterinary_care: 'clinic',
    clothing_store: 'retail', shoe_store: 'retail', jewelry_store: 'retail',
    electronics_store: 'retail', furniture_store: 'retail', book_store: 'retail',
    gym: 'fitness', stadium: 'fitness',
    plumber: 'service', electrician: 'service', painter: 'service',
    locksmith: 'service', moving_company: 'service', car_repair: 'service',
  };
  return typeMap[mapsType || ''] || 'generic';
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
