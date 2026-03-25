'use client';
import { useState } from 'react';

interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  image?: string;
  tags?: string[];
  popular?: boolean;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export function MenuBrowser({ categories, currencySymbol = 'RM' }: {
  categories: MenuCategory[];
  currencySymbol?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!categories || categories.length === 0) return null;

  const current = categories[activeCategory];

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Menu
        </h2>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Menu categories">
          {categories.map((cat, i) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(i)}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                i === activeCategory
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                  : 'bg-gray-100 text-[var(--color-text-body)] hover:bg-gray-200'
              }`}
              aria-pressed={i === activeCategory}
            >
              {cat.category}
            </button>
          ))}
        </nav>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {current.items.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-[var(--color-text-title)]">
                    {item.name}
                    {item.popular && (
                      <span className="ml-2 inline-block rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-text)]">
                        Popular
                      </span>
                    )}
                  </h3>
                  {item.price && (
                    <span className="whitespace-nowrap font-bold text-[var(--color-primary)]">
                      {currencySymbol}{item.price}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-[var(--color-text-body)] opacity-70">
                    {item.description}
                  </p>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-[var(--color-text-body)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
