import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ContactSection } from '@/components/shared/ContactSection';

interface EventItem {
  title: string;
  date: string;
  time?: string;
  description?: string;
  location?: string;
}

interface ProgramItem {
  name: string;
  description: string;
  schedule?: string;
}

interface DonationInfo {
  url?: string;
  note?: string;
  tiers?: Array<{ amount: string; label: string }>;
}

function EventCards({ events }: { events: EventItem[] }) {
  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Upcoming Events
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-lg bg-[var(--color-primary)] p-3 text-center text-[var(--color-on-primary)]">
                  <p className="text-xs font-medium uppercase opacity-80">
                    {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                  </p>
                  <p className="text-2xl font-bold leading-tight">
                    {new Date(event.date).getDate()}
                  </p>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text-title)]">{event.title}</h3>
                  {event.time && (
                    <p className="mt-1 text-sm text-[var(--color-primary)] font-medium">{event.time}</p>
                  )}
                  {event.description && (
                    <p className="mt-2 text-sm text-[var(--color-text-body)] opacity-70">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="mt-2 text-xs text-[var(--color-text-body)] opacity-60">
                      <svg className="mr-1 inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramsList({ programs }: { programs: ProgramItem[] }) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Programs
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {programs.map((program, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-[var(--color-surface)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--color-text-title)]">{program.name}</h3>
              <p className="mt-2 text-sm text-[var(--color-text-body)] opacity-70">{program.description}</p>
              {program.schedule && (
                <p className="mt-3 text-sm font-medium text-[var(--color-primary)]">{program.schedule}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonationSection({ donations }: { donations: DonationInfo }) {
  return (
    <section className="bg-[var(--color-primary)] text-[var(--color-on-primary)] py-16 px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-display font-bold">Support Us</h2>
        {donations.note && (
          <p className="mt-4 text-lg opacity-90">{donations.note}</p>
        )}
        {donations.tiers && donations.tiers.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {donations.tiers.map((tier, i) => (
              <a
                key={i}
                href={donations.url || '#'}
                className="min-h-[44px] rounded-lg bg-white/10 px-6 py-3 text-center transition hover:bg-white/20"
              >
                <p className="text-2xl font-bold">{tier.amount}</p>
                <p className="mt-1 text-sm opacity-80">{tier.label}</p>
              </a>
            ))}
          </div>
        )}
        {donations.url && !donations.tiers?.length && (
          <a
            href={donations.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-[var(--color-accent)] px-8 py-3 text-base font-semibold text-[var(--color-accent-text)] transition hover:opacity-90"
          >
            Donate Now
          </a>
        )}
      </div>
    </section>
  );
}

export function CommunityInfoPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="overlay" />
      {content.events && content.events.length > 0 && (
        <EventCards events={content.events} />
      )}
      {content.programs && content.programs.length > 0 && (
        <ProgramsList programs={content.programs} />
      )}
      {content.donations && (
        <DonationSection donations={content.donations} />
      )}
      <ReviewsSection reviews={content.reviews} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
