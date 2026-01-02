/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#007ACC",
        secondary: "#1E1E1E",
      },
      borderRadius: {
        button: "8px",
      },
    },
  },
  plugins: [],
}

