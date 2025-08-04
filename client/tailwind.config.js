/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#E6F4FF",
          100: "#CCE9FF",
          200: "#99D3FF",
          300: "#66BDFF",
          400: "#33A7FF",
          500: "#1890FF", // Primary blue
          600: "#1570EF", // Darker shade for hover
          700: "#0D6EFD", // Even darker for active states
          800: "#0056CC",
          900: "#003D99",
        },
        blue: {
          50: "#E6F4FF",
          100: "#CCE9FF",
          200: "#99D3FF",
          300: "#66BDFF",
          400: "#33A7FF",
          500: "#1890FF", // Primary blue
          600: "#1570EF", // Darker shade for hover
          700: "#0D6EFD", // Even darker for active states
          800: "#0056CC",
          900: "#003D99",
        },
      },
    },
  },
  plugins: [],
};
