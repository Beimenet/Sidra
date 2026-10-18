/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FCF8F1',
        terracotta: {
          DEFAULT: '#D9755E',
          hover: '#C5634D',
        },
        sage: '#A8B6A0',
        charcoal: '#303033',
        'warm-gray': '#77716C',
        border: '#E8DED3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
