'use client';
import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ContactSection } from '@/components/shared/ContactSection';

interface ClassItem {
  name: string;
  day: string;
  time: string;
  instructor?: string;
  level?: string;
}

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: string[];
  popular?: boolean;
}

interface TrainerProfile {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  specialties?: string[];
}

function ClassSchedule({ classes }: { classes: ClassItem[] }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const usedDays = days.filter(d => classes.some(c => c.day === d));

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Class Schedule
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-title)]">
                  Day
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-title)]">
                  Time
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-title)]">
                  Class
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-title)]">
                  Instructor
                </th>
                <th className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-title)]">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {usedDays.map(day =>
                classes
                  .filter(c => c.day === day)
                  .map((cls, i) => (
                    <tr key={`${day}-${i}`} className="border-b border-gray-100 hover:bg-gray-50">
                      {i === 0 && (
                        <td
                          className="px-4 py-3 text-sm font-medium text-[var(--color-text-title)]"
                          rowSpan={classes.filter(c => c.day === day).length}
                        >
                          {day}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-[var(--color-text-body)]">{cls.time}</td>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-title)]">{cls.name}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-body)]">{cls.instructor || '—'}</td>
                      <td className="px-4 py-3">
                        {cls.level && (
                          <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                            {cls.level}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function MembershipCards({ memberships }: { memberships: PricingTier[] }) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)] text-center">
          Memberships
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memberships.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-xl border p-6 shadow-sm ${
                tier.popular
                  ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                  : 'border-gray-200'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-[var(--color-on-primary)]">
                  Best Value
                </span>
              )}
              <h3 className="text-xl font-semibold text-[var(--color-text-title)]">{tier.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-[var(--color-primary)]">{tier.price}</span>
                {tier.period && (
                  <span className="ml-1 text-sm text-[var(--color-text-body)] opacity-70">/{tier.period}</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text-body)]">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full min-h-[44px] rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-text)] transition hover:opacity-90">
                Join Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainerProfiles({ trainers }: { trainers: TrainerProfile[] }) {
  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Our Trainers
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              {trainer.image ? (
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-bold text-[var(--color-on-primary)]" aria-hidden="true">
                  {trainer.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-title)]">
                {trainer.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-primary)] font-medium">{trainer.role}</p>
              {trainer.bio && (
                <p className="mt-2 text-sm text-[var(--color-text-body)] opacity-70">{trainer.bio}</p>
              )}
              {trainer.specialties && trainer.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {trainer.specialties.map(s => (
                    <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-[var(--color-text-body)]">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MembershipSchedulePage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="full-bleed" />
      {content.classes && content.classes.length > 0 && (
        <ClassSchedule classes={content.classes} />
      )}
      {content.memberships && content.memberships.length > 0 && (
        <MembershipCards memberships={content.memberships} />
      )}
      {content.trainers && content.trainers.length > 0 && (
        <TrainerProfiles trainers={content.trainers} />
      )}
      <ReviewsSection reviews={content.reviews} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
