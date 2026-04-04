/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1a2a5e', 2: '#142047', 3: '#0d1535' },
        fx:    { DEFAULT: '#3ab54a', 2: '#2d9e3c', 3: '#1f7a2b' },
      },
      fontFamily: {
        condensed: ['Barlow Condensed', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
