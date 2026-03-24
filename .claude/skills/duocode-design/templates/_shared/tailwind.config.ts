import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'text-title': 'var(--color-text-title)',
        'text-body': 'var(--color-text-body)',
        'on-primary': 'var(--color-on-primary)',
        'on-primary-dark': 'var(--color-on-primary-dark)',
        'accent-text': 'var(--color-accent-text)',
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
