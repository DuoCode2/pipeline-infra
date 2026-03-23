import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Hours({ locale }: { locale: Locale }) {
  const { hours } = business.content[locale];
  const { theme } = business;
  const heading = {
    en: 'Opening Hours',
    ms: 'Waktu Operasi',
    'zh-CN': '营业时间',
    'zh-TW': '營業時間',
  };

  const entries = Object.entries(hours);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {entries.map(([day, time], i) => (
            <div
              key={day}
              className={`flex items-center justify-between px-6 py-4 ${
                i < entries.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <span className="font-medium" style={{ color: theme.textTitle }}>
                {day}
              </span>
              <span className="text-sm" style={{ color: theme.textBody }}>
                {time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
