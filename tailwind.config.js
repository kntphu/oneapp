// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6b4de6',
          light: '#8b6ef0',
          dark: '#5a3dd4',
        },
        secondary: {
          DEFAULT: '#2C2C2C',
          light: '#6C6C6C',
          dark: '#1A1A1A',
        },
        accent: '#f50057',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',
        info: '#3B82F6',
        gray: {
          50: '#F8F9FA',
          100: '#F1F3F4',
          200: '#E8EAED',
          300: '#DADCE0',
          400: '#BDC1C6',
          500: '#9AA0A6',
          600: '#80868B',
          700: '#5F6368',
          800: '#3C4043',
          900: '#202124',
        }
      },
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'],
        body: ['Sarabun', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '1.5rem',
        '2xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 12px rgba(107, 77, 230, 0.25)',
        'button-action': '0 4px 12px rgba(245, 0, 87, 0.25)',
        'top-bar': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeOut: {
          'from': { opacity: '1', transform: 'translateY(0) scale(1)' },
          'to': { opacity: '0', transform: 'translateY(-10px) scale(0.98)' },
        },
        slideIn: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
  ],
}