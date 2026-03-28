import type { ReactNode } from 'react';

const variantClasses = {
  default: 'bg-[var(--color-surface)] text-[var(--color-text-body)]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
  accent: 'bg-[var(--color-accent)] text-[var(--color-accent-text)]',
} as const;

interface BadgeProps {
  children: ReactNode;
  variant?: keyof typeof variantClasses;
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
