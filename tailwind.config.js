/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      extend: {
        fontFamily: {
          ubuntu: ['var(--font-ubuntu)'],
          pixelify: ['var(--font-pixelify)'],
        },
      },
    },
  },
  plugins: [],
}

