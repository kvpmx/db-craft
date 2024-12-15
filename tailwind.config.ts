import animate from 'tailwindcss-animate';
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx,vue}',
    './layouts/**/*.{ts,tsx,vue}',
    './pages/**/*.{ts,tsx,vue}',
    './app.vue',
    './error.vue',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        auth: 'url(/images/auth-page-background.png)',
      },
      screens: {
        'sm-tablet': '670px',
      },
    },
  },
  plugins: [animate],
};

export default config;
