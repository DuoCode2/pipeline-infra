import type { BusinessContent } from '@/types/site-data';

export function CredentialsBanner({ credentials }: { credentials: NonNullable<BusinessContent['credentials']> }) {
  if (!credentials?.length) return null;
  return (
    <section className="py-8 bg-[var(--color-primary)]/5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap justify-center gap-8">
          {credentials.map((cred, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {cred.icon && <span className="text-[var(--color-primary)]">{cred.icon === 'shield' ? '\uD83D\uDEE1\uFE0F' : cred.icon === 'award' ? '\uD83C\uDFC6' : cred.icon === 'clock' ? '\uD83D\uDD52' : '\u2713'}</span>}
              <span className="font-semibold text-[var(--color-text-title)]">{cred.value}</span>
              <span className="text-[var(--color-text-body)] opacity-70">{cred.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
