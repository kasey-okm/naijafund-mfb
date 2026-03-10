/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        emerald: {
          DEFAULT: '#0D5C3A',
          mid: '#1A7A50',
          light: '#2A9B68',
          soft: '#E8F5EE',
        },
        navy: {
          DEFAULT: '#0A1628',
          mid: '#0F2040',
          light: '#1A3A60',
        },
        gold: {
          DEFAULT: '#C9941A',
          light: '#F0B429',
          soft: '#FFF8E6',
        },
        teal: '#0E7490',
        danger: '#DC2626',
        'danger-light': '#EF4444',
        warning: '#D97706',
        mfb: {
          bg: '#F4F6FA',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          text: '#1A2740',
          muted: '#64748B',
        }
      },
      boxShadow: {
        card: '0 1px 4px rgba(10,22,40,0.06), 0 4px 16px rgba(10,22,40,0.04)',
        modal: '0 24px 80px rgba(10,22,40,0.25)',
        glow: '0 0 20px rgba(13,92,58,0.15)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
