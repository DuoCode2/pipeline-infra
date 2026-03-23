import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './output/**/src/**/*.{ts,tsx}',
    './.claude/skills/**/templates/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'text-title': 'var(--color-text-title)',
        'text-body': 'var(--color-text-body)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
