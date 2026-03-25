'use client';
import { useState } from 'react';

interface ServiceItem {
  name: string;
  description?: string;
  price?: string;
  image?: string;
  tags?: string[];
  popular?: boolean;
}

interface ServiceCategory {
  category: string;
  items: ServiceItem[];
}

export function ServiceBrowser({ services, ctaText = 'Book Now' }: {
  services: ServiceCategory[];
  ctaText?: string;
}) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!services || services.length === 0) return null;

  const current = services[activeCategory];

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Services
        </h2>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Service categories">
          {services.map((cat, i) => (
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {current.items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--color-text-title)]">
                  {item.name}
                  {item.popular && (
                    <span className="ml-2 inline-block rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--color-accent-text)]">
                      Popular
                    </span>
                  )}
                </h3>
                {item.description && (
                  <p className="mt-1 text-sm text-[var(--color-text-body)] opacity-70">
                    {item.description}
                  </p>
                )}
                {item.price && (
                  <p className="mt-2 font-bold text-[var(--color-primary)]">{item.price}</p>
                )}
              </div>
              <button className="min-h-[44px] flex-shrink-0 rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-text)] transition hover:opacity-90">
                {ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
