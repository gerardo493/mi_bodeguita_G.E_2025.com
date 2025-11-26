/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#166534', // green-800
        secondary: '#facc15', // yellow-400
        dark: '#1f2937', // gray-800
        light: '#f3f4f6', // gray-100
      }
    },
  },
  plugins: [],
}
