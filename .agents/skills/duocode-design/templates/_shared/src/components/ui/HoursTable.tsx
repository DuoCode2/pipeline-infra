interface HoursTableProps {
  hours: Record<string, string>;
  className?: string;
}

export default function HoursTable({ hours, className = '' }: HoursTableProps) {
  const entries = Object.entries(hours);
  if (entries.length === 0) return null;

  return (
    <table className={`w-full text-sm ${className}`}>
      <tbody>
        {entries.map(([day, time]) => (
          <tr key={day} className="border-b border-[var(--color-primary)]/5 last:border-0">
            <td className="py-2 font-medium text-[var(--color-text-title)]">{day}</td>
            <td className="py-2 text-right text-[var(--color-text-body)]">{time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
