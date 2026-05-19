/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fafa',
          100: '#d0f0f0',
          200: '#a0e0e0',
          300: '#5ec8c8',
          400: '#2aadad',
          500: '#1a9494',
          600: '#157878',
          700: '#106060',
          800: '#0b4a4a',
          900: '#073636',
        },
      },
    },
  },
  plugins: [],
}
