import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

interface Product {
  name: string;
  price: string;
  category?: string;
  image?: string;
  description?: string;
  popular?: boolean;
}

export function ProductGrid({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;
  const products: Product[] = (content as any).products || [];
  const heading = {
    en: 'Our Products',
    ms: 'Produk Kami',
    'zh-CN': '我们的产品',
    'zh-TW': '我們的產品',
  };

  if (!products.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2
          className="mb-12 text-center font-display text-3xl font-bold sm:text-4xl"
          style={{ color: theme.textTitle }}
        >
          {heading[locale]}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                {product.category && (
                  <span
                    className="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {product.category}
                  </span>
                )}
                {product.popular && (
                  <span
                    className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {locale === 'ms' ? 'Popular' : locale.startsWith('zh') ? '热卖' : 'Popular'}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3
                  className="font-semibold leading-tight"
                  style={{ color: theme.textTitle }}
                >
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 text-sm line-clamp-2" style={{ color: theme.textBody }}>
                    {product.description}
                  </p>
                )}
                <p
                  className="mt-2 font-display text-lg font-bold tabular-nums"
                  style={{ color: theme.primary }}
                >
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
