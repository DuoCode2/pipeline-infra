import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ContactSection } from '@/components/shared/ContactSection';

interface ListingItem {
  title: string;
  price: string;
  image?: string;
  features?: string[];
  url?: string;
}

function ListingCards({ listings }: { listings: ListingItem[] }) {
  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Listings
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing, i) => (
            <div key={i} className="group rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm transition hover:shadow-md">
              {listing.image ? (
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[var(--color-text-title)]">{listing.title}</h3>
                <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">{listing.price}</p>
                {listing.features && listing.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {listing.features.map((feature, j) => (
                      <span key={j} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-[var(--color-text-body)]">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  href={listing.url || '#'}
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-text)] transition hover:opacity-90"
                >
                  Inquire
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PropertyListingPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="full-bleed" />
      {content.listings && content.listings.length > 0 && (
        <ListingCards listings={content.listings} />
      )}
      <ReviewsSection reviews={content.reviews} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
