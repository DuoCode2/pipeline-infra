import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface ServiceItem {
  name: string;
  description: string;
  price: string;
  duration?: string;
}

interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

export function Services({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const services: ServiceCategory[] = content.services || [];
  const heading = {
    en: 'Our Services',
    ms: 'Perkhidmatan Kami',
    'zh-CN': '我们的服务',
    'zh-TW': '我們的服務',
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
        <div className="space-y-10">
          {services.map((cat, ci) => (
            <div key={ci}>
              <h3
                className="mb-4 font-display text-xl font-semibold"
                style={{ color: theme.primary }}
              >
                {cat.category}
              </h3>
              <div className="space-y-3">
                {cat.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold" style={{ color: theme.textTitle }}>
                        {item.name}
                      </h4>
                      <p className="mt-1 text-sm" style={{ color: theme.textBody }}>
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="font-semibold tabular-nums" style={{ color: theme.primary }}>
                        {item.price}
                      </span>
                      {item.duration && (
                        <span className="block text-xs" style={{ color: theme.textBody }}>
                          {item.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
