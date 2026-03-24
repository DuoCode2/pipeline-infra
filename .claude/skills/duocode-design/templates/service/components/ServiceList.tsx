import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface ServiceItem {
  name: string;
  description: string;
  priceRange?: string;
  icon?: string;
  duration?: string;
}

export function ServiceList({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const services: ServiceItem[] = (content as any).serviceList || [];
  const heading = {
    en: 'Our Services',
    ms: 'Perkhidmatan Kami',
    'zh-CN': '我们的服务',
    'zh-TW': '我們的服務',
  };
  const fromLabel = {
    en: 'From',
    ms: 'Dari',
    'zh-CN': '起价',
    'zh-TW': '起價',
  };

  if (!services.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <div
              key={i}
              className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              style={{ borderLeftWidth: '4px', borderLeftColor: theme.primary }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {service.icon && (
                    <span className="text-3xl">{service.icon}</span>
                  )}
                  <h3
                    className="font-display text-lg font-bold"
                    style={{ color: theme.textTitle }}
                  >
                    {service.name}
                  </h3>
                </div>
              </div>
              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: theme.textBody }}
              >
                {service.description}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                {service.priceRange && (
                  <div>
                    <span className="text-xs" style={{ color: theme.textBody }}>
                      {fromLabel[locale]}
                    </span>
                    <span
                      className="ml-1 font-display text-lg font-bold tabular-nums"
                      style={{ color: theme.primary }}
                    >
                      {service.priceRange}
                    </span>
                  </div>
                )}
                {service.duration && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ backgroundColor: theme.surface, color: theme.textBody }}
                  >
                    {service.duration}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
