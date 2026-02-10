import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0099cc",
        "primary-dark": "#007aa3",
        navy: "#1a202c",
        surface: "#f7fafc",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-playfair)", "serif"],
        logo: ["var(--font-bebas)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
