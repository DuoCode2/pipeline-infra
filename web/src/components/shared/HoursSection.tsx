export function HoursSection({ hours, heading = 'Hours' }: { hours: Record<string, string>; heading?: string }) {
  const entries = Object.entries(hours);
  if (entries.length === 0) return null;

  return (
    <section className="bg-[var(--color-surface)] py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-title)]">
          {heading}
        </h2>
        <dl className="mt-6 grid gap-2 max-w-md">
          {entries.map(([day, time]) => (
            <div key={day} className="flex justify-between border-b border-gray-100 py-2">
              <dt className="font-medium text-[var(--color-text-title)]">{day}</dt>
              <dd className="text-[var(--color-text-body)]">{time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
