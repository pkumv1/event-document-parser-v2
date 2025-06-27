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
        'primary-dark': '#2d4a24',
        'primary-medium-dark': '#548a43',
        'primary-medium': '#73bd5d',
        'primary-bright': '#5dd468',
        'primary-light': '#BDFFC3',
      },
    },
  },
  plugins: [],
}