export interface RegionConfig {
  id: string;
  name: string;
  locales: string[];
  defaultLocale: string;
  currency: {
    symbol: string;
    code: string;
    format: string;       // e.g. "{symbol}{amount}" for "RM12.90"
    position: 'prefix' | 'suffix';
    separator: '.' | ',';
  };
  phone: {
    countryCode: string;
    formatLocal: string;
    formatInternational: string;
    whatsappPrefix: string;
  };
  address: {
    format: string;
  };
  discovery: {
    defaultCity: string;
    nameKeywords: Record<string, RegExp>;
    skipWords: string[];
  };
  photos: {
    locationHint: string;
  };
  cultural?: {
    halalBadge?: boolean;
    prayerRoom?: boolean;
    genderSeparated?: boolean;
    festiveNotes?: string[];
  };
  reviewAuthors: string[];
}
