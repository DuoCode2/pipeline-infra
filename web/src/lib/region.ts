import { SiteRegion } from '@/types/site-data';

/**
 * Zero-config region detection from address.
 * Any country works — no lookup table needed.
 */
export function detectRegion(formattedAddress: string, phone?: string): SiteRegion {
  const country = formattedAddress.split(',').pop()?.trim() || 'Unknown';
  return {
    country,
    locales: ['en'],
    defaultLocale: 'en',
    currency: { symbol: '$', code: 'USD' },
    phone: { countryCode: phone?.match(/^\+\d+/)?.[0] || '' },
  };
}
