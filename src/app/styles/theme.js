import { createTheme, DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";

const themeOverride = createTheme({
  primaryColor: "brand",
  fontFamily: '"Helvetica Neue", Arial, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", monospace',

  colors: {
    brand: [
      "oklch(95% 0.02 260)",
      "oklch(90% 0.05 260)",
      "oklch(80% 0.10 260)",
      "oklch(70% 0.15 260)",
      "oklch(65% 0.18 260)",
      "oklch(62.3% 0.214 259.815)", // 5 - Brand Base
      "oklch(62.3% 0.214 259.815)", // 6 - Mantine Primary Default
      "oklch(48.8% 0.243 264.376)", // 7 - Brand Hover
      "oklch(39.8% 0.195 277.366)", // 8 - Brand Background
      "oklch(30% 0.15 280)",
    ],

    danger: DEFAULT_THEME.colors.red,
    success: DEFAULT_THEME.colors.teal,
    warning: DEFAULT_THEME.colors.yellow,
    info: DEFAULT_THEME.colors.cyan,
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);

export const resolver = () => ({
  dark: {
    "--mantine-color-body": "oklch(20.8% 0.042 265.755)",
    "--mantine-bg-card": "oklch(27.9% 0.041 260.031)",
    "--mantine-bg-input": "oklch(37.2% 0.044 257.287)",
    "--mantine-bg-hover": "oklch(44.6% 0.043 257.281)",
    "--mantine-color-text": "oklch(98.4% 0.003 247.858)",
    "--mantine-color-placeholder": "oklch(70.4% 0.04 256.788)",
  },
});
