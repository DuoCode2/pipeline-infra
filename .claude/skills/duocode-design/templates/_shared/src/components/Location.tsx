import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Location({ locale }: { locale: Locale }) {
  const { location } = business.content[locale];
  const { theme } = business;
  const heading = {
    en: 'Find Us',
    ms: 'Cari Kami',
    'zh-CN': '我们的位置',
    'zh-TW': '我們的位置',
  };

  const mapsQuery = location.coordinates
    ? `${location.coordinates.lat},${location.coordinates.lng}`
    : location.address;
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed&z=16`;

  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-lg" style={{ color: theme.textBody }}>
              {location.address}
            </p>
            <a
              href={location.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg px-6 py-3 text-center font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: theme.primary }}
            >
              {locale === 'ms' ? 'Buka di Google Maps' : locale.startsWith('zh') ? '在谷歌地图中打开' : 'Open in Google Maps'}
            </a>
          </div>
          <div className="aspect-video overflow-hidden rounded-xl bg-gray-200">
            <iframe
              src={mapsEmbed}
              className="h-full w-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location map"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
