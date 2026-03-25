import { RegionConfig } from './region-config';

export const MY_REGION: RegionConfig = {
  id: 'my',
  name: 'Malaysia',
  locales: ['en', 'ms', 'zh-CN', 'zh-TW'],
  defaultLocale: 'en',
  currency: {
    symbol: 'RM',
    code: 'MYR',
    format: '{symbol}{amount}',
    position: 'prefix',
    separator: '.',
  },
  phone: {
    countryCode: '+60',
    formatLocal: '0XX-XXX XXXX',
    formatInternational: '+60 XX-XXX XXXX',
    whatsappPrefix: '60',
  },
  address: {
    format: '{street}, {city}, {postcode} {state}',
  },
  discovery: {
    defaultCity: 'Kuala Lumpur',
    nameKeywords: {
      food: /kopitiam|mamak|nasi|mee|warung|kedai\s*makan|restoran/i,
      automotive: /bengkel/i,
      clinic: /farmasi|klinik/i,
      beauty: /salun/i,
      retail: /kedai/i,
    },
    skipWords: ['sdn', 'bhd', 'enterprise', 'trading', 'resources', 'industries'],
  },
  photos: {
    locationHint: 'malaysia',
  },
  cultural: {
    halalBadge: true,
    prayerRoom: true,
    genderSeparated: true,
    festiveNotes: ['Ramadan', 'Hari Raya Aidilfitri', 'Chinese New Year', 'Deepavali', 'Christmas'],
  },
  reviewAuthors: ['Sarah L.', 'Ahmad R.', 'Wei Ming T.', 'Priya S.', 'Aisha M.', 'Jason C.'],
};
