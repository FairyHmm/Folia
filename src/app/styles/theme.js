import { createTheme, DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";

const themeOverride = createTheme({
  fontFamily: '"Helvetica Neue", Arial, -apple-system, sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", monospace',

  colors: {
    dark: [
      "oklch(96% 0.035 245)",
      "oklch(88% 0.055 248)",
      "oklch(76% 0.075 250)",
      "oklch(62% 0.090 255)",
      "oklch(48% 0.115 270)",
      "oklch(36% 0.130 285)",
      "oklch(24% 0.125 295)",
      "oklch(16% 0.110 300)",
      "oklch(12% 0.100 302)",
      "oklch(8% 0.085 305)",
    ],

    danger: DEFAULT_THEME.colors.red,
    success: DEFAULT_THEME.colors.teal,
    warning: DEFAULT_THEME.colors.yellow,
    info: DEFAULT_THEME.colors.cyan,
  },
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);

export const resolver = () => ({
  variables: {},
  light: {},
  dark: {},
});
