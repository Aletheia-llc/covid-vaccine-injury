/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          light: '#2d4a6f',
          dark: '#0f2a4f',
        },
        gold: {
          DEFAULT: '#c4a052',
          light: '#d4b062',
        },
      },
    },
  },
  plugins: [],
}
