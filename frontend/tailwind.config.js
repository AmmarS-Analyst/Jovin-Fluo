/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional Enterprise Color Palette
        bg: {
          light: '#D9BFA0',  // Light beige background
          medium: '#A69677',  // Medium tan background
        },
        primary: {
          dark: '#403B33',    // Dark brown for buttons/components
          light: '#BF8A49',   // Golden brown for secondary buttons
        },
        accent: {
          selected: '#0D0D0D', // Black for selected outlines
        },
      },
    },
  },
  plugins: [],
}
