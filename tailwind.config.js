/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: { colors: { brand: { 50: '#eefbf4', 100: '#d8f5e5', 500: '#16a36a', 600: '#118052', 700: '#0e6743' } } } },
  plugins: []
};
