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

export const SCHEMA_ORG_TYPE: Record<string, string> = {
  restaurant: 'Restaurant',
  beauty: 'BeautySalon',
  clinic: 'Dentist',
  retail: 'Store',
  fitness: 'SportsActivityLocation',
  service: 'LocalBusiness',
  generic: 'LocalBusiness',
};

export function classifyIndustry(mapsType: string | undefined): string {
  const t = mapsType || '';

  // Exact matches first
  const typeMap: Record<string, string> = {
    restaurant: 'restaurant', cafe: 'restaurant', bakery: 'restaurant',
    bar: 'restaurant', meal_delivery: 'restaurant', meal_takeaway: 'restaurant',
    coffee_shop: 'restaurant', food_court: 'restaurant', ice_cream_shop: 'restaurant',
    pizza_restaurant: 'restaurant', steak_house: 'restaurant', sushi_restaurant: 'restaurant',
    beauty_salon: 'beauty', hair_care: 'beauty', spa: 'beauty',
    hair_salon: 'beauty', nail_salon: 'beauty',
    dentist: 'clinic', doctor: 'clinic', hospital: 'clinic',
    pharmacy: 'clinic', physiotherapist: 'clinic', veterinary_care: 'clinic',
    dental_clinic: 'clinic', medical_lab: 'clinic',
    clothing_store: 'retail', shoe_store: 'retail', jewelry_store: 'retail',
    electronics_store: 'retail', furniture_store: 'retail', book_store: 'retail',
    shopping_mall: 'retail', supermarket: 'retail', convenience_store: 'retail',
    gym: 'fitness', stadium: 'fitness', sporting_goods_store: 'retail',
    sports_complex: 'fitness', athletic_field: 'fitness', swimming_pool: 'fitness',
    yoga_studio: 'fitness', martial_arts_school: 'fitness', dance_school: 'fitness',
    bowling_alley: 'fitness', sports_club: 'fitness', recreation_center: 'fitness',
    plumber: 'service', electrician: 'service', painter: 'service',
    locksmith: 'service', moving_company: 'service', car_repair: 'service',
    laundry: 'service', car_wash: 'service',
  };
  if (typeMap[t]) return typeMap[t];

  // Suffix matching: Google Maps returns compound types like "latin_american_restaurant"
  const suffixMap: [string, string][] = [
    ['_restaurant', 'restaurant'],
    ['_cafe', 'restaurant'],
    ['_bakery', 'restaurant'],
    ['_bar', 'restaurant'],
    ['_salon', 'beauty'],
    ['_spa', 'beauty'],
    ['_clinic', 'clinic'],
    ['_hospital', 'clinic'],
    ['_store', 'retail'],
    ['_shop', 'retail'],
    ['_gym', 'fitness'],
    ['_studio', 'fitness'],
    ['_center', 'service'],
    ['_school', 'service'],
  ];
  for (const [suffix, industry] of suffixMap) {
    if (t.endsWith(suffix)) return industry;
  }

  // Substring matching for remaining edge cases
  if (t.includes('restaurant') || t.includes('food') || t.includes('eat')) return 'restaurant';
  if (t.includes('beauty') || t.includes('hair') || t.includes('nail')) return 'beauty';
  if (t.includes('doctor') || t.includes('dent') || t.includes('medical') || t.includes('health')) return 'clinic';
  if (t.includes('sport') || t.includes('fitness') || t.includes('athletic')) return 'fitness';

  return 'generic';
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

/**
 * Get the output directory path for a business.
 * Uses slugified business name as directory name (not place_id).
 * place_id is stored inside lead.json for reference.
 */
export function getOutputDir(businessName: string): string {
  const path = require('path');
  return path.resolve(__dirname, '../../output', slugify(businessName));
}
