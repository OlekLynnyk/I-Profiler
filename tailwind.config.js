/* eslint-env node */
/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lightBg: '#FDFCF9',
        darkBg: '#1e1e1e',
      },
      fontFamily: {
        monoBrand: ['var(--font-azeret)'],
      },
      letterSpacing: {
        tightish: '-0.005em',
        figma: '0.02em', // если по макету нужен легкий positive tracking
      },
    },
  },
  plugins: [
    // utility для small-caps
    function ({ addUtilities }) {
      addUtilities({
        '.small-caps': { 'font-variant-caps': 'small-caps' },
        '.uppercase-true': { 'text-transform': 'uppercase', 'font-variant-caps': 'normal' },
      });
    },
  ],
};
