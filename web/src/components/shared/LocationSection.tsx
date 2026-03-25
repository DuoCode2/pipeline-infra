import type { BusinessContent } from '@/types/site-data';

export function LocationSection({ location, heading = 'Location' }: {
  location: BusinessContent['location'];
  heading?: string;
}) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          {heading}
        </h2>
        <address className="mt-4 not-italic text-[var(--color-text-body)]">
          {location.address}
        </address>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View on Map
        </a>
      </div>
    </section>
  );
}
