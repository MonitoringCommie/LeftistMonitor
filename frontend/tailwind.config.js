/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF5F6',
          100: '#FDEAED',
          200: '#F9C4CC',
          300: '#E8485C',
          400: '#C41E3A',
          500: '#C41E3A',
          600: '#A01830',
          700: '#8B1A1A',
          800: '#6B1015',
          900: '#4A0A0E',
        },
        gold: {
          light: '#F5DEB3',
          DEFAULT: '#D4A017',
          dark: '#8B6914',
        },
        glass: {
          bg: 'rgba(255, 245, 246, 0.95)',
          border: 'rgba(196, 30, 58, 0.2)',
        },
      },
    },
  },
  plugins: [
    // RTL support plugin
    function({ addUtilities }) {
      const rtlUtilities = {
        // Margin utilities that flip in RTL
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        // Padding utilities
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        // Text alignment that respects direction
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        // Border radius for RTL
        '.rounded-s': {
          'border-start-start-radius': '0.25rem',
          'border-end-start-radius': '0.25rem',
        },
        '.rounded-e': {
          'border-start-end-radius': '0.25rem',
          'border-end-end-radius': '0.25rem',
        },
        // Float utilities
        '.float-start': {
          'float': 'inline-start',
        },
        '.float-end': {
          'float': 'inline-end',
        },
        // Inset utilities
        '.inset-inline-start-0': {
          'inset-inline-start': '0',
        },
        '.inset-inline-end-0': {
          'inset-inline-end': '0',
        },
      };
      addUtilities(rtlUtilities);
    },
  ],
}
