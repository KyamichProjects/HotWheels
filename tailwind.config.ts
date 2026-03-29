import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        warm: {
          sand: "#f7ecdf",
          clay: "#d96f4a",
          copper: "#b54b2f",
          ink: "#221815",
          olive: "#5b6045"
        }
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"]
      },
      boxShadow: {
        float: "0 25px 60px -25px rgba(50, 24, 12, 0.28)",
        card: "0 20px 45px -22px rgba(40, 22, 14, 0.18)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up": "fade-up 700ms ease-out both",
        shimmer: "shimmer 2.5s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
