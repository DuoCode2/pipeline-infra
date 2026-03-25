import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { HoursSection } from '@/components/shared/HoursSection';
import { LocationSection } from '@/components/shared/LocationSection';
import { ContactSection } from '@/components/shared/ContactSection';
import { ServiceBrowser } from '@/components/demos/ServiceBrowser';
import { FAQAccordion } from '@/components/demos/FAQAccordion';

function StaffGrid({ staff }: { staff: Array<{ name: string; role: string; image?: string; bio?: string; specialties?: string[] }> }) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Our Team
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-[var(--color-surface)] p-6 text-center shadow-sm">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-bold text-[var(--color-on-primary)]" aria-hidden="true">
                  {member.name.charAt(0)}
                </div>
              )}
              <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-title)]">
                {member.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-primary)] font-medium">{member.role}</p>
              {member.bio && (
                <p className="mt-2 text-sm text-[var(--color-text-body)] opacity-70">{member.bio}</p>
              )}
              {member.specialties && member.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {member.specialties.map(s => (
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

export function BookingServicesPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="split" />
      {content.services && <ServiceBrowser services={content.services} />}
      {content.staff && content.staff.length > 0 && <StaffGrid staff={content.staff} />}
      <ReviewsSection reviews={content.reviews} />
      {content.faq && content.faq.length > 0 && <FAQAccordion items={content.faq} />}
      <HoursSection hours={content.hours} />
      <LocationSection location={content.location} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
