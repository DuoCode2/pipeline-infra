import type { BusinessContent, SiteRegion } from '@/types/site-data';

export function ContactSection({ contact, region }: {
  contact: BusinessContent['contact'];
  region: SiteRegion;
}) {
  return (
    <section className="bg-[var(--color-primary)] text-[var(--color-on-primary)] py-16 px-6">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-3xl font-display font-bold">Get in Touch</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-base font-semibold transition hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {contact.phone}
          </a>

          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          )}

          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-base font-semibold transition hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {contact.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
