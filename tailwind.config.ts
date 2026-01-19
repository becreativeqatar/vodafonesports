import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Vodafone Colors
        vodafone: {
          red: "#E60000",
          "dark-red": "#820000",
          "digital-red": "#FF0000",
          grey: "#4A4D4E",
        },
        // Secondary Palette
        secondary: {
          "red-violet": "#9C2AA0",
          aubergine: "#5E2750",
          "aqua-blue": "#00B0CA",
          turquoise: "#007C92",
          "spring-green": "#A8B400",
          "lemon-yellow": "#FECB00",
          "fresh-orange": "#EB9700",
        },
        // Semantic Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "#E60000",
          foreground: "#FFFFFF",
          hover: "#CC0000",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#E60000",
      },
      backgroundImage: {
        "vodafone-gradient": "linear-gradient(135deg, #820000 0%, #E60000 50%, #FF0000 100%)",
        "vodafone-gradient-light": "linear-gradient(135deg, #E60000 0%, #FF0000 100%)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(230, 0, 0, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(230, 0, 0, 0)" },
        },
        "highlight-fill": {
          "0%": { backgroundColor: "rgba(230, 0, 0, 0.2)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-red": "pulse-red 2s infinite",
        "highlight-fill": "highlight-fill 1s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-rtl")],
};

export default config;
