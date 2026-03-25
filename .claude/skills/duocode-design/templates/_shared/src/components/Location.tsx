import { business } from '@/data/business';
import type { Locale } from '@/lib/i18n';

export default function Location({ locale }: { locale: Locale }) {
  const { location } = business.content[locale];
  const theme = business.theme;
  const coords = location.coordinates;
  const businessName = business.content[locale].meta.title;

  // Use business name + address as query so Google Maps shows the business card (not just a pin)
  const mapQuery = encodeURIComponent(`${businessName}, ${location.address}`);
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&output=embed&z=16`;

  const directionsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&destination_place_id=`
    : location.mapsUrl;

  return (
    <section
      id="location"
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: theme.surface }}
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-display text-3xl font-bold text-center mb-8"
          style={{ color: theme.textTitle }}
        >
          {locale === 'zh-CN'
            ? '我们的位置'
            : locale === 'zh-TW'
              ? '我們的位置'
              : locale === 'ms'
                ? 'Lokasi Kami'
                : 'Our Location'}
        </h2>

        {mapSrc && (
          <div className="relative w-full overflow-hidden rounded-xl shadow-lg aspect-video mb-6">
            <iframe
              src={mapSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
              allowFullScreen
            />
          </div>
        )}
        {!mapSrc && location.mapsUrl ? (
          <div className="mb-6 flex items-center justify-center">
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: theme.primary,
                color: theme.onPrimary,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {locale === 'zh-CN'
                ? '在地图上查看'
                : locale === 'zh-TW'
                  ? '在地圖上查看'
                  : locale === 'ms'
                    ? 'Lihat di Peta'
                    : 'View on Map'}
            </a>
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-4 text-center">
          <p
            className="text-base sm:text-lg"
            style={{ color: theme.textBody }}
          >
            {location.address}
          </p>

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 font-semibold transition-colors hover:opacity-90"
              style={{
                borderColor: theme.primary,
                color: theme.primary,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                  clipRule="evenodd"
                />
              </svg>
              {locale === 'zh-CN'
                ? '获取路线'
                : locale === 'zh-TW'
                  ? '取得路線'
                  : locale === 'ms'
                    ? 'Dapatkan Arah'
                    : 'Get Directions'}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
