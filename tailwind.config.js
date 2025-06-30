module.exports = {
  darkMode: 'class', // ❌ удаляем data-theme
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lightBg: '#FDFCF9',
        darkBg: '#1e1e1e',
      },
    },
  },
  plugins: [],
};
