import { business } from '@/data/business';
import { type Locale } from '@/lib/i18n';

const ICON_PATHS: Record<string, { d: string; fill?: boolean }> = {
  star:      { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', fill: true },
  users:     { d: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  'map-pin': { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z' },
  clock:     { d: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2' },
  award:     { d: 'M12 15a7 7 0 100-14 7 7 0 000 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12' },
  shield:    { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  phone:     { d: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z' },
};

function TrustIcon({ name, color }: { name: string; color: string }) {
  const icon = ICON_PATHS[name];
  if (icon) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 flex-shrink-0"
        fill={icon.fill ? 'currentColor' : 'none'}
        stroke={icon.fill ? 'none' : 'currentColor'}
        strokeWidth={icon.fill ? undefined : 2}
        strokeLinecap="round" strokeLinejoin="round"
        style={{ color }}
      >
        <path d={icon.d} />
      </svg>
    );
  }
  return <span className="text-2xl">{name}</span>;
}

export function TrustBar({ locale }: { locale: Locale }) {
  const content = business.content[locale];
  const { theme } = business;

  if (!content.trustBar?.items?.length) return null;

  return (
    <section className="border-b border-gray-100 py-6" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6">
        {content.trustBar.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <TrustIcon name={item.icon} color={theme.primary} />
            <div>
              <div className="text-lg font-bold" style={{ color: theme.textTitle }}>
                {item.value}
              </div>
              <div className="text-xs" style={{ color: theme.textBody }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
