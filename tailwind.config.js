/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    fontFamily: {
      quicksand: ["Quicksand", "sans-serif"],
      montse: ["Montserrat", "sans-serif"],
    },
    extend: {
      animation: {
        slideIn: "slideIn ease-in-out 0.2s",
        slideInRight: "slideInRight ease-in 0.4s",
      },
      keyframes: {
        slideIn: {
          "0%": {
            left: "-100%",
          },
          "100%": {
            left: "0",
          },
        },
        slideInRight: {
          "0%": {
            right: "-100%",
            opacity: 0,
          },
          "100%": {
            right: "0.5rem",
            opacity: 1,
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
