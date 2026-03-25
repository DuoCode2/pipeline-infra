import type { ReactNode } from 'react';

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

const gapMap = {
  sm: 'gap-3',
  md: 'gap-5',
  lg: 'gap-8',
} as const;

interface GridProps {
  children: ReactNode;
  cols?: keyof typeof colsMap;
  gap?: keyof typeof gapMap;
  className?: string;
}

export default function Grid({ children, cols = 3, gap = 'md', className = '' }: GridProps) {
  return <div className={`grid ${colsMap[cols]} ${gapMap[gap]} ${className}`}>{children}</div>;
}
