import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'border-token': 'var(--border-token)',
        text: 'var(--text-token)',
        muted: 'var(--muted-token)',
        'accent-ice': 'var(--accent-ice)',
        'accent-indigo': 'var(--accent-indigo)',
        'status-success': 'var(--success-token)',
        'status-warn': 'var(--warn-token)',
        'status-danger': 'var(--danger-token)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      borderRadius: {
        bento: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
