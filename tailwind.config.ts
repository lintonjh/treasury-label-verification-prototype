import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        treasury: {
          ink: "#17202a",
          blue: "#24496f",
          green: "#2f6b4f",
          gold: "#b88a2d",
          red: "#9d2f2f",
          paper: "#f6f4ef"
        }
      }
    }
  },
  plugins: []
};

export default config;
