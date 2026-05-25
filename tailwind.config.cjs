// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"], // ✅ เปลี่ยน purge → content
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primaryBg: {
          light: "#ffffff",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};

