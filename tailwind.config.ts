import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Airtable-inspired palette
        primary: {
          DEFAULT: "#166ee0",
          hover: "#0d5ac0",
          light: "#e6f0fd",
        },
        success: {
          DEFAULT: "#2eb872",
          light: "#e6f7ef",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef3c7",
        },
        error: {
          DEFAULT: "#dc2626",
          light: "#fee2e2",
        },
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#ebebeb",
          300: "#e3e3e3",
          400: "#d1d1d1",
          500: "#999999",
          600: "#666666",
          700: "#444444",
          800: "#202020",
          900: "#111111",
        },
      },
    },
  },
  plugins: [],
};
export default config;
