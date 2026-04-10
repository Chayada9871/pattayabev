import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#161517",
        gold: "#b99657",
        sand: "#f6f1e8",
        wine: "#8f1d2c",
        cobalt: "#445fd0"
      },
      boxShadow: {
        card: "0 22px 60px rgba(21, 15, 10, 0.08)"
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top, rgba(185, 150, 87, 0.16), transparent 24%), linear-gradient(180deg, #fbfaf8 0%, #ffffff 100%)"
      }
    }
  },
  plugins: []
};

export default config;
