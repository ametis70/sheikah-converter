/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        120: "30rem",
      },
    },
    fontFamily: {
      sans: [
        "Roboto",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
    dropShadow: {
      glow: "0px 0px 2px #4FC0FF",
    },
    colors: {
      transparent: "transparent",
      tan: "#E2DED3",
      green: "#6BDECC",
      red: "#F15050",
      blue: "#3CD3FC",
      yellow: "#FFE460",
      dim: "rgba(0, 0, 0, 0.4)",
      scrim: "rgba(0, 0, 0, 0.6)",
      overlaydark: "rgba(0, 0, 0, 0.8)",
      overlaylight: "rgba(226, 222, 221, 0.2)",
      buttonborder: "rgba(226, 222, 211, 0.3)",
    },
    backgroundSize: {
      "1/4": "25%",
      "1/5": "20%",
    },
    fontSize: {
      base: "1.625rem",
      button: "1.875rem",
      apptitle: "2.125rem",
      dialog: "2.25rem",
      actionsubtitle: "2.375rem",
      modaltitle: "2.875rem",
      modalsubtitle: "1.75rem",
      actiontitle: "3.25rem",
    },
    plugins: [],
  },
};
