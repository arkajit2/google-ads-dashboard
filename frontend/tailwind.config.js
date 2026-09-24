/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: "#1a73e8",
          bluelight: "#e8f0fe",
          bluehover: "#1765cc",
          red: "#ea4335",
          green: "#34a853",
          yellow: "#fbbc04",
          gray100: "#f8f9fa",
          gray200: "#f1f3f4",
          gray300: "#dadce0",
          gray500: "#5f6368",
          gray700: "#3c4043",
          gray900: "#202124",
          border: "#dadce0"
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
