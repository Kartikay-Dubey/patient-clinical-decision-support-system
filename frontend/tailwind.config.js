/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        editorial: {
          bg: "#FBF9F5",
          surface: "#FFFFFF",
          surfaceMuted: "#F5F1EB",
          card: "#FCFAF7",
          border: "#EAE3D9",
          borderStrong: "#DDD4C7",
          textPrimary: "#2D2623",
          textSecondary: "#5E524C",
          textMuted: "#8E8078",
          terracotta: "#D97757",
          terracottaLight: "#F7D6CC",
          terracottaHover: "#C46344",
          sage: "#8AAEA1",
          sageLight: "#E5EFEA",
          sageDark: "#3F6457",
          ochre: "#D6B87E",
          ochreLight: "#F8F3E5",
          blush: "#F9DDD6",
          sand: "#EFE6DA",
        }
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
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      }
    },
  },
  plugins: [],
}


