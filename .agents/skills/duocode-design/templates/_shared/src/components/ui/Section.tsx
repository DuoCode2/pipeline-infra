import type { ReactNode } from 'react';

const spacingMap = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
  xl: 'py-24',
} as const;

const widthMap = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const;

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
  spacing?: keyof typeof spacingMap;
  maxWidth?: keyof typeof widthMap;
}

export default function Section({ id, className = '', children, spacing = 'lg', maxWidth = '6xl' }: SectionProps) {
  return (
    <section id={id} className={`${spacingMap[spacing]} px-4 sm:px-6 ${className}`}>
      <div className={`${widthMap[maxWidth]} mx-auto`}>{children}</div>
    </section>
  );
}
