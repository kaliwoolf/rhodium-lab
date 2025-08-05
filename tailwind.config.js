
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0b0c10",
        crimson: "#ff003c"
      },
      boxShadow: {
        neon: "0 0 10px #ff003c, 0 0 20px #ff003c"
      },
      zIndex: {
        '-50': '-50',
      },
      screens: {
        xs: '390px', // 👈 добавляем кастомный брейкпоинт
      },
    },
  },
  plugins: [],
}
