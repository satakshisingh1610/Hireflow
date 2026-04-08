/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef3ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#8aadff',
          400: '#5686ff',
          500: '#2f62fb',
          600: '#1a45f0',
          700: '#1535dd',
          800: '#172db3',
          900: '#192b8d',
        },
      },
      boxShadow: {
        soft:  '0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)',
        hover: '0 4px 20px 0 rgb(0 0 0 / .10)',
      },
    },
  },
  plugins: [],
};
