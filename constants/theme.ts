export const THEME_MODES = {
  DARK: 'dark',
  LIGHT: 'light'
} as const;

export type ThemeMode = typeof THEME_MODES[keyof typeof THEME_MODES];
