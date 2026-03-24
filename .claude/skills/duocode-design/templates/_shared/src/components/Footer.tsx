import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Footer({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;

  return (
    <footer
      className="py-12"
      style={{ backgroundColor: theme.primaryDark, color: '#FFFFFF' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 font-display text-lg font-bold">
              {content.meta.title}
            </h3>
            <p className="text-sm text-white/70">{content.meta.description}</p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              {locale === 'ms' ? 'Hubungi' : locale.startsWith('zh') ? '联系方式' : 'Contact'}
            </h4>
            <p className="text-sm text-white/70">{content.contact.phone}</p>
            {content.contact.email && (
              <p className="text-sm text-white/70">{content.contact.email}</p>
            )}
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              {locale === 'ms' ? 'Lokasi' : locale.startsWith('zh') ? '地址' : 'Address'}
            </h4>
            <p className="text-sm text-white/70">{content.location.address}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} {content.meta.title}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
