/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C63FF',
          dark: '#574BD6',
          light: '#8B82FF',
          soft: '#EDEBFF',
        },
        mint: {
          DEFAULT: '#20C9A6',
          dark: '#15A88A',
          soft: '#D6F5EC',
        },
        ink: {
          DEFAULT: '#1F2937',
          muted: '#8491A5',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: '#FEE2E2',
        },
        canvas: '#F5F7FA',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(31, 41, 55, 0.04), 0 8px 24px rgba(31, 41, 55, 0.06)',
        soft: '0 1px 3px rgba(31, 41, 55, 0.06)',
        glow: '0 8px 30px rgba(108, 99, 255, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '60%': { opacity: '1', transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0)' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out',
        'pop': 'pop 0.25s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'toast-in': 'toast-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        'check-pop': 'check-pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
