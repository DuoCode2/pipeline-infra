import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-accent-text)] hover:opacity-90',
  secondary: 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90',
  outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)]',
  whatsapp: 'bg-[#075E54] text-white hover:bg-[#064E47]',
  ghost: 'text-[var(--color-text-body)] hover:bg-[var(--color-primary)]/10',
} as const;

const sizes = {
  sm: 'px-4 py-1.5 text-sm min-h-[36px]',
  md: 'px-6 py-2.5 text-base min-h-[44px]',
  lg: 'px-8 py-3 text-lg min-h-[48px]',
} as const;

type ButtonBaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
};

type AsAnchor = ButtonBaseProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps>;
type AsButton = ButtonBaseProps & { href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>;

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: AsAnchor | AsButton) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${className}`;

  if ('href' in rest && rest.href) {
    const { href, ...props } = rest as AsAnchor;
    return <a href={href} className={cls} {...props}>{children}</a>;
  }
  return <button type="button" className={cls} {...(rest as AsButton)}>{children}</button>;
}
