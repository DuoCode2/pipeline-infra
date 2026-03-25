interface Credential {
  label: string;
  value: string;
  icon?: string;
}

export function CredentialsBanner({ credentials }: { credentials: Credential[] }) {
  if (!credentials || credentials.length === 0) return null;

  return (
    <section className="bg-[var(--color-primary-dark)] text-[var(--color-on-primary-dark)] py-8 px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 md:gap-12">
        {credentials.map((cred, i) => (
          <div key={i} className="flex items-center gap-3">
            {cred.icon && <span className="text-2xl" aria-hidden="true">{cred.icon}</span>}
            <div>
              <p className="text-sm font-medium opacity-80">{cred.label}</p>
              <p className="text-lg font-bold">{cred.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
