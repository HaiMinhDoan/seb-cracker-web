/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          50: '#F5F5F0',
          100: '#E8E8E0',
          200: '#C8C8B8',
          300: '#A0A090',
          400: '#707060',
          500: '#4A4A3A',
          600: '#2E2E20',
          700: '#1A1A10',
          800: '#111108',
          900: '#0D0D04',
        },
        acid: {
          DEFAULT: '#C8F53C',
          dark: '#9ABF20',
          light: '#E5FF80',
        },
        ember: {
          DEFAULT: '#FF5C1A',
          dark: '#CC3A00',
          light: '#FF8A5C',
        },
        frost: {
          DEFAULT: '#1AFFE4',
          dark: '#00CDB8',
          light: '#80FFF4',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-x': 'bounceX 1s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
        },
      },
    },
  },
  plugins: [],
}
