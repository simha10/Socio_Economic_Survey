export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Colors from UI Specification
        app: {
          bg: "#0B1F33",
          surface: "#111827",
          dark: "#081625",
          darker: "#0F172A",
        },
        primary: {
          DEFAULT: "#38BDF8",
          hover: "#0EA5E9",
          light: "#7DD3FC",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        text: {
          primary: "#E5E7EB",
          muted: "#9CA3AF",
          subtle: "#6B7280",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(90deg, #38BDF8 0%, #0EA5E9 100%)",
        "gradient-app": "linear-gradient(180deg, #0B1F33 0%, #081625 100%)",
        "gradient-card": "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
    },
  },
};