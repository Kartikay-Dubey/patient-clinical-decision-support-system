/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        editorial: {
          bg: "#F3F7FB",
          surface: "#FFFFFF",
          surfaceMuted: "#EEF6F8",
          card: "#F8FBFC",
          border: "#D7E4EC",
          borderStrong: "#B8CDD8",
          textPrimary: "#0F172A",
          textSecondary: "#475569",
          textMuted: "#64748B",
          terracotta: "#0D9488",
          terracottaLight: "#CCFBF1",
          terracottaHover: "#0F766E",
          sage: "#22D3EE",
          sageLight: "#E0F2FE",
          sageDark: "#155E75",
          ochre: "#38BDF8",
          ochreLight: "#E0F2FE",
          blush: "#CFFAFE",
          sand: "#F0F9FF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'tablet': '0 25px 60px -15px rgba(90, 70, 60, 0.08), 0 4px 16px -2px rgba(90, 70, 60, 0.03)',
        'tablet-hover': '0 30px 70px -15px rgba(90, 70, 60, 0.12), 0 8px 24px -4px rgba(90, 70, 60, 0.05)',
        'pill': '0 3px 12px -2px rgba(90, 70, 60, 0.07)',
        'pebble': '0 8px 20px -4px rgba(130, 100, 80, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        'subtle': '0 2px 6px 0 rgba(90, 70, 60, 0.04)',
      },
    },
  },
  plugins: [],
};
