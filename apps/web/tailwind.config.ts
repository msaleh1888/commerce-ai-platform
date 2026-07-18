import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-surface-application) / <alpha-value>)",
        foreground: "rgb(var(--color-text-primary) / <alpha-value>)",
        border: "rgb(var(--color-border-subtle) / <alpha-value>)",
        primary: "rgb(var(--color-accent) / <alpha-value>)",
        muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        surface: {
          application: "rgb(var(--color-surface-application) / <alpha-value>)",
          sidebar: "rgb(var(--color-surface-sidebar) / <alpha-value>)",
          raised: "rgb(var(--color-surface-raised) / <alpha-value>)",
          selected: "rgb(var(--color-surface-selected) / <alpha-value>)",
          subtle: "rgb(var(--color-surface-subtle) / <alpha-value>)",
          evidence: "rgb(var(--color-surface-evidence) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
          inverse: "rgb(var(--color-text-inverse) / <alpha-value>)",
        },
        accent: {
          deep: "rgb(var(--color-accent-deep) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          teal: "rgb(var(--color-accent-teal) / <alpha-value>)",
          soft: "rgb(var(--color-accent-soft) / <alpha-value>)",
        },
        status: {
          processing: "rgb(var(--color-status-processing) / <alpha-value>)",
          ready: "rgb(var(--color-status-ready) / <alpha-value>)",
          review: "rgb(var(--color-status-review) / <alpha-value>)",
          failed: "rgb(var(--color-status-failed) / <alpha-value>)",
          inactive: "rgb(var(--color-status-inactive) / <alpha-value>)",
        },
        "status-surface": {
          processing: "rgb(var(--color-status-processing-surface) / <alpha-value>)",
          ready: "rgb(var(--color-status-ready-surface) / <alpha-value>)",
          review: "rgb(var(--color-status-review-surface) / <alpha-value>)",
          failed: "rgb(var(--color-status-failed-surface) / <alpha-value>)",
          inactive: "rgb(var(--color-status-inactive-surface) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        raised: "var(--shadow-raised)",
        dialog: "var(--shadow-dialog)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
