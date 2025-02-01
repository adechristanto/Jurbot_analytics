import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "corporate",
      "retro",
      "cyberpunk",
      "valentine",
      "garden",
      "forest",
      "aqua",
      "pastel",
      "fantasy",
      "dracula",
      "autumn",
      "business",
      "winter",
    ],
  },
  plugins: [require("daisyui")],
};

export default config;
