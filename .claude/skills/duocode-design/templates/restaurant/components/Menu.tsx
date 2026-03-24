import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image?: string;
  popular?: boolean;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export function Menu({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const menu: MenuCategory[] = content.menu || [];
  const heading = {
    en: 'Our Menu',
    ms: 'Menu Kami',
    'zh-CN': '我们的菜单',
    'zh-TW': '我們的菜單',
  };

  if (!menu.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="space-y-12">
          {menu.map((cat, ci) => (
            <div key={ci}>
              <h3
                className="mb-6 font-display text-xl font-semibold"
                style={{ color: theme.primary }}
              >
                {cat.category}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {cat.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-start justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold" style={{ color: theme.textTitle }}>
                          {item.name}
                        </h4>
                        {item.popular && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                            style={{ backgroundColor: theme.accent }}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm" style={{ color: theme.textBody }}>
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="ml-4 whitespace-nowrap font-semibold tabular-nums"
                      style={{ color: theme.primary }}
                    >
                      {item.price}
                    </span>
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
