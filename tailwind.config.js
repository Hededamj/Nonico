/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#14B8A6",
          light: "#06B6D4",
        },
        background: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          card: "#1E293B",
        },
        accent: {
          DEFAULT: "#84CC16",
          warning: "#F97316",
        },
        text: {
          DEFAULT: "#FFFFFF",
          muted: "#94A3B8",
          secondary: "#CBD5E1",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
