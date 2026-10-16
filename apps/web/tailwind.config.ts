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
        'surface-elevated': 'var(--surface-elevated)',
        'border-token': 'var(--border-token)',
        text: 'var(--text-token)',
        muted: 'var(--muted-token)',
        'accent-ice': 'var(--accent-ice)',
        'accent-burgundy': 'var(--accent-burgundy)',
        'accent-burgundy-glow': 'var(--accent-burgundy-glow)',
        'accent-burgundy-tint': 'var(--accent-burgundy-tint)',
        'accent-indigo': 'var(--accent-indigo)',
        'status-success': 'var(--success-token)',
        'status-warn': 'var(--warn-token)',
        'status-danger': 'var(--danger-token)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        bento: '20px',
      },
      boxShadow: {
        burgundy: '0 8px 30px rgba(109, 0, 26, 0.35)',
        glow: '0 0 20px rgba(109, 0, 26, 0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
