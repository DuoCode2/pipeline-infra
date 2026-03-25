import type { SiteData } from '@/types/site-data';
import { Header } from '@/components/shared/Header';
import { Hero } from '@/components/shared/Hero';
import { Footer } from '@/components/shared/Footer';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { LocationSection } from '@/components/shared/LocationSection';
import { ContactSection } from '@/components/shared/ContactSection';
import { CredentialsBanner } from '@/components/shared/CredentialsBanner';
import { ServiceBrowser } from '@/components/demos/ServiceBrowser';
import { QuoteForm } from '@/components/demos/QuoteForm';
import { FAQAccordion } from '@/components/demos/FAQAccordion';

function CaseStudies({ studies }: { studies: Array<{ title: string; summary: string; result?: string; image?: string }> }) {
  return (
    <section className="bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          Case Studies
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-[var(--color-surface)] overflow-hidden shadow-sm">
              {study.image && (
                <img src={study.image} alt={study.title} className="h-48 w-full object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-title)]">{study.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-body)] opacity-70">{study.summary}</p>
                {study.result && (
                  <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
                    {study.result}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LeadTrustPage({ site, locale }: { site: SiteData; locale: string }) {
  const content = site.content[locale] || site.content[site.region.defaultLocale];
  if (!content) return null;

  return (
    <>
      <Header site={site} locale={locale} />
      <Hero site={site} content={content} heroStyle="overlay" />
      {content.credentials && content.credentials.length > 0 && (
        <CredentialsBanner credentials={content.credentials} />
      )}
      {content.services && <ServiceBrowser services={content.services} ctaText="Get Quote" />}
      <QuoteForm />
      {content.caseStudies && content.caseStudies.length > 0 && (
        <CaseStudies studies={content.caseStudies} />
      )}
      {content.faq && content.faq.length > 0 && <FAQAccordion items={content.faq} />}
      <ReviewsSection reviews={content.reviews} />
      <LocationSection location={content.location} />
      <ContactSection contact={content.contact} region={site.region} />
      <Footer site={site} content={content} />
    </>
  );
}
