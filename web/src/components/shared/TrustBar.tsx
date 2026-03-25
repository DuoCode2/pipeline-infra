interface TrustBarItem {
  icon: string;
  label: string;
  value: string;
}

export function TrustBar({ items }: { items: TrustBarItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="border-b border-gray-100 bg-white py-6 px-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 md:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-center">
            <span className="text-2xl" aria-hidden="true">{item.icon}</span>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-title)]">{item.value}</p>
              <p className="text-xs text-[var(--color-text-body)] opacity-70">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
