/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF7A00',
        'primary-light': '#FFA64D',
        'primary-dark': '#CC6200',
        secondary: '#005BBB',
        'gray-light': '#F5F5F5',
      },
    },
  },
  plugins: [],
} 