import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface Category {
  name: string;
  icon?: string;
  count?: number;
}

export function Categories({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const categories: Category[] = (content as any).categories || [];
  const heading = {
    en: 'Shop by Category',
    ms: 'Beli Mengikut Kategori',
    'zh-CN': '按分类选购',
    'zh-TW': '按分類選購',
  };

  if (!categories.length) return null;

  return (
    <section className="py-10 sm:py-14" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:pb-0">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="flex flex-shrink-0 items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-colors hover:text-white"
              style={{
                borderColor: theme.accent,
                color: theme.textTitle,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = theme.accent;
                (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLElement).style.color = theme.textTitle;
              }}
            >
              {cat.icon && <span className="text-lg">{cat.icon}</span>}
              <span>{cat.name}</span>
              {cat.count !== undefined && (
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-xs"
                  style={{ backgroundColor: theme.surface, color: theme.textBody }}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
