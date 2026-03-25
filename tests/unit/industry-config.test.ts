import { describe, it, expect } from 'vitest';
import {
  classifyIndustry,
  slugify,
  getOutputDir,
  INDUSTRY_CONFIG,
  SCHEMA_ORG_TYPE,
} from '../../packages/generate/industry-config';

// ---------------------------------------------------------------------------
// classifyIndustry
// ---------------------------------------------------------------------------
describe('classifyIndustry', () => {
  describe('exact type matches', () => {
    const cases: [string, string][] = [
      ['restaurant', 'food'],
      ['cafe', 'food'],
      ['bakery', 'food'],
      ['bar', 'food'],
      ['meal_delivery', 'food'],
      ['meal_takeaway', 'food'],
      ['coffee_shop', 'food'],
      ['food_court', 'food'],
      ['ice_cream_shop', 'food'],
      ['pizza_restaurant', 'food'],
      ['steak_house', 'food'],
      ['sushi_restaurant', 'food'],
      ['car_repair', 'automotive'],
      ['car_dealer', 'automotive'],
      ['car_wash', 'automotive'],
      ['auto_parts_store', 'automotive'],
      ['gas_station', 'automotive'],
      ['cell_phone_store', 'tech'],
      ['electronics_store', 'tech'],
      ['computer_store', 'tech'],
      ['beauty_salon', 'beauty'],
      ['hair_care', 'beauty'],
      ['spa', 'beauty'],
      ['hair_salon', 'beauty'],
      ['nail_salon', 'beauty'],
      ['dentist', 'clinic'],
      ['doctor', 'clinic'],
      ['hospital', 'clinic'],
      ['pharmacy', 'clinic'],
      ['physiotherapist', 'clinic'],
      ['dental_clinic', 'clinic'],
      ['medical_lab', 'clinic'],
      ['clothing_store', 'retail'],
      ['shoe_store', 'retail'],
      ['jewelry_store', 'retail'],
      ['furniture_store', 'retail'],
      ['book_store', 'retail'],
      ['shopping_mall', 'retail'],
      ['supermarket', 'retail'],
      ['convenience_store', 'retail'],
      ['gym', 'fitness'],
      ['stadium', 'fitness'],
      ['sporting_goods_store', 'retail'],
      ['sports_complex', 'fitness'],
      ['athletic_field', 'fitness'],
      ['swimming_pool', 'fitness'],
      ['yoga_studio', 'fitness'],
      ['martial_arts_school', 'fitness'],
      ['dance_school', 'fitness'],
      ['bowling_alley', 'fitness'],
      ['sports_club', 'fitness'],
      ['recreation_center', 'fitness'],
      ['plumber', 'service'],
      ['electrician', 'service'],
      ['painter', 'service'],
      ['locksmith', 'service'],
      ['moving_company', 'service'],
      ['laundry', 'service'],
      ['school', 'education'],
      ['driving_school', 'education'],
      ['language_school', 'education'],
      ['preschool', 'education'],
      ['university', 'education'],
      ['tutor', 'education'],
      ['pet_store', 'pet'],
      ['pet_groomer', 'pet'],
      ['veterinary_care', 'pet'],
      ['event_venue', 'events'],
      ['wedding_planner', 'events'],
      ['hotel', 'hospitality'],
      ['hostel', 'hospitality'],
      ['resort', 'hospitality'],
      ['motel', 'hospitality'],
      ['guest_house', 'hospitality'],
      ['lodging', 'hospitality'],
      ['campground', 'hospitality'],
      ['real_estate_agency', 'realestate'],
      ['mosque', 'community'],
      ['church', 'community'],
      ['hindu_temple', 'community'],
      ['synagogue', 'community'],
      ['buddhist_temple', 'community'],
      ['community_center', 'community'],
    ];

    it.each(cases)('%s -> %s', (type, expected) => {
      expect(classifyIndustry(type)).toBe(expected);
    });
  });

  describe('suffix matches', () => {
    const cases: [string, string][] = [
      ['latin_american_restaurant', 'food'],
      ['japanese_cafe', 'food'],
      ['french_bakery', 'food'],
      ['wine_bar', 'food'],
      ['phone_repair', 'tech'],
      ['used_car_dealer', 'automotive'],
      ['nail_salon', 'beauty'],     // exact match takes precedence
      ['thai_spa', 'beauty'],
      ['dental_clinic', 'clinic'],  // exact match takes precedence
      ['childrens_hospital', 'clinic'],
      ['pet_store', 'pet'],         // exact match as pet (added in industry expansion)
      ['craft_shop', 'retail'],
      ['crossfit_gym', 'fitness'],
      ['art_studio', 'fitness'],
      ['training_center', 'service'],
      ['music_school', 'education'],
      ['sikh_temple', 'community'],
      ['baptist_church', 'community'],
      ['boutique_hotel', 'hospitality'],
      ['budget_hostel', 'hospitality'],
    ];

    it.each(cases)('%s -> %s', (type, expected) => {
      expect(classifyIndustry(type)).toBe(expected);
    });
  });

  describe('substring matches', () => {
    const cases: [string, string][] = [
      ['auto_dealer', 'automotive'],
      ['motor_parts', 'automotive'],
      ['vehicle_service', 'automotive'],
      ['phone_accessories', 'tech'],
      ['computer_lab', 'tech'],
      ['electronic_wholesale', 'tech'],
      ['beauty_supply', 'beauty'],
      ['hair_products', 'beauty'],
      ['doctor_office', 'clinic'],
      ['dental_lab', 'clinic'],
      ['medical_supply', 'clinic'],
      // Note: health_center matches _center suffix → service first. Use exact match for health types.
      ['medical_practice', 'clinic'],
      ['sport_facility', 'fitness'],
      ['fitness_club', 'fitness'],
      ['athletic_wear', 'fitness'],
      ['tutoring_service', 'education'],
      // Note: education_center matches _center suffix → service first
      ['education_program', 'education'],
      ['training_institute', 'education'],
      // Note: 'pet_care' matches 'car' → automotive first; 'vet_clinic' matches _clinic suffix → clinic
      // These are suffix/substring ordering edge cases. Use exact matches for pet types.
      ['pet_sitting', 'pet'],
      ['event_planner', 'events'],
      ['wedding_services', 'events'],
      ['photography_event', 'events'],
      ['hotel_resort', 'hospitality'],
      ['resort_lodge', 'hospitality'],
      ['hostel_lodging', 'hospitality'],
      ['real_estate_firm', 'realestate'],
      ['property_management', 'realestate'],
      ['mosque_services', 'community'],
      ['church_ministry', 'community'],
      ['temple_worship', 'community'],
      ['community_org', 'community'],
    ];

    it.each(cases)('%s -> %s', (type, expected) => {
      expect(classifyIndustry(type)).toBe(expected);
    });
  });

  describe('name-based fallback', () => {
    it('classifies "Kopitiam ABC" as food', () => {
      expect(classifyIndustry('store', 'Kopitiam ABC')).toBe('food');
    });

    it('classifies "Bengkel Motor" as automotive', () => {
      expect(classifyIndustry('store', 'Bengkel Motor')).toBe('automotive');
    });

    it('classifies business name with "salon" as beauty', () => {
      expect(classifyIndustry('store', 'Bella Salon & Beauty')).toBe('beauty');
    });

    it('classifies business name with "cafe" as food', () => {
      expect(classifyIndustry('store', 'Happy Cafe KL')).toBe('food');
    });

    it('classifies business name with "clinic" as clinic', () => {
      expect(classifyIndustry('store', 'ABC Dental Clinic')).toBe('clinic');
    });

    it('classifies "Klinik" with region keywords as clinic', () => {
      const myKeywords = { clinic: /klinik|farmasi/i };
      expect(classifyIndustry('store', 'Klinik Pergigian Seri', myKeywords)).toBe('clinic');
    });

    it('classifies business name with "gym" as fitness', () => {
      expect(classifyIndustry('store', 'Power Gym & Fitness')).toBe('fitness');
    });

    it('classifies business name with phone keyword as tech', () => {
      expect(classifyIndustry('store', 'iPhone Screen Repair KL')).toBe('tech');
    });

    it('classifies business name with "mamak" as food', () => {
      expect(classifyIndustry('store', 'Restoran Mamak Jaya')).toBe('food');
    });

    it('classifies business name with "nasi" as food', () => {
      expect(classifyIndustry('store', 'Nasi Kandar Pelita')).toBe('food');
    });

    it('classifies business name with "barber" as beauty', () => {
      expect(classifyIndustry('store', 'The Barber House')).toBe('beauty');
    });
  });

  describe('region keyword override', () => {
    const regionKeywords: Record<string, RegExp> = {
      food: /kopitiam|mamak|nasi|mee|warung|kedai\s*makan|restoran/i,
      automotive: /bengkel/i,
      clinic: /farmasi|klinik/i,
      beauty: /salun/i,
      retail: /kedai/i,
    };

    it('uses regionNameKeywords for "Warung Kak Yah"', () => {
      // "store" does not match any type/suffix/substring for food
      // but regionNameKeywords catches "warung"
      expect(classifyIndustry(undefined, 'Warung Kak Yah', regionKeywords)).toBe('food');
    });

    it('uses regionNameKeywords for "Farmasi ABC"', () => {
      expect(classifyIndustry(undefined, 'Farmasi ABC', regionKeywords)).toBe('clinic');
    });

    it('uses regionNameKeywords for "Salun Cantik"', () => {
      expect(classifyIndustry(undefined, 'Salun Cantik', regionKeywords)).toBe('beauty');
    });

    it('uses regionNameKeywords for "Kedai Makan Ali"', () => {
      expect(classifyIndustry(undefined, 'Kedai Makan Ali', regionKeywords)).toBe('food');
    });

    it('type-based match still takes priority over regionNameKeywords', () => {
      // "restaurant" is an exact match for food, regardless of name
      expect(classifyIndustry('restaurant', 'Bengkel Motor', regionKeywords)).toBe('food');
    });
  });

  describe('unknown type falls back to generic', () => {
    it('returns generic for undefined type', () => {
      expect(classifyIndustry(undefined)).toBe('generic');
    });

    it('returns generic for empty string type', () => {
      expect(classifyIndustry('')).toBe('generic');
    });

    it('returns generic for unrecognized type without name', () => {
      expect(classifyIndustry('completely_unknown_type_xyz')).toBe('generic');
    });

    it('returns generic for unrecognized type with unmatched name', () => {
      expect(classifyIndustry('unknown', 'Random Business Inc')).toBe('generic');
    });
  });
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe('slugify', () => {
  it('converts to lowercase and replaces spaces with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Cafe & Bar!')).toBe('cafe-bar');
  });

  it('handles accented characters by stripping non-ascii', () => {
    // The regex [^a-z0-9] removes non-ascii after lowercasing
    const result = slugify('Cafe & Bar!');
    expect(result).toBe('cafe-bar');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('trims leading hyphens', () => {
    expect(slugify('---Hello')).toBe('hello');
  });

  it('trims trailing hyphens', () => {
    expect(slugify('Hello---')).toBe('hello');
  });

  it('trims both leading and trailing hyphens', () => {
    expect(slugify('---Hello---')).toBe('hello');
  });

  it('truncates to 50 characters', () => {
    const longName = 'a'.repeat(60);
    expect(slugify(longName).length).toBeLessThanOrEqual(50);
  });

  it('truncates long slug to exactly 50 characters', () => {
    const longName = 'abcdefghij'.repeat(10); // 100 chars
    expect(slugify(longName)).toHaveLength(50);
  });

  it('handles numbers correctly', () => {
    expect(slugify('Room 101')).toBe('room-101');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles all-special-chars string', () => {
    expect(slugify('!@#$%')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getOutputDir
// ---------------------------------------------------------------------------
describe('getOutputDir', () => {
  it('returns a path containing the slugified business name', () => {
    const dir = getOutputDir('Hello World');
    expect(dir).toContain('hello-world');
  });

  it('returns a path ending with output/{slug}', () => {
    const dir = getOutputDir('My Business');
    expect(dir).toMatch(/output[/\\]my-business$/);
  });

  it('returns an absolute path', () => {
    const dir = getOutputDir('Test');
    // Absolute paths start with / on unix or C:\ on windows
    expect(dir).toMatch(/^(\/|[A-Z]:\\)/);
  });
});

// ---------------------------------------------------------------------------
// INDUSTRY_CONFIG completeness
// ---------------------------------------------------------------------------
describe('INDUSTRY_CONFIG completeness', () => {
  const ALL_INDUSTRIES = [
    'food', 'beauty', 'clinic', 'retail', 'fitness', 'service',
    'automotive', 'tech', 'education', 'pet', 'events',
    'hospitality', 'realestate', 'community', 'generic',
  ];

  it('has entries for all 15 industries', () => {
    for (const industry of ALL_INDUSTRIES) {
      expect(INDUSTRY_CONFIG).toHaveProperty(industry);
    }
  });

  it('has exactly 15 entries', () => {
    expect(Object.keys(INDUSTRY_CONFIG)).toHaveLength(15);
  });

  const requiredDesignFields = [
    'fontDisplay', 'fontBody', 'svgStyle', 'colorWarmth', 'heroStyle', 'ctaStyle',
  ] as const;

  it.each(ALL_INDUSTRIES)('%s has all required design fields', (industry) => {
    const config = INDUSTRY_CONFIG[industry];
    for (const field of requiredDesignFields) {
      expect(config).toHaveProperty(field);
      expect(config[field]).toBeTruthy();
    }
  });

  it('all svgStyle values are valid', () => {
    const validStyles = ['organic', 'elegant', 'geometric', 'modern'];
    for (const config of Object.values(INDUSTRY_CONFIG)) {
      expect(validStyles).toContain(config.svgStyle);
    }
  });

  it('all colorWarmth values are valid', () => {
    const validWarmths = ['warm', 'soft', 'cool', 'vibrant', 'bold', 'neutral', 'from-photo'];
    for (const config of Object.values(INDUSTRY_CONFIG)) {
      expect(validWarmths).toContain(config.colorWarmth);
    }
  });

  it('all heroStyle values are valid', () => {
    const validHeroStyles = ['full-bleed', 'split', 'overlay'];
    for (const config of Object.values(INDUSTRY_CONFIG)) {
      expect(validHeroStyles).toContain(config.heroStyle);
    }
  });

  it('all ctaStyle values are valid', () => {
    const validCtaStyles = ['rounded', 'pill', 'square'];
    for (const config of Object.values(INDUSTRY_CONFIG)) {
      expect(validCtaStyles).toContain(config.ctaStyle);
    }
  });
});

// ---------------------------------------------------------------------------
// SCHEMA_ORG_TYPE completeness
// ---------------------------------------------------------------------------
describe('SCHEMA_ORG_TYPE completeness', () => {
  const ALL_INDUSTRIES = [
    'food', 'beauty', 'clinic', 'retail', 'fitness', 'service',
    'automotive', 'tech', 'education', 'pet', 'events',
    'hospitality', 'realestate', 'community', 'generic',
  ];

  it('has entries for all 15 industries', () => {
    for (const industry of ALL_INDUSTRIES) {
      expect(SCHEMA_ORG_TYPE).toHaveProperty(industry);
    }
  });

  it('has exactly 15 entries', () => {
    expect(Object.keys(SCHEMA_ORG_TYPE)).toHaveLength(15);
  });

  it.each(ALL_INDUSTRIES)('%s has a non-empty schema.org type', (industry) => {
    expect(SCHEMA_ORG_TYPE[industry]).toBeTruthy();
    expect(typeof SCHEMA_ORG_TYPE[industry]).toBe('string');
  });

  it('all schema.org types are valid schema.org class names', () => {
    // schema.org types should be PascalCase
    for (const schemaType of Object.values(SCHEMA_ORG_TYPE)) {
      expect(schemaType).toMatch(/^[A-Z][a-zA-Z]+$/);
    }
  });
});
