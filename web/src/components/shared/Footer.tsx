import type { SiteData, BusinessContent } from '@/types/site-data';

export function Footer({ site, content }: { site: SiteData; content: BusinessContent }) {
  return (
    <footer className="bg-[var(--color-primary-dark)] text-[var(--color-on-primary-dark)]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-display font-semibold">{site.businessName}</h3>
            <p className="mt-2 text-sm opacity-80">{content.meta.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider opacity-60">Contact</h4>
            <p className="mt-2">{content.contact.phone}</p>
            {content.contact.email && <p className="mt-1 text-sm">{content.contact.email}</p>}
            {content.contact.whatsapp && (
              <a href={`https://wa.me/${content.contact.whatsapp}`} className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline">
                WhatsApp
              </a>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider opacity-60">Address</h4>
            <p className="mt-2 text-sm">{content.location.address}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm opacity-60">
          © {new Date().getFullYear()} {site.businessName}. Powered by DuoCode.
        </div>
      </div>
    </footer>
  );
}
