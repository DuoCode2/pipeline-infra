import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

export function Specialties({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const theme = business.theme;
  const specialties = (content as any).specialties || [];

  return (
    <section className="py-16 px-4" style={{ backgroundColor: theme.surface }}>
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-8 text-center font-display text-3xl font-bold" style={{ color: theme.primary }}>
          {locale === 'ms' ? 'Kepakaran Kami' : locale.startsWith('zh') ? '我们的专科' : 'Our Specialties'}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {specialties.map((spec: any, i: number) => (
            <div key={i} className="rounded-lg border p-6 text-center transition-shadow hover:shadow-lg" style={{ borderColor: theme.accent }}>
              <div className="mb-3 text-4xl">{spec.icon || '🏥'}</div>
              <h3 className="mb-2 font-display text-lg font-semibold" style={{ color: theme.primaryDark }}>{spec.name}</h3>
              <p className="text-sm" style={{ color: theme.textBody }}>{spec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
